# 246Labs Pipeline Infrastructure (OpenTofu)

Provisions the AWS side of the site's CI/CD in account `687159379702`
(profile `personal-246labs`): the GitHub OIDC provider, the `gha-246labs-deploy`
role, the Amplify app/branch, and the Amplify SSR compute role (SES send).

> Toolchain: this project uses **OpenTofu** (`tofu`). Commands below use `tofu`;
> they are drop-in compatible with `terraform` if you prefer that binary.

## One-time prerequisites
1. A **GitHub fine-grained PAT** with access to the `246labs-site` repo:
   Contents: Read-only, Webhooks: Read and write (Amplify creates a webhook).
   Export it (never commit):
   ```bash
   export TF_VAR_github_access_token=github_pat_xxx
   ```
2. `tofu` (OpenTofu), `aws` CLI (`personal-246labs`), and the repo pushed to GitHub.

## Bootstrap the state backend (once)
```bash
cd infra/bootstrap
tofu init
tofu apply        # creates the S3 state bucket + DynamoDB lock table
```

## Apply the pipeline infra
```bash
cd infra
tofu init         # uses the S3 backend created above
tofu apply \
  -var "github_owner=<OWNER>" \
  -var "github_repo=246labs-site"
# ses_* and ses_identity_arn have working defaults; override if needed.
```

## Wire outputs into GitHub Actions (see plan Task 9)
```bash
gh variable set AWS_REGION -b us-east-1
gh variable set AWS_DEPLOY_ROLE_ARN -b "$(tofu output -raw deploy_role_arn)"
gh variable set AMPLIFY_APP_ID     -b "$(tofu output -raw amplify_app_id)"
```

## Notes
- The `main` branch has auto-build DISABLED — GitHub Actions triggers releases
  via `aws amplify start-job` (see `.github/workflows/deploy.yml`).
- SES identity must be verified out-of-band (DKIM records added to the
  management-account Route 53 zone) before the contact form works.
- The Amplify compute role (`amplify-246labs-compute`) grants `ses:SendEmail`
  to the SSR runtime; if the live contact form cannot send after apply, confirm
  the app's compute/service role in the Amplify console points at that role.
- State bucket: `tf-state-246labs-687159379702`; lock table: `tf-locks-246labs`.
