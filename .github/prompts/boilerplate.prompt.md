---
mode: agent
---

1. This project is built off of a nestjs project as an n-tier architecture
2. It's set up with nestjs mvc with handlebarjs
3. https://nestjs-i18n.com/ is configured. Ensure that ALL strings in every handlebarjs view via the hbs t helper method (example: {{t 'lang.HELLO_WORLD'}}), or otherwise sent to the client via a controller (with the @I18n() i18n: I18nContext controller parameter) or otherwise, including any dto validation messages should come from the src/i18n/en/lang.json.
4. in the views htmx, tailwind, and daisyui are available and should be used
5. do not use cdn imports, instead opt to install the dependency with npm, then serve it like the app.useStaticAssets lines in the src/main.ts file
6. Use the nestjs configuration service for config values instead of proccess.env if the config service may be made available. The only exception is the main.ts
7. Add validation for any new config values in the app.module with reasonable defaults and update the root readme configuration section table for any new values.
8. there is a ./scripts/preCommit.sh script that should be run at the end to check your work and validate that everything passes. Warnings are acceptable, failures are not.
