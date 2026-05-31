import json
import asyncio
import os
import time
import urllib.parse
import httpx
from typing import Optional, Any
from contextlib import asynccontextmanager
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from playwright.async_api import async_playwright, Browser, BrowserContext, Page, Route

# Force rebuild: v2

BASE_URL = "https://kisskh.do/api"
WEB_URL = "https://kisskh.do"
IS_HEADLESS = os.environ.get("HEADLESS", "true").lower() == "true"
CACHE_TTL = 60
api_cache: dict[str, tuple[float, Any]] = {}
last_fetch_debug: dict[str, Any] = {
    "last_url": None,
    "homepage_init": None,
    "direct_fetch": None,
    "playwright_start": None,
    "playwright_fetch": None,
    "timestamp": None,
}
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Referer": "https://kisskh.do/",
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Language": "en-US,en;q=0.9",
    "X-Requested-With": "XMLHttpRequest",
    "Origin": "https://kisskh.do",
    "Connection": "keep-alive",
    "Cache-Control": "max-age=0",
    "DNT": "1",
    "Sec-CH-UA": '"Chromium";v="126", "Microsoft Edge";v="126", ";Not A Brand";v="99"',
    "Sec-CH-UA-Mobile": "?0",
    "Sec-CH-UA-Platform": '"Windows"',
}
HOME_HEADERS = {
    "User-Agent": HEADERS["User-Agent"],
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": HEADERS["Accept-Language"],
    "Referer": "https://kisskh.do/",
    "Upgrade-Insecure-Requests": "1",
    "Pragma": "no-cache",
    "Cache-Control": "max-age=0",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-site",
    "Sec-Fetch-User": "?1",
    "Sec-CH-UA": HEADERS["Sec-CH-UA"],
    "Sec-CH-UA-Mobile": HEADERS["Sec-CH-UA-Mobile"],
    "Sec-CH-UA-Platform": HEADERS["Sec-CH-UA-Platform"],
}

class KissKHExtractor:
    def __init__(self):
        self.playwright = None
        self.browser: Optional[Browser] = None
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

        self.browser = await self.playwright.chromium.launch(
            headless=IS_HEADLESS,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--disable-infobars",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-extensions",
                "--disable-popup-blocking",
            ],
        )
        self.context = await self.browser.new_context(
            user_agent=user_agent,
            viewport={"width": 1280, "height": 720},
            ignore_https_errors=True,
        )

        await self.context.add_init_script("""
            window.open = function() { console.log('Popup blocked'); return null; };
        """)
        
        await self.context.route("**/*", self._intercept_ads)
        
        self.base_page = await self.context.new_page()
        try:
            print("Connecting to KissKH and securing Cloudflare clearance...")
            await self.base_page.goto(WEB_URL, wait_until="domcontentloaded", timeout=45000)
            
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
        if self.browser: await self.browser.close()
        if self.playwright: await self.playwright.stop()

    async def ensure_started(self):
        if self.playwright and self.context and self.base_page:
            return
        try:
            await self.start()
        except Exception as e:
            print(f"Playwright start failed during fallback: {e}")
            raise

    async def browser_fetch_api(self, url: str):
        if not self.context:
            raise RuntimeError("Playwright context is not available for browser fetch")

        page = await self.context.new_page()
        try:
            await page.goto(WEB_URL, wait_until="domcontentloaded", timeout=30000)
            for _ in range(6):
                title = await page.title()
                if "Just a moment" in title or "Cloudflare" in title:
                    print("Cloudflare verification active during browser fetch, waiting 5s...")
                    await page.mouse.move(100, 100)
                    await page.mouse.down()
                    await page.mouse.up()
                    await page.wait_for_timeout(5000)
                else:
                    break

            result = await page.evaluate(
                "async (apiUrl) => {"
                "  const res = await fetch(apiUrl, { headers: {"
                "    'Accept': 'application/json, text/javascript, */*; q=0.01',"
                "    'X-Requested-With': 'XMLHttpRequest',"
                "    'Referer': 'https://kisskh.do/',"
                "    'Origin': 'https://kisskh.do',"
                "    'Accept-Language': 'en-US,en;q=0.9'"
                "  }, credentials: 'include' });"
                "  return { status: res.status, text: await res.text() };"
                "}",
                url,
            )
            return result
        finally:
            await page.close()

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
                watch_url = f"{WEB_URL}/Drama/Bypass/Episode-1?id=1124&ep={episode_id}&pn=1"
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

                await asyncio.sleep(2)

                captured_sub = []
                if sniffed_subtitles:
                    captured_sub = sniffed_subtitles

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

