import json
import asyncio
import os
import httpx
from typing import Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, Query
from playwright.async_api import async_playwright, BrowserContext, Page, Route

BASE_URL = "https://kisskh.do"
IS_HEADLESS = os.environ.get("HEADLESS", "true").lower() == "true"

class KissKHExtractor:
    def __init__(self):
        self.playwright = None
        self.context: Optional[BrowserContext] = None
        self.base_page: Optional[Page] = None
        
        self.ad_domains = [
            "doubleclick.net", "adservice.google", "popads.net", 
            "propellerads", "exoclick", "ad-score", "clck.ru", 
            "okx.com", "yandex", "mc.yandex.ru", "onclck.com", "bebi.com",
            "google-analytics.com", "googletagmanager.com"
        ]

    async def start(self):
        self.playwright = await async_playwright().start()
        user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        
        self.context = await self.playwright.chromium.launch_persistent_context(
            user_data_dir="./kisskh_browser_data",
            headless=IS_HEADLESS,
            user_agent=user_agent,
            viewport={"width": 1280, "height": 720},
            ignore_https_errors=True,
            # proxy={
            #     "server": "http://38.154.203.95:5863",
            #     "username": "vdzrywud",
            #     "password": "6ucxlqqfvcj5"
            # },
            args=[
                "--disable-blink-features=AutomationControlled",
                "--disable-infobars",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-extensions",
                "--disable-popup-blocking",
            ]
        )

        await self.context.add_init_script("""
            window.open = function() { console.log('Popup blocked'); return null; };
        """)
        
        await self.context.route("**/*", self._intercept_ads)
        
        self.base_page = await self.context.new_page()
        try:
            print("Connecting to KissKH and securing Cloudflare clearance...")
            await self.base_page.goto(BASE_URL, wait_until="domcontentloaded", timeout=45000)
            
            for _ in range(6):
                title = await self.base_page.title()
                if "Just a moment" in title or "Cloudflare" in title:
                    print("Cloudflare verification active, Waiting 5s...")
                    await self.base_page.mouse.move(100, 100)
                    await self.base_page.mouse.down()
                    await self.base_page.mouse.up()
                    await self.base_page.wait_for_timeout(5000)
                else:
                    print("Cloudflare Bypassed Successfully! Environment is ready.")
                    break
        except Exception as e:
            print(f"Initial setup timeout: {e}")

    async def _intercept_ads(self, route: Route):
        url = route.request.url.lower()
        if any(ad in url for ad in self.ad_domains):
            await route.abort()
            return
        if url.endswith(".ts"):
            await route.abort()
            return
        await route.continue_()

    async def stop(self):
        if self.base_page: await self.base_page.close()
        if self.context: await self.context.close()
        if self.playwright: await self.playwright.stop()

    async def _fetch_api(self, path: str):
        """Generic helper to call any KissKH API endpoint via browser page context (has Cloudflare cookies)."""
        return await self.base_page.evaluate(f"""async () => {{
            const res = await fetch(window.location.origin + "{path}", {{
                headers: {{ "accept": "application/json" }}
            }});
            return await res.json();
        }}""")

    async def search(self, query: str):
        return await self._fetch_api(f"/api/DramaList/Search?q={query}&type=0")

    async def get_drama_info(self, drama_id: str):
        return await self._fetch_api(f"/api/DramaList/Drama/{drama_id}?isq=false")

    async def get_drama_list(
        self,
        page: int = 1,
        drama_type: int = 0,
        sub: int = 0,
        country: int = 0,
        status: int = 0,
        order: int = 0,
        page_size: int = 20,
    ):
        """
        drama_type : 0=All, 1=Korean, 2=Chinese, 3=Japanese, 4=Thai, 5=Other
        sub        : 0=All, 1=Sub, 2=Raw
        country    : 0=All, 1=Korea, 2=China, 3=Japan, 4=Thailand, 5=Other
        status     : 0=All, 1=Ongoing, 2=Completed
        order      : 0=Default, 1=Popular, 2=Updated, 3=New, 4=Year, 5=A-Z
        """
        path = (
            f"/api/DramaList/List"
            f"?page={page}&type={drama_type}&sub={sub}"
            f"&country={country}&status={status}&order={order}&pageSize={page_size}"
        )
        return await self._fetch_api(path)

    async def get_episode_stream(self, episode_id: str, max_retries: int = 3):
        for attempt in range(max_retries):
            page = await self.context.new_page()

            captured_stream = None
            captured_stream_url = None
            sniffed_subtitles = []
            sniffed_kkey = None

            async def on_response(response):
                nonlocal captured_stream, captured_stream_url, sniffed_subtitles, sniffed_kkey
                url_lower = response.url.lower()

                if f"/episode/{episode_id}" in url_lower and "kkey=" in url_lower:
                    captured_stream_url = response.url
                    try:
                        sniffed_kkey = response.url.split("kkey=")[1].split("&")[0]
                    except:
                        pass
                    try:
                        if response.status == 200:
                            captured_stream = await response.json()
                    except:
                        pass

                if (url_lower.endswith(".en.srt") or url_lower.endswith(".en.vtt")
                        or (".srt" in url_lower and "sub" in url_lower)
                        or (".vtt" in url_lower and "sub" in url_lower)):
                    lang = "English" if ".en." in url_lower else "Unknown"
                    sniffed_subtitles.append({
                        "file": response.url,
                        "label": lang,
                        "kind": "captions"
                    })

                if f"/api/sub/{episode_id}" in url_lower:
                    try:
                        if response.status == 200:
                            data = await response.json()
                            if isinstance(data, list) and len(data) > 0:
                                sniffed_subtitles = data
                    except:
                        pass

            page.on("response", on_response)

            async def mock_drama_response(route: Route):
                try:
                    resp = await route.fetch()
                    data = await resp.json()
                    if "episodes" in data and len(data["episodes"]) > 0:
                        data["episodes"][0]["id"] = int(episode_id)
                        data["episodes"][0]["sub"] = 1
                    else:
                        data["episodes"] = [{"id": int(episode_id), "number": 1, "sub": 1}]
                    await route.fulfill(
                        status=200,
                        content_type="application/json",
                        body=json.dumps(data)
                    )
                except:
                    await route.continue_()

            await page.route("**/api/DramaList/Drama/*", mock_drama_response)

            try:
                watch_url = f"{BASE_URL}/Drama/Bypass/Episode-1?id=1124&ep={episode_id}&pn=1"
                await page.goto(watch_url, wait_until="domcontentloaded", timeout=25000)

                for _ in range(5):
                    title = await page.title()
                    if "Just a moment" in title or "Cloudflare" in title:
                        await page.mouse.move(100, 100)
                        await page.mouse.down()
                        await page.mouse.up()
                        await page.wait_for_timeout(3000)
                    else:
                        break

                for _ in range(40):
                    if captured_stream is not None:
                        break
                    await asyncio.sleep(0.5)

                if not captured_stream:
                    await page.close()
                    await asyncio.sleep(1.5)
                    continue

                # Wait for subtitle network traffic to complete
                await asyncio.sleep(2)

                captured_sub = []

                # Method 1: Already sniffed /api/Sub/ from network (best)
                if sniffed_subtitles:
                    captured_sub = sniffed_subtitles

                # Method 2: Call subtitle API via page context (has Cloudflare cookies)
                if not captured_sub and sniffed_kkey:
                    try:
                        sub_data = await page.evaluate(f"""async () => {{
                            const res = await fetch('/api/Sub/{episode_id}?kkey={sniffed_kkey}', {{
                                headers: {{ 'accept': 'application/json' }}
                            }});
                            if (!res.ok) return null;
                            return await res.json();
                        }}""")
                        if isinstance(sub_data, list) and len(sub_data) > 0:
                            captured_sub = sub_data
                    except Exception as e:
                        print("Subtitle page.evaluate error:", e)

                # Method 3: Embedded in stream JSON
                if not captured_sub:
                    if isinstance(captured_stream, dict):
                        for key in ["Subtitles", "subtitles", "Tracks", "tracks"]:
                            if key in captured_stream and captured_stream[key]:
                                captured_sub = captured_stream[key]
                                break

                await page.close()

                return {
                    "episode_id": episode_id,
                    "stream": captured_stream,
                    "subtitles": captured_sub if captured_sub else []
                }

            except Exception as e:
                print(f"Attempt {attempt + 1} crashed:", e)
                await page.close()
                await asyncio.sleep(1.5)

        return {"error": f"Failed after {max_retries} attempts", "status": 403}


