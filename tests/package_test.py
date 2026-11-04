import hashlib
import importlib.util
import unittest
from pathlib import Path
from zipfile import ZipFile

spec = importlib.util.spec_from_file_location("package", Path(__file__).resolve().parents[1] / "scripts/package.py")
package = importlib.util.module_from_spec(spec)
spec.loader.exec_module(package)


class PackageTest(unittest.TestCase):
    def test_reproducible_runtime_only_zip(self):
        archive = package.build()
        before = hashlib.sha256(archive.read_bytes()).hexdigest()
        self.assertEqual(before, hashlib.sha256(package.build().read_bytes()).hexdigest())
        with ZipFile(archive) as zipped:
            self.assertIn("manifest.json", zipped.namelist())
            self.assertIn("privacy.html", zipped.namelist())
            self.assertFalse(any(name.startswith(("tests/", "docs/", ".")) or name.endswith(".md") for name in zipped.namelist()))


if __name__ == "__main__":
    unittest.main()
