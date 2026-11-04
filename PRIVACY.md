# LinkedIn Lens Privacy Policy

Effective date: November 4, 2026. Applies to LinkedIn Lens 1.0.0.

LinkedIn Lens is maintained by Shahbaz ([Pakzone1](https://github.com/Pakzone1)). It helps you categorize and mask LinkedIn posts, with optional comment drafting. This policy describes the extension; Google, LinkedIn, OpenRouter and AI providers operate their own services under their own policies.

## Data the extension handles

- **Website content:** loaded post text, whether a post contains video or sponsorship signals, and the first attached image when readable text is absent. Post content may itself include names, contact details or other personal information. Lens does not intentionally extract profile identities separately from the post body.
- **Settings and user input:** category names/descriptions, colors, masks, enabled features, your consent choice, request limit, selected comment model, custom writing directions and generated drafts.
- **Authentication information:** your OpenRouter API key. It is sent only to OpenRouter as the authorization credential for your AI requests. The extension does not ask for your LinkedIn password or forward LinkedIn cookies.
- **Temporary results:** classification results indexed by a hash of the input, and session request counts. Manual corrections and draft text remain in the current page while it is open.

Lens does not read LinkedIn direct messages, deliberately collect comment threads, request browser history, or collect analytics, advertising identifiers or telemetry for its developer. It does not operate a separate developer backend.

## When data is sent

Cloud AI processing requires an unchecked-by-default consent checkbox and a saved API key. Until consent is granted, including after upgrading an older installation, classification, image downloads and comment-generation requests are blocked.

After consent and enabling Lens, the extension automatically sends visible posts and up to the next 10 posts already loaded on a supported LinkedIn page for classification. Requests include post text/signals and your enabled category definitions. If a post has no text, the first attached image may be fetched from `media.licdn.com` without cookies and sent as image data. These media requests disclose normal connection metadata, such as your IP address, to LinkedIn's media service.

Classification is sent over HTTPS to OpenRouter's decisions API and routed to its AI provider. Comment generation sends the post text, post signals, selected model, tone and any custom writing direction to OpenRouter's chat-completions API only when you click Generate. Images are not used for comment drafts. Provider charges may apply to both visible and prefetched posts.

OpenRouter receives the API key, request contents and normal connection metadata. OpenRouter and its providers may process or retain request data under their own policies and your account settings. Lens cannot delete records held by those services or promise zero retention. Review [OpenRouter privacy](https://openrouter.ai/privacy), [provider policies](https://openrouter.ai/docs/guides/privacy/provider-logging) and the providers available to your account before enabling cloud processing.

## Purpose, sharing and Limited Use

The extension uses handled data to provide its visible categorization, masking and user-requested drafting features. The developer does not sell this data, use it for advertising or credit decisions, build profiles for unrelated purposes, or use it to train a separate model. The developer does not receive your posts or key through a Lens service. The developer does not read handled data unless you voluntarily provide material for support; avoid including keys or private post content in support requests.

LinkedIn Lens's use and transfer of information received through the extension is limited to providing its user-facing features, in accordance with the Chrome Web Store User Data Policy, including its Limited Use requirements. Third-party processing is disclosed above; configure your provider account's privacy controls to match your requirements.

## Storage, retention and security

The API key, consent and preferences are stored in `chrome.storage.local` until you remove them or uninstall the extension. They are not synchronized by Lens to other browsers. The key is accessible only to trusted extension contexts, not its LinkedIn content script. Browser extension storage is not a password vault and Lens does not add its own encryption at rest.

Session storage holds up to 300 classification results and a request counter, normally until the browser session ends or the extension is reloaded, updated or disabled. Cache entries store category results and hashes rather than a copy of the original post. UI drafts and manual corrections remain in page memory. Network requests use HTTPS, omit cookies, and never execute provider output as code.

## Your choices and deletion

- Uncheck cloud AI consent and Save to disable Lens and comment drafts and block subsequent cloud requests. A request already sent cannot be recalled.
- Pause Lens and Save to stop new analyses. Disable Suggest comments to remove optional drafting controls.
- Choose Forget key to delete the saved key, clear the classification cache and disable AI features. This does not erase your category preferences.
- Uninstall the extension to remove its local/session data. Clear page drafts by closing or refreshing the LinkedIn page.
- Manage provider records and privacy controls through OpenRouter and the relevant AI provider.

## Changes and contact

Material changes to cloud data handling will be disclosed in the extension and require renewed consent where appropriate. For questions, contact the maintainer through [their GitHub profile](https://github.com/Pakzone1) or the support contact on the published store listing. Do not put API keys, account details or private post content in public issues.
