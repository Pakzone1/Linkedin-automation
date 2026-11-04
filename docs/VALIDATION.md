# Release validation

Version 1.0.0, November 4, 2026.

- 37 Node tests cover taxonomy, hierarchy, masking, ads, budgets, sender boundaries, images, persistent keys, cache and complete drafts.
- New consent regression covers upgrades with saved keys, invalid/missing consent, blocked text/image/draft requests, no image download before consent, cache access after withdrawal and saving revoked settings.
- 73 browser assertions pass from each of home-feed and profile-activity starting fixtures (146 total), using real runtime scripts with mocked Chrome/provider APIs. Added checks cover removal of injected controls on consent withdrawal, no further analysis and resuming after consent is restored.
- Static checks cover Manifest V3, versions, permissions, encoding, syntax, icons, embedded-key/remote-script patterns and prominent disclosure placement.
- A standard-library Python check verifies repeatable runtime-only packaging, root manifest, bundled privacy policy, excluded tests/docs, CRCs and byte-for-byte runtime/source agreement.

These tests do not establish native installed-extension lifecycle, store approval, live paid inference, model accuracy, LinkedIn account safety or every site rollout/language. The publisher must run the installed Chrome and live-provider smoke test in `store/SUBMISSION.md`. No live AI request was sent during these checks.

Store screenshots include three UI fixture captures and two real LinkedIn demo captures with side profiles/sidebar details blurred. README screenshots use the approved real demo. See the screenshot READMEs for provenance.
