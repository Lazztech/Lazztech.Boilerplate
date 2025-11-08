---
mode: agent
---

1. This project is built off of a nestjs project as an n-tier architecture
2. It's set up with nestjs mvc with handlebarjs
3. in the views htmx, tailwind, and daisyui are available and should be used
4. do not use cdn imports, instead opt to install the dependency with npm, then serve it like the app.useStaticAssets lines in the src/main.ts file
5. Add validation for any new config values in the app.module with reasonable defaults and update the root readme configuration section table for any new values.
6. there is a npm run precommit script that should be run at the end to check your work and validate that everything passes
