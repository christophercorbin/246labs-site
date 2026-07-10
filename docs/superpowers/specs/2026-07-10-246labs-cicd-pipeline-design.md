# 246Labs CI/CD Pipeline — Design Spec

**Date:** 2026-07-10
**Status:** Approved (design), pending implementation plan
**Repo:** 246Labs marketing site (`web/` Next.js app, already on local `main`)

## Overview

Continuous integration and deployment for the 246Labs marketing site. Pull
requests and pushes run automated quality gates (lint, typecheck, test, build)
via GitHub Actions; merges to `main` deploy the site to AWS Amplify Hosting
(SSR) in the dedicated `246Labs` account. GitHub Actions authenticates to AWS
with short-lived OIDC tokens — no long-lived credentials are stored anywhere.
The AWS-side pipeline infrastructure (OIDC provider, deploy role, Amplify app)
is defined as code in Terraform.

This pipeline is also a dogfooding/portfolio artifact for the studio: the site
that advertises "DevOps / CI/CD / hosting" is itself shipped by a reproducible,
least-privilege, IaC-defined pipeline.

## Goals

- Every PR is gated on lint + typecheck + test + build before it can merge.
- Merges to `main` deploy automatically to Amplify (SSR), with the workflow
  failing loudly if the Amplify build fails.
- No long-lived AWS credentials in GitHub (OIDC federation only).
- The pipeline's AWS infrastructure is reproducible via Terraform.

## Non-Goals (this pass)

- Per-PR preview environments.
- A separate staging environment.
- Running Terraform itself through CI (plan-on-PR/apply-on-merge) — applied
  locally for now; documented as a follow-up.
- Migrating the domain out of the management account.

## Accounts & Context

- **Deploy target account:** dedicated `246Labs` — `687159379702`. CLI profile
  `personal-246labs` (AdministratorAccess), `personal-246labs-ro` (ReadOnly).
- **Domain/DNS account:** management — `438465156498`. `246labs.cloud` is
  registered here with a Route 53 hosted zone. Domain stays here; the Amplify
  custom-domain DNS records are added into this zone (cross-account, manual).
- **Git host:** a new **private** GitHub repository, created via `gh`.

## Source & Branching

- Push the existing local `main` (full history) to the new private GitHub repo.
- Trunk-based flow: feature branch → PR → `main`.
- **Branch protection on `main`:** require the CI status check to pass and the
  branch to be up to date before merging. (Configured via `gh api`.)

## CI — `.github/workflows/ci.yml`

- **Triggers:** `pull_request` (any branch → `main`) and `push` to `main`.
- **Job `verify`** — `ubuntu-latest`, Node 22, `defaults.run.working-directory: web`:
  1. `actions/checkout`
  2. `actions/setup-node` (node 22, `cache: npm`, `cache-dependency-path: web/package-lock.json`)
  3. `npm ci`
  4. Lint — `npm run lint`
  5. Typecheck — `npx tsc --noEmit`
  6. Test — `npm test` (`vitest run`)
  7. Build — `npm run build`
- This job's success is the required status check for merging to `main`.

## CD — `.github/workflows/deploy.yml`

- **Trigger:** `push` to `main` (i.e., after a PR merges).
- **Permissions:** `id-token: write`, `contents: read`.
- **Concurrency:** `group: deploy-main`, `cancel-in-progress: false` (serialize
  deploys; never cancel a release mid-flight).
- **Steps:**
  1. `aws-actions/configure-aws-credentials` — assume `gha-246labs-deploy` in
     `687159379702` via OIDC (region `us-east-1`).
  2. Start an Amplify release:
     `aws amplify start-job --app-id "$AMPLIFY_APP_ID" --branch-name main --job-type RELEASE`
     (`AMPLIFY_APP_ID` from a GitHub Actions **variable**, not a secret).
  3. Poll `aws amplify get-job` until the job's `status` is terminal; the step
     fails the workflow unless status is `SUCCEED`.
- Rationale (recorded design decision): Amplify's own auto-build is **disabled**
  so GitHub Actions is the single deploy trigger and status surface, while
  Amplify still performs the managed Next.js SSR build via `amplify.yml`. This
  avoids double-deploys.

## AWS Infrastructure as Code — `infra/` (Terraform)

- **Provider:** `aws`, region `us-east-1`, assumes/uses the `personal-246labs`
  profile (account `687159379702`).
- **State backend:** S3 + DynamoDB lock table in `687159379702`.
  - Bootstrap: the state S3 bucket and DynamoDB lock table are created by a
    one-time bootstrap (a minimal separate Terraform config with local state, or
    documented `aws` CLI commands), because the backend cannot store its own
    creation. After bootstrap, the main config uses the `s3` backend.
