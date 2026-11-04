# Screenshot provenance

Captured November 4, 2026, from the repository's synthetic fixtures running the real extension UI scripts, with mocked Chrome/OpenRouter APIs. No signed-in account, real profile, post, API key or live model result is shown.

- `01-feed.png`: `/feed/store-preview.html`, showing an example sponsored post masked by Ads & promotion and an example tutorial left visible.
- `02-categories.png`: `/preview-settings.html`, Categories tab, scrolled to the category manager.
- `03-cloud-consent.png`: fresh `/preview-settings.html`, showing the unchecked consent and disabled effective state before setup.

These are screenshots of actual rendered controls, not generated UI artwork. The capture service returned JPEG frames at 1280×720 or 1265×712; they were uniformly scaled to 800 pixels high, then cropped equally at the outside horizontal margins to 1280×800 PNGs for the Chrome Web Store. No controls, labels or post contents were retouched. Original frames are kept only in local ignored evidence.

Re-capture after material interface changes. These images demonstrate UI behavior, not installed-extension lifecycle or live model accuracy.

## Actual LinkedIn demo captures

`04-live-feed.png` and `05-live-masks.png` are frames from the maintainer's approved LinkedIn demo recording, at 36 and 24 seconds respectively. They show the extension running on the real LinkedIn feed. The recording already blurs side profiles and sidebar information. Frames were uniformly downscaled from 2560×1600 to 1280×800; feed controls and classifications were not retouched. These same captures are used in `docs/images/`, alongside a careers/feed frame from 30 seconds. Original recordings remain outside the repository.
