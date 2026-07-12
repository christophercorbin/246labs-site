# 246Labs Marketing Site

Next.js (App Router) + Tailwind. Deployed on AWS Amplify Hosting.

## Local dev
```bash
cd web
npm install
npm run dev      # http://localhost:3000
npm test         # Vitest
npm run build    # production build
```

## Environment
Copy `.env.example` to `.env.local` and fill in for local contact testing.
In production, set these in the Amplify console (never commit secrets):
`SES_REGION`, `SES_SENDER`, `SES_RECIPIENT`.

## Deploy (AWS Amplify)
1. Push this repo to GitHub/CodeCommit.
2. Amplify Console → New app → Host web app → connect the repo/branch.
3. Amplify auto-detects `amplify.yml` (monorepo `appRoot: web`).
4. Add env vars `SES_REGION`, `SES_SENDER`, `SES_RECIPIENT`.
5. Add custom domain `246labs.cloud` in Amplify → Domain management.

## SES prerequisites (one-time, owner)
- Verify `SES_SENDER` (domain or address) in the target AWS account/region.
- If SES is in sandbox, verify `SES_RECIPIENT` too, or request production access.
- Grant the Amplify compute role `ses:SendEmail` permission.