- **Resources managed:**
  - `aws_iam_openid_connect_provider` for `token.actions.githubusercontent.com`
    (standard thumbprint + `sts.amazonaws.com` audience).
  - `aws_iam_role` **`gha-246labs-deploy`** — trust policy federated to the OIDC
    provider, condition scoping `token.actions.githubusercontent.com:sub` to
    `repo:<OWNER>/<REPO>:ref:refs/heads/main` and `aud` to `sts.amazonaws.com`.
  - `aws_iam_role_policy` — least privilege: `amplify:StartJob`,
    `amplify:GetJob`, `amplify:GetApp`, `amplify:GetBranch`, scoped to the
    specific Amplify app ARN.
  - `aws_amplify_app` — the site app: `platform = "WEB_COMPUTE"` (Next.js SSR),
    `repository` = the GitHub repo URL, `access_token` = a **sensitive
    variable** (GitHub fine-grained PAT with repo contents read + admin:repo_hook
    as required by Amplify), the existing `amplify.yml` build spec (or `app_root`
    = `web` for the monorepo), and non-secret environment variables
    `SES_REGION` / `SES_SENDER` / `SES_RECIPIENT`.
  - `aws_amplify_branch` — `main`, `enable_auto_build = false`,
    `stage = "PRODUCTION"`.
  - **Amplify compute/service role** — an `aws_iam_role` set as the app's
    `iam_service_role_arn`, granting the SSR runtime `ses:SendEmail` /
    `ses:SendRawEmail` scoped to the verified SES identity ARN. This is the
    RUNTIME permission the `/api/contact` route needs to send mail — distinct
    from the `gha-246labs-deploy` role, which only triggers deploys. SES runs
    in the same account as the app (`687159379702`).
- **Variables:** `github_owner`, `github_repo`, `github_access_token`
  (sensitive; supplied via `TF_VAR_github_access_token` env var, never
  committed), `ses_sender`, `ses_recipient`, `ses_region` (default `us-east-1`).
- **Outputs:** `amplify_app_id` (fed to the GitHub Actions `AMPLIFY_APP_ID`
  variable), `deploy_role_arn` (fed to the deploy workflow), `amplify_default_domain`.
- `infra/.gitignore` excludes `*.tfstate*`, `.terraform/`, and any `*.tfvars`
  holding real values.

## Repo Layout

```
infra/                     # Terraform: backend, OIDC, IAM role, Amplify app/branch
  main.tf, variables.tf, outputs.tf, backend.tf, versions.tf
  bootstrap/               # one-time state-bucket + lock-table config (local state)
.github/workflows/
  ci.yml                   # lint / typecheck / test / build gate
  deploy.yml               # OIDC → amplify start-job → poll
web/                       # the Next.js app (unchanged)
amplify.yml                # build spec (unchanged, monorepo appRoot: web)
docs/superpowers/          # specs + plans
```

## Secrets & Configuration

- **No AWS keys in GitHub** — OIDC only.
- GitHub Actions **variables** (not secrets): `AMPLIFY_APP_ID`, `AWS_REGION`,
  `AWS_DEPLOY_ROLE_ARN`.
- SES config (`SES_REGION`/`SES_SENDER`/`SES_RECIPIENT`) lives on the Amplify
  app (set by Terraform); it is configuration, not secret.
- The GitHub PAT for Amplify's repo connection is supplied to Terraform via
  `TF_VAR_github_access_token` and never committed.

## Manual, One-Time Steps (documented in the plan)

1. `gh auth status` confirmed; create the private repo and push `main`.
2. Generate a GitHub fine-grained PAT for the Amplify repo connection; export as
   `TF_VAR_github_access_token`.
3. `terraform apply` the bootstrap, then the main `infra/` config (locally, via
   `personal-246labs`).
4. Wire Terraform outputs into GitHub Actions variables (`gh variable set`).
5. Configure branch protection on `main` (`gh api`).
6. Add the Amplify custom-domain DNS records for `246labs.cloud` into the
   management-account Route 53 zone (cross-account; manual).
7. Verify the SES sender identity (domain or address) in `687159379702` before
   the contact form works in production; if SES is in sandbox, verify the
   recipient too or request production access. Terraform wires the Amplify
   compute role's `ses:SendEmail` to this identity — the identity itself is
   verified out-of-band (DKIM records added to the management Route 53 zone).

## Error Handling & Edge Cases

- Deploy workflow fails if the Amplify job status is not `SUCCEED` (no silent
  green on a failed build).
- Concurrency group serializes deploys so two merges can't race a release.
- CI runs on PRs so a broken change never reaches `main` (branch protection
  enforces it).
- OIDC trust is scoped to `refs/heads/main` so only merged code can assume the
  deploy role — a PR from a fork/branch cannot deploy.

## Testing the Pipeline

- Open a trivial PR → confirm the `verify` job runs and gates the merge.
- Merge → confirm `deploy.yml` assumes the role via OIDC, triggers the Amplify
  release, polls to `SUCCEED`, and the live site reflects the change.
- Confirm the contact form works end-to-end once SES is verified.
- Negative check: a PR that fails a test cannot be merged.

## Follow-Ups (out of scope, noted for later)

- Terraform in CI (plan-on-PR, apply-on-merge) with its own OIDC role.
- Per-PR Amplify preview environments; a staging branch/env.
- Moving the domain into the dedicated account (free Route 53 change-ownership).
- Post-deploy smoke test (curl the deployed URL / synthetic check).