async def fetch_kisskh_api(path: str):
    url = f"{BASE_URL}{path}"
    now = time.time()
    cached = api_cache.get(path)
    if cached and now - cached[0] < CACHE_TTL:
        return cached[1]

    last_fetch_debug.update({
        "last_url": url,
        "timestamp": now,
        "homepage_init": None,
        "direct_fetch": None,
        "playwright_start": None,
        "playwright_fetch": None,
    })

    last_error = None
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=20.0) as client:
            print(f"Initializing KissKH session via homepage: {WEB_URL}")
            home_resp = await client.get(WEB_URL, headers=HOME_HEADERS)
            last_fetch_debug["homepage_init"] = {
                "status_code": home_resp.status_code,
                "content_type": home_resp.headers.get("content-type"),
                "url": str(home_resp.url),
                "body_snippet": home_resp.text[:320],
            }
            print(f"Homepage init status: {home_resp.status_code}")

            if home_resp.status_code != 200:
                raise RuntimeError(f"Homepage init returned {home_resp.status_code}")

            print(f"Fetching KissKH directly: {url}")
            response = await client.get(url, headers=HEADERS)
            last_fetch_debug["direct_fetch"] = {
                "status_code": response.status_code,
                "content_type": response.headers.get("content-type"),
                "url": str(response.url),
                "body_snippet": response.text[:320],
            }
            response.raise_for_status()
            actual_data = response.json()
            api_cache[path] = (now, actual_data)
            print(f"Direct fetch successful: {path}")
            return actual_data
    except Exception as e:
        last_error = str(e)
        last_fetch_debug["direct_fetch"] = {
            "status_code": getattr(e, "response", None) and getattr(e.response, "status_code", None),
            "error": last_error,
        }
        print(f"Direct fetch failed: {last_error}")

    try:
        print("Attempting browser-based fallback via Playwright...")
        last_fetch_debug["playwright_start"] = {"attempted": True, "error": None}
        await kisskh.ensure_started()
        last_fetch_debug["playwright_start"]["status"] = "started"
    except Exception as e:
        last_fetch_debug["playwright_start"]["error"] = str(e)
        print(f"Playwright startup failed: {e}")

    if kisskh.base_page and kisskh.context:
        try:
            print(f"Fallback: Using Playwright browser fetch: {url}")
            last_fetch_debug["playwright_fetch"] = {"attempted": True, "status_code": None, "error": None}
            result = await kisskh.browser_fetch_api(url)
            last_fetch_debug["playwright_fetch"]["status_code"] = result.get("status")
            if result.get("status") != 200:
                last_fetch_debug["playwright_fetch"]["error"] = f"Browser fetch returned {result.get('status')}"
                raise RuntimeError(f"Browser fetch failed ({result.get('status')}): {result.get('text')}")

            actual_data = json.loads(result["text"])
            api_cache[path] = (now, actual_data)
            print(f"Playwright browser fetch successful: {path}")
            return actual_data
        except Exception as e:
            last_error = str(e)
            last_fetch_debug["playwright_fetch"]["error"] = last_error
            print(f"Playwright browser fetch failed: {last_error}")

    return {
        "error": f"All fetch methods failed for {url}. Last error: {last_error}",
        "status": 503,
        "debug": last_fetch_debug,
    }

