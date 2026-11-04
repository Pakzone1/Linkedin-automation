# Security

Please report vulnerabilities privately through the contact options on [the maintainer's GitHub profile](https://github.com/Pakzone1). Do not open public issues containing keys, account data or exploitable details. Rotate any exposed OpenRouter key in your provider account.

The extension accepts settings writes only from its own settings page. LinkedIn content scripts receive sanitized settings and may request analysis only on supported pages. API credentials remain in trusted extension storage. Images are restricted to LinkedIn's media origin, checked for format/size, and fetched without cookies or redirects. AI output is validated and treated as data.

There are no bundled API keys, developer telemetry, production npm dependencies or remotely hosted scripts. The synthetic test keys in `tests/` are placeholders and are excluded from release ZIPs.

See [PRIVACY.md](PRIVACY.md) for cloud-processing and local-storage limitations. Supported fixes target the latest release.
