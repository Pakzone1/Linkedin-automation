# 2.1.2
- Require explicit cloud AI consent before classification, image downloads or comment generation, including upgrades with an existing key.
- Show the disclosure and privacy policy above all settings tabs; consent can be withdrawn by unchecking and saving.
- Add a clean repository, reproducible store packaging, automated validation, privacy policy and submission materials.

# 2.1.1
- Keep a qualifying Sponsored ad or Ads & promotion badge visible before other topics, within the existing three-badge limit.
- Show the selected masking reason directly on masked cards, including inherited parent settings.
- Apply masks to every strong qualifying match instead of only the three displayed labels; retain compact match records in cache.
- Preserve confidence gates, organic-versus-paid distinctions, custom category names and manual overrides.
- Refresh the classification cache format once; no additional provider questions or model changes.

# 2.1.0
- Detect job-recommendation carousels and LinkedIn offer modules locally as Not a post; keep genuine unreadable posts separate.
- Add an independent non-post mask setting with reversible Show card, preserving the previous mask preference on migration.
- Exclude non-post modules from provider requests and the ten-post prefetch allowance.
- Keep scans moving during continuous scrolling, reuse unchanged post extraction and category options, and avoid repeatedly rendering unreadable results.
- Serve read-only settings/status without waiting for a provider response; keep request budgets/cache writes serialized.

# 2.0.1
- Post badges show only the most specific selected category name.
- Full paths remain available on hover and in Details.
- Classification, confidence thresholds and masks are unchanged.

# 2.0.0
- Seeded a 60-category, three-level tree with 12 broad branches.
- Added 45% / 70% / 95% confidence rules and ancestor gating.
- Search, expand, enable, mask, color, edit, add, reparent, remove and undo category changes.
- Preserve legacy preferences and existing category IDs during migration.
- Keep weak broad matches visible; strong descendant matches inherit parent masks.
- Classify enabled categories together in one request; cache by hierarchy and definitions.

# 1.6.0
- Shared page routing enables classification and the comment pencil on profile Posts/activity and single-post pages.
- Detect client-side navigation into supported routes and clean up on unrelated pages.
- Added Opinion / discussion; clarified usefulness, jargon and engagement-bait instructions, including quotations and mixed languages.
- Uncategorized shows closest scores. The 70% threshold remains.
- Built-in prompt/definition changes invalidate cached predictions.

# 1.5.0
- Preserve post height with a faded/blurred mask instead of collapsing content.
- Show post restores content and keyboard access.
- Pre-analyze visible posts plus the next ten loaded posts, with bounded pending requests, cached results and the existing budget.

# 1.4.0
- Short comment prompt, no 500-token cutoff; reject incomplete provider output rather than displaying partial drafts.
- Persistent, trusted-context-only key storage with session-key migration and Forget key removal.
- Recent budget default: Qwen3.7 Flash; migrate prior Gemini 2.5 Flash Lite defaults.

# 1.3.0
- Wider 560px settings, rounded controls and LinkedIn-like blue/white styling.
- Shorter labels and fewer explanatory paragraphs.
- Built-in Unreadable category, hidden by default with Show post available.
- Add, color, hide and remove up to 12 custom AI categories.
- Definition-aware caching prevents old predictions after category changes.

# 1.2.0
- Insert appends a draft to the current comment editor; never submits. Existing text is preserved.
- Custom direction allows up to 1,500 characters describing the desired comment.
- Teal/mint/amber visual refresh, three settings panels, logo and browser-toolbar icons.
- Removed model/source header from feed posts.
- Textless posts can use their first attached LinkedIn image (JPEG/PNG/WebP/GIF, max 6 MB). Images go to OpenRouter for Decider classification.
- Unreadable posts collapse with Show post; configurable in Feed settings. Credential/quota/provider errors do not hide readable posts.
- Comment drafting still requires post text. No image-to-comment generation or video inspection.