# ─────────────────────────────────────────────
#  Keep-alive (Render free tier anti-sleep)
# ─────────────────────────────────────────────
async def keep_alive():
    await asyncio.sleep(30)  # wait for server to fully boot
    port = int(os.environ.get("PORT", 8000))
    url = f"http://localhost:{port}/"
    while True:
        try:
            async with httpx.AsyncClient() as client:
                await client.get(url, timeout=10)
            print("Keep-alive ping ✓")
        except Exception as e:
            print(f"Keep-alive ping failed: {e}")
        await asyncio.sleep(300)  # every 5 minutes


kisskh = KissKHExtractor()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await kisskh.start()
    asyncio.create_task(keep_alive())
    yield
    await kisskh.stop()

app = FastAPI(title="KissKH Universal Extractor API", lifespan=lifespan)


# ─────────────────────────────────────────────
#  Root
# ─────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "KissKH Active. Engine operating cleanly via Main IO Pool!"}


# ─────────────────────────────────────────────
#  Search
# ─────────────────────────────────────────────
@app.get("/search")
async def api_search(q: str):
    return await kisskh.search(q)


# ─────────────────────────────────────────────
#  Drama info
# ─────────────────────────────────────────────
@app.get("/info/{drama_id}")
async def api_info(drama_id: str):
    return await kisskh.get_drama_info(drama_id)


# ─────────────────────────────────────────────
#  Stream resolver
# ─────────────────────────────────────────────
@app.get("/resolve/{episode_id}")
async def api_resolve(episode_id: str):
    return await kisskh.get_episode_stream(episode_id)


# ─────────────────────────────────────────────
#  Home endpoints
# ─────────────────────────────────────────────
@app.get("/home/latest")
async def api_latest(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=40)
):
    """Latest updated dramas."""
    return await kisskh.get_drama_list(page=page, order=2, status=0, page_size=page_size)


@app.get("/home/popular")
async def api_popular(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=40)
):
    """Most popular dramas."""
    return await kisskh.get_drama_list(page=page, order=1, status=0, page_size=page_size)


@app.get("/home/new")
async def api_new(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=40)
):
    """Newly added dramas."""
    return await kisskh.get_drama_list(page=page, order=3, status=0, page_size=page_size)


@app.get("/home/ongoing")
async def api_ongoing(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=40),
    country: int = Query(0, ge=0, le=5, description="0=All 1=Korea 2=China 3=Japan 4=Thailand 5=Other")
):
    """Currently airing dramas."""
    return await kisskh.get_drama_list(page=page, status=1, order=2, country=country, page_size=page_size)


@app.get("/home/completed")
async def api_completed(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=40),
    country: int = Query(0, ge=0, le=5, description="0=All 1=Korea 2=China 3=Japan 4=Thailand 5=Other")
):
    """Completed dramas."""
    return await kisskh.get_drama_list(page=page, status=2, order=1, country=country, page_size=page_size)


# ─────────────────────────────────────────────
#  Full browse (all filters)
# ─────────────────────────────────────────────
@app.get("/browse")
async def api_browse(
    page: int = Query(1, ge=1),
    type: int = Query(0, ge=0, le=5, description="0=All 1=Korean 2=Chinese 3=Japanese 4=Thai 5=Other"),
    sub: int = Query(0, ge=0, le=2, description="0=All 1=Sub 2=Raw"),
    country: int = Query(0, ge=0, le=5, description="0=All 1=Korea 2=China 3=Japan 4=Thailand 5=Other"),
    status: int = Query(0, ge=0, le=2, description="0=All 1=Ongoing 2=Completed"),
    order: int = Query(0, ge=0, le=5, description="0=Default 1=Popular 2=Updated 3=New 4=Year 5=A-Z"),
    page_size: int = Query(20, ge=1, le=40)
):
    """Full browse — all filters exposed."""
    return await kisskh.get_drama_list(
        page=page, drama_type=type, sub=sub,
        country=country, status=status, order=order, page_size=page_size
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    script_name = os.path.splitext(os.path.basename(__file__))[0]
    uvicorn.run(f"{script_name}:app", host="0.0.0.0", port=port, workers=1)