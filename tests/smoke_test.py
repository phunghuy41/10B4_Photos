"""Lightweight static checks for MEMORYVERSE source files."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
required = [
    ROOT / "index.html",
    ROOT / "styles.css",
    ROOT / "app.js",
    ROOT / "config.js",
    ROOT / "supabase" / "schema.sql",
    ROOT / "supabase" / "functions" / "submit-comment" / "index.ts",
]
for path in required:
    assert path.exists() and path.stat().st_size > 100, f"Missing or empty: {path}"

html = (ROOT / "index.html").read_text(encoding="utf-8")
js = (ROOT / "app.js").read_text(encoding="utf-8")
sql = (ROOT / "supabase" / "schema.sql").read_text(encoding="utf-8")
for marker in ["spacesGrid", "collectionGrid", "photoGrid", "viewer", "commentForm", "curatorModal"]:
    assert marker in html, f"HTML missing component: {marker}"
for marker in ["openViewer", "submitComment", "uploadSelectedFiles", "loadCloudData", "setSpace"]:
    assert marker in js, f"JS missing feature: {marker}"
for marker in ["enable row level security", "submit_public_comment", "memoryverse_curator_upload", "yearbook_picks"]:
    assert marker in sql.lower(), f"SQL missing security/schema feature: {marker}"
print("MEMORYVERSE smoke checks passed.")
