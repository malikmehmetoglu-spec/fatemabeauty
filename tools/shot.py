"""Screenshot app routes from the running dev server (http://localhost:3000).

usage: python3 tools/shot.py <out_dir> <kind> <route> [<route> ...]
kind: phone (390x844) | tablet (1194x834) | tv (1920x1080) | admin (1440x900)
Prints console errors / page errors per route. Full-page screenshot for phone & admin.
"""
import sys, os
from playwright.sync_api import sync_playwright
SIZES = {"phone": (390, 844), "tablet": (1194, 834), "tv": (1920, 1080), "admin": (1440, 900)}
out, kind, routes = sys.argv[1], sys.argv[2], sys.argv[3:]
os.makedirs(out, exist_ok=True)
w, h = SIZES[kind]
w = int(os.environ.get("SHOT_W", w))  # e.g. SHOT_W=360 for a narrow phone
with sync_playwright() as p:
    br = p.chromium.launch()
    for r in routes:
        pg = br.new_page(viewport={"width": w, "height": h}, device_scale_factor=1)
        errs = []
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto("http://localhost:3000" + r, wait_until="networkidle", timeout=120000)
        pg.wait_for_timeout(400)
        name = (r.strip("/").replace("/", "_") or "root") + (f"@{w}" if "SHOT_W" in os.environ else "") + ".png"
        full = kind in ("phone", "admin")
        pg.screenshot(path=os.path.join(out, name), full_page=full)
        sh = pg.evaluate("document.documentElement.scrollHeight")
        print(f"{r} -> {name}  height={sh}" + (f"  ERRORS: {errs[:3]}" if errs else ""))
        pg.close()
    br.close()
