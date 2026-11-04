# Using LinkedIn Lens

## Connect

Read the visible cloud AI disclosure, accept it, enter your own OpenRouter key under Connection, enable Lens and Save. Refresh LinkedIn. Provider credits and model access are required.

Classification uses Standard Perplexity Decider V1.2. No local topic classifier is used. Known non-post cards and missing-input handling use local structural checks. Optional comments use a separate generative model.

## Categories and masks

The tree seeds 12 broad categories, 36 subcategories and 12 detailed categories. Broad/sub/detailed gates are 45/70/95%, with all ancestors required. Automatic masks need at least 70% throughout the matching path. Scores are estimates, not measured accuracy.

Up to three badges are visible. Qualifying paid ads show Sponsored ad first; organic promotions show Ads & promotion without implying paid sponsorship. All strong qualifying matches count for masking, including ones beyond the three badges. The mask reason names the setting you chose, including inherited parents.

Open Categories to search/expand branches. On controls category availability; disabling a parent excludes its descendants. Mask controls a category and descendants. Use Edit to change name, description, color or parent, then Apply and Save. Add category creates a broad branch; Add subcategory creates a child. Up to 200 categories and three levels are supported. Removing a branch removes descendants too; Undo is available before saving. System results can be colored/masked but not removed.

Not a post identifies known job-recommendation carousels and offer modules, separately from Unreadable. Modules use no AI request or prefetch allowance. Their mask switches are independent. Show post or Show card restores original content and interaction while preserving layout. Details shows category paths and manual correction; corrections last only for the current card and do not train the model.

## Requests and comments

Visible posts and the next 10 loaded real posts can be prefetched. No auto-scroll or private feed API is used. Prefetch can consume paid requests before a post is viewed. Scans reuse unchanged extraction; provider inference speed varies.

The session limit defaults to 50 attempts, up to 500. Failures and regenerated drafts count; cached classifications do not. It is not a dollar cap. Use OpenRouter account controls to limit spending.

Enable Suggest comments separately. Open comments, choose the pencil beside emoji, choose a tone or Custom direction and Generate. Review/edit, Copy or Insert. Insert appends to existing text; you still press LinkedIn's Post button. Post text and custom directions are sent; images/comment threads are excluded from drafting.

## Pause or remove data

Disable Lens and Save to remove its UI and stop new analyses. Uncheck cloud consent and Save to disable Lens/comments and block cloud requests. Requests already sent cannot be recalled. Forget key removes the key and session cache and disables AI, retaining category preferences. Uninstalling removes extension storage. Third-party retention is managed by providers.

Provider failures leave posts unclassified. Check consent/key/credits and refresh if labels stop appearing. Report problems without sharing private posts or credentials. See the privacy policy and store submission guide for more details.
