# Chrome Web Store publisher handoff

Prepared for version 2.1.2 on November 4, 2026. This is an upload package and submission guide, not an already-created store item or approval.

## Files to use

1. `dist/LinkedIn-Lens-2.1.2-chrome.zip` (or the identical GitHub release asset). Upload this ZIP directly, without an extra outer directory.
2. `store/LISTING.md`: paste-ready name, short/long descriptions, support and privacy URLs.
3. `extension/icons/icon-128.png`: listing icon.
4. `store/screenshots/`: 1280 × 800 PNG listing images showing real extension scripts on explicitly synthetic sample content. These contain no account data, API keys or live personal profiles.
5. `PRIVACY.md`: public privacy policy. The full policy is also bundled in `extension/privacy.html`.

## Account and ownership

Use the existing, authorized Chrome Web Store publisher account. Do not create another developer account or share passwords just for this submission. The account owner must supply/verify their publisher contact email, developer identity and any required distribution/trader declarations truthfully. Agree with your friend who owns the listing, handles support and maintains future releases before publishing.

No account-specific API credentials, publisher IDs or signing keys are embedded in the project. Google assigns the store item ID and handles signing and updates after submission. Record the assigned ID and store URL here once issued. Reuse that same item for future versions.

## Upload and listing

1. Sign in at the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) using the publisher account.
2. Choose **Add new item**, upload the Chrome ZIP, and confirm its version is 2.1.2.
3. Fill the listing from `LISTING.md`, add the icon and screenshots, and supply the publisher's verified support email.
4. Open the public policy/support URLs in a signed-out browser to verify accessibility.
5. Complete Privacy practices, test instructions and Distribution. Save the draft and review every field before submitting for Google's review.

## Privacy practices: suggested answers matching this code

**Single purpose:** Help users review and control the LinkedIn posts they see by categorizing loaded posts and applying reversible category masks, with an optional user-requested comment draft for the same post-review workflow.

**storage permission:** Save consent, user preferences, category definitions and the user's OpenRouter key in trusted extension-local storage. Store temporary category results and a request counter in session storage. The key is never exposed to the LinkedIn content script.

**https://www.linkedin.com/* content-script access:** Find already-loaded post containers, read post body content and post/media signals, display category labels and reversible masks, and insert only a user-requested comment draft. The script loads on this origin for LinkedIn's client-side navigation but operates only on supported feed/profile/post routes. It does not read messages or use private LinkedIn APIs.

**https://openrouter.ai/* host permission:** Send HTTPS AI requests with the user's API key after explicit cloud consent. Classification sends post text or an attached image, post signals and category definitions. Optional drafting sends post text and the user's writing direction only when Generate is clicked.

**https://media.licdn.com/* host permission:** Download the first attached post image when no readable text is available, to classify image-only posts. The worker restricts requests to the `/dms/image/` path, checks format and size, omits cookies and rejects redirects. No profile-photo download feature is implemented.

**Remote code:** No. All executable JavaScript is packaged. API responses are validated probabilities or text, never loaded/executed as scripts. Cloud model inference is remote data processing, disclosed separately.

**Data types:** Select Website content and Authentication information. The API key is authentication information even though it stays locally except for OpenRouter authorization. Also select Personally identifiable information because post text/images and user-provided writing directions may contain names or contact details. Do not select “no data collected.” No browser-history, location, financial, health, private-message or user-activity-tracking feature is implemented. Review the dashboard's current definitions carefully; incidental sensitive information can appear inside user-provided website content.

**Data-use certifications:** The publisher must personally verify the privacy policy, Limited Use requirements and dashboard statements before certifying. This package does not certify policy compliance or waive Google's review. OpenRouter/provider privacy settings and retention must be acceptable for the intended distribution.

## Reviewer test instructions

1. Install the uploaded build in Chrome. Pin Lens and open its settings.
2. Confirm the cloud disclosure is visible and its checkbox is unchecked. No AI request or image download should occur until consent is saved.
3. Use a reviewer-owned LinkedIn login to open the feed. No developer-owned LinkedIn account is required or supplied.
4. Accept cloud processing. Enter a reviewer OpenRouter API key with credits and access to Perplexity Decider V1.2. Save and refresh LinkedIn. The publisher must arrange a suitable restricted reviewer key through the dashboard's private test-instructions field if Google requires credentials. Never commit or put a key in listing copy.
5. Observe category badges; open Details. Select a category to mask in settings. Confirm matching strong results show the mask reason and Show post restores the post.
6. Edit/add a category, save, and check subsequent classification. Check profile activity and a post permalink too.
7. Enable Suggest comments; open comments on a readable post, choose the pencil icon, Generate, edit and Insert. Verify no comment is posted automatically.
8. Uncheck cloud consent and Save. Confirm Lens disables and sends no new AI/media requests. Previously transmitted requests cannot be recalled.
9. Choose Forget key and confirm saved credentials/cache are removed.

Offline fixtures are available for source review (`python -m http.server 8766 --bind 127.0.0.1`, then `/feed/` and `/preview-settings.html`). They use mocked Chrome/provider responses and cannot substitute for an installed-extension smoke test or live provider test.

## Before submitting

- Confirm publisher contact/identity, distribution and ownership with the actual account owner.
- Validate an installed Chrome build and one real paid-provider classification/comment flow, including consent denial and revocation. Automated worker/fixture tests do not establish native browser lifecycle or live model availability/quality.
- Recheck provider model access, privacy controls, billing and reviewer access.
- Confirm public privacy policy/support pages and an appropriate source license decision.
- Check applicable LinkedIn rules independently. Google approval does not authorize use under LinkedIn's terms or guarantee account safety.

## Official references checked

- [Publish an extension](https://developer.chrome.com/docs/webstore/publish)
- [Privacy practices fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)
- [User data disclosures](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)
- [Listing image requirements](https://developer.chrome.com/docs/webstore/images)
- [OpenRouter provider retention](https://openrouter.ai/docs/guides/privacy/provider-logging)
