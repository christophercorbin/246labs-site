# 246Labs Pipeline Infrastructure (OpenTofu)

Provisions the AWS side of the site's CI/CD in account `687159379702`
(profile `personal-246labs`): the GitHub OIDC provider, the `gha-246labs-deploy`
role, and the Amplify SSR compute role (SES send). Terraform state lives in S3 +
DynamoDB in the same account.

The **Amplify app is created in the console** and connected to the private repo
via the **AWS Amplify GitHub App** (no personal access token). Terraform does
not manage the app; it scopes the deploy role to the app via `var.amplify_app_id`.

> Toolchain: this project uses **OpenTofu** (`tofu`), a drop-in for `terraform`.

## One-time prerequisites
- `tofu` (OpenTofu), `aws` CLI (`personal-246labs`), repo pushed to GitHub.
- No PAT required (the GitHub App handles the Amplify↔GitHub connection).

## Step 1 — Create the Amplify app in the console (account 687159379702)
Amplify → Create app → GitHub → **authorize the AWS Amplify GitHub App** and pick
`christophercorbin/246labs-site` → branch `main`. Then set:
- Platform: **WEB_COMPUTE** (Next.js SSR).
- Branch `main`: **disable automatic builds** (GitHub Actions triggers releases).
- Build settings: Amplify auto-detects the repo-root `amplify.yml` (monorepo `appRoot: web`).
- Environment variables: `SES_REGION=us-east-1`, `SES_SENDER=no-reply@246labs.cloud`, `SES_RECIPIENT=hello@246labs.cloud`.

Copy the **App ID** from the app's settings.

## Step 2 — Bootstrap the state backend (once)
```bash
cd infra/bootstrap
tofu init
tofu apply        # creates the S3 state bucket + DynamoDB lock table
```

## Step 3 — Apply the pipeline infra
```bash
cd infra
tofu init         # uses the S3 backend created above
tofu apply \
  -var "github_owner=christophercorbin" \
  -var "github_repo=246labs-site" \
  -var "amplify_app_id=<APP_ID_FROM_STEP_1>"
```
This creates the OIDC provider, `gha-246labs-deploy` (scoped to this app's ARN),
and the `amplify-246labs-compute` SES role.

## Step 4 — Attach the compute role to the app (SES runtime permission)
```bash
aws amplify update-app \
  --app-id "<APP_ID_FROM_STEP_1>" \
  --iam-service-role-arn "$(tofu output -raw amplify_compute_role_arn)" \
  --profile personal-246labs --region us-east-1
```

## Step 5 — Wire outputs into GitHub Actions variables
```bash
gh variable set AWS_REGION -b us-east-1
gh variable set AWS_DEPLOY_ROLE_ARN -b "$(tofu output -raw deploy_role_arn)"
gh variable set AMPLIFY_APP_ID -b "<APP_ID_FROM_STEP_1>"
```

## Notes
- `main` branch auto-build is DISABLED — GitHub Actions triggers releases via
  `aws amplify start-job` (see `.github/workflows/deploy.yml`), gated on CI success.
- SES identity must be verified out-of-band (DKIM records added to the
  management-account Route 53 zone) before the contact form works.
- State bucket: `tf-state-246labs-687159379702`; lock table: `tf-locks-246labs`.
- No long-lived secrets: AWS auth is OIDC (Actions→AWS); the GitHub App handles
  Amplify→GitHub. Nothing sensitive is committed or stored in GitHub/AWS secrets.
