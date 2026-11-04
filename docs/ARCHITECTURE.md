# Architecture

Manifest V3, plain JavaScript and CSS. No build step or production dependencies.

| Component | Responsibility |
| --- | --- |
| `extension/core.js` | Settings validation, category tree, typed AI requests/results, thresholds, masking rules and shared supported routes |
| `extension/background.js` | Trusted-context key storage, sender checks, consent enforcement, request budget, image download, OpenRouter requests and session cache |
| `extension/content.js` | Loaded-post extraction, labels, reversible masks, known non-post modules, scroll scheduling and optional draft UI |
| `extension/popup.html`, `popup.js`, `popup.css` | Consent, connection, category and feed settings |
| `extension/privacy.html` | Packaged privacy policy accessible before cloud consent |
| `tests/` | Node worker/core tests, mocked browser messages and interaction assertions |
| `feed/`, `in/`, `preview-settings.html` | Synthetic review fixtures using real runtime scripts; never included in the release ZIP |
| `scripts/` | Source checks and deterministic, allowlisted ZIP packaging |
| `store/` | Publisher handoff, listing copy and privacy-safe listing images |

Classification uses Perplexity Decider V1.2 via OpenRouter `/api/alpha/decisions`. Each enabled category receives a probability in one request. Broad/sub/detailed thresholds are 45/70/95%; every ancestor must qualify. Automatic masking requires at least 70% throughout the selected path. Ads/promotion badges have priority; all strong matches count for masking independently of the three visible badges. Manual correction overrides automatic matches.

The optional comment model is configured separately, defaults to Qwen3.7 Flash, and uses `/api/v1/chat/completions` only on an explicit Generate action. Insert appends a draft; the user submits it.

The page schedules scans at most every 100 ms while events arrive. It reuses extracted content until relevant DOM changes, prefills the visible-plus-ten loaded-post window, and submits up to two pending analyses per tab. Provider calls/settings writes are serialized in the worker to keep request counts/cache writes consistent; status/settings reads bypass the queue. No auto-scrolling or private LinkedIn endpoint is used.

The content script loads across `www.linkedin.com` to handle LinkedIn's client-side route changes, but only operates on supported feed/profile/post routes. It cleans up on unrelated routes. The broad script match does not authorize sending other page content: the worker validates the sender path separately.
