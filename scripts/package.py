"""Build a reproducible Chrome Web Store ZIP using only Python's standard library."""
import hashlib
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "extension"


def runtime_files():
    manifest = json.loads((SOURCE / "manifest.json").read_text(encoding="utf-8"))
    names = {"manifest.json", "core.js", "popup.js", "popup.css", "privacy.html", "icons/logo.svg"}
    names.add(manifest["background"]["service_worker"])
    names.add(manifest["action"]["default_popup"])
    names.update(manifest["icons"].values())
    names.update(manifest["action"]["default_icon"].values())
    for script in manifest["content_scripts"]:
        names.update(script.get("js", []))
        names.update(script.get("css", []))
    for name in names:
        original = SOURCE / name
        path = original.resolve()
        if not path.is_relative_to(SOURCE.resolve()) or not path.is_file() or original.is_symlink():
            raise ValueError(f"Invalid runtime path: {name}")
    return manifest, sorted(names)


def build():
    manifest, names = runtime_files()
    output = ROOT / "dist"
    output.mkdir(exist_ok=True)
    archive = output / f"LinkedIn-Lens-{manifest['version']}-chrome.zip"
    with ZipFile(archive, "w", compression=ZIP_DEFLATED, compresslevel=9) as package:
        for name in names:
            info = ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            package.writestr(info, (SOURCE / name).read_bytes(), compresslevel=9)
    with ZipFile(archive) as package:
        assert package.testzip() is None
        assert package.namelist() == names
        for name in names:
            assert package.read(name) == (SOURCE / name).read_bytes(), name
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    (output / "SHA256SUMS.txt").write_text(f"{digest}  {archive.name}\n", encoding="utf-8")
    print(f"{archive.name}: {len(names)} runtime files; SHA-256 {digest}")
    return archive


if __name__ == "__main__":
    build()