async def keep_alive():
    await asyncio.sleep(30)
    port = int(os.environ.get("PORT", 8000))
    url = f"http://localhost:{port}/"
    while True:
        try:
            async with httpx.AsyncClient() as client:
                await client.get(url, timeout=10)
            print("Keep-alive ping ✓")
        except Exception as e:
            print(f"Keep-alive ping failed: {e}")
        await asyncio.sleep(300)

kisskh = KissKHExtractor()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Only start Playwright if headless/vps hosting supports it, otherwise fail gracefully
    try:
        await kisskh.start()
        print("Playwright engine started successfully (local development fallback).")
    except Exception as e:
        print(f"Playwright start skipped or failed: {e}. Playwright endpoints will fall back to environment key mode.")
    
    asyncio.create_task(keep_alive())
    yield
    try:
        await kisskh.stop()
    except Exception:
        pass

app = FastAPI(title="KissKH Direct High-Speed Extractor API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # use your frontend domain instead of * for production to tighten security
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
#  Endpoints
# ─────────────────────────────────────────────

@app.get("/")
async def root_endpoint():
    """Root endpoint - API welcome message"""
    return {"message": "KissKH API is running!", "endpoints": {"/api/last-updates": "Latest updates", "/api/home/latest": "Latest dramas", "/api/search": "Search dramas"}}

@app.get("/test")
async def test():
    """Simple test endpoint to verify app is running"""
    return {"status": "ok", "message": "App is running!", "version": "5c92a1d"}

@app.get("/api/debug")
async def api_debug():
    """Debug endpoint showing the last KissKH fetch sequence and status."""
    return {
        "status": "ok",
        "last_fetch_debug": last_fetch_debug,
    }

@app.get("/api/")
async def root():
    return {"message": "KissKH Active. Engine operating cleanly via High-Speed direct API Pool!"}

@app.get("/api/search")
async def api_search(q: str):
    try:
        return await fetch_kisskh_api(f"/DramaList/Search?q={q}&type=0")
    except Exception as e:
        return {"error": f"Search failed: {str(e)}", "status": 500}

@app.get("/api/info/{drama_id}")
async def api_info(drama_id: str):
    try:
        return await fetch_kisskh_api(f"/DramaList/Drama/{drama_id}?isq=false")
    except Exception as e:
        return {"error": f"Failed to fetch drama info: {str(e)}", "status": 500}

@app.get("/api/home/latest")
async def api_latest(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=40)
):
    try:
        return await fetch_kisskh_api(
            f"/DramaList/List?page={page}&type=0&sub=0&country=0&status=0&order=2&pageSize={page_size}"
        )
    except Exception as e:
        return {"error": f"Failed to fetch latest dramas: {str(e)}", "status": 500}

@app.get("/api/home/popular")
async def api_popular(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=40)
):
    try:
        return await fetch_kisskh_api(
            f"/DramaList/List?page={page}&type=0&sub=0&country=0&status=0&order=1&pageSize={page_size}"
        )
    except Exception as e:
        return {"error": f"Failed to fetch popular dramas: {str(e)}", "status": 500}

@app.get("/api/home/new")
async def api_new(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=40)
):
    try:
        return await fetch_kisskh_api(
            f"/DramaList/List?page={page}&type=0&sub=0&country=0&status=0&order=3&pageSize={page_size}"
        )
    except Exception as e:
        return {"error": f"Failed to fetch new dramas: {str(e)}", "status": 500}

@app.get("/api/home/ongoing")
async def api_ongoing(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=40),
    country: int = Query(0, ge=0, le=5, description="0=All 1=Korea 2=China 3=Japan 4=Thailand 5=Other")
):
    try:
        return await fetch_kisskh_api(
            f"/DramaList/List?page={page}&type=0&sub=0&country={country}&status=1&order=2&pageSize={page_size}"
        )
    except Exception as e:
        return {"error": f"Failed to fetch ongoing dramas: {str(e)}", "status": 500}

@app.get("/api/home/completed")
async def api_completed(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=40),
    country: int = Query(0, ge=0, le=5, description="0=All 1=Korea 2=China 3=Japan 4=Thailand 5=Other")
):
    try:
        return await fetch_kisskh_api(
            f"/DramaList/List?page={page}&type=0&sub=0&country={country}&status=2&order=1&pageSize={page_size}"
        )
    except Exception as e:
        return {"error": f"Failed to fetch completed dramas: {str(e)}", "status": 500}

@app.get("/api/browse")
async def api_browse(
    page: int = Query(1, ge=1),
    type: int = Query(0, ge=0, le=5, description="0=All 1=Korean 2=Chinese 3=Japanese 4=Thai 5=Other"),
    sub: int = Query(0, ge=0, le=2, description="0=All 1=Sub 2=Raw"),
    country: int = Query(0, ge=0, le=5, description="0=All 1=Korea 2=China 3=Japan 4=Thailand 5=Other"),
    status: int = Query(0, ge=0, le=2, description="0=All 1=Ongoing 2=Completed"),
    order: int = Query(0, ge=0, le=5, description="0=Default 1=Popular 2=Updated 3=New 4=Year 5=A-Z"),
    page_size: int = Query(20, ge=1, le=40)
):
    try:
        return await fetch_kisskh_api(
            f"/DramaList/List?page={page}&type={type}&sub={sub}&country={country}&status={status}&order={order}&pageSize={page_size}"
        )
    except Exception as e:
        return {"error": f"Browse failed: {str(e)}", "status": 500}

@app.get("/api/last-updates")
async def get_last_updates():
    """Fetch last updates from KissKH"""
    return await fetch_kisskh_api("/DramaList/LastUpdate?ispc=false")

@app.get("/api/resolve/{episode_id}")
async def api_resolve(episode_id: str):
    # Method 1: Environment Keys (Vercel-ready direct HTTP resolution)
    stream_key = os.environ.get("KISSKH_STREAM_KEY")
    sub_key = os.environ.get("KISSKH_SUB_KEY")
    
    if stream_key:
        print("Direct environment keys found. Resolving streams via HTTP requests...")
        try:
            async with httpx.AsyncClient() as client:
                stream_url = f"{BASE_URL}/DramaList/Episode/{episode_id}?kkey={stream_key}"
                sub_url = f"{BASE_URL}/Sub/{episode_id}?kkey={sub_key or stream_key}"
                
                stream_resp = await client.get(stream_url, headers=HEADERS, timeout=15)
                sub_resp = await client.get(sub_url, headers=HEADERS, timeout=15)
                
                return {
                    "episode_id": episode_id,
                    "stream": stream_resp.json() if stream_resp.status_code == 200 else None,
                    "subtitles": sub_resp.json() if sub_resp.status_code == 200 else []
                }
        except Exception as e:
            print(f"Direct resolution failure: {e}")

    # Method 2: Local Playwright Fallback
    if kisskh.playwright and kisskh.context:
        print("Playwright active. Resolving streams using headless browser sniffing...")
        try:
            return await kisskh.get_episode_stream(episode_id)
        except Exception as e:
            return {"error": f"Playwright capture failed: {str(e)}", "status": 500}

    # Method 3: Failed completely
    return {
        "error": "Stream resolution requires authentication. On Vercel, please set 'KISSKH_STREAM_KEY' and 'KISSKH_SUB_KEY' environment variables. For local development, make sure Playwright and browser packages are installed.",
        "status": 403
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    script_name = os.path.splitext(os.path.basename(__file__))[0]
    uvicorn.run(f"{script_name}:app", host="0.0.0.0", port=port, workers=1)