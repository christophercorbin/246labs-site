# 246Labs CI/CD Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Task classes:** Tasks 1–6 are **AUTHORING** (write Terraform/YAML/docs; verified statically with no AWS/GitHub mutations — safe for autonomous subagents). Tasks 7–11 are **PROVISIONING/VERIFY** (create a GitHub repo, `terraform apply` real AWS resources, set branch protection, DNS/SES, run the live pipeline). PROVISIONING tasks perform irreversible/billable/outward-facing actions and require the controller or human — **do NOT delegate them to an autonomous subagent, and confirm before each.**

**Goal:** Ship a CI/CD pipeline for the 246Labs site — GitHub Actions runs lint/typecheck/test/build gates on PRs, and merges to `main` deploy the site to AWS Amplify (SSR) in the dedicated `246Labs` account via OIDC, with the AWS pipeline infrastructure defined in Terraform.

**Architecture:** A private GitHub repo hosts the existing `web/` Next.js app. `ci.yml` gates PRs; `deploy.yml` (on push to `main`) assumes an OIDC deploy role in `687159379702` and triggers + polls an Amplify release. Terraform in `infra/` provisions the OIDC provider, the deploy role, the Amplify app/branch (auto-build disabled), and the Amplify SSR compute role that grants the `/api/contact` runtime `ses:SendEmail`. Terraform state lives in S3 + DynamoDB in the same account (created by a one-time bootstrap).

**Tech Stack:** Terraform (`>= 1.6`, AWS provider `~> 5.0`), GitHub Actions, `aws-actions/configure-aws-credentials@v4`, AWS Amplify Hosting (WEB_COMPUTE/SSR), Amazon SES, `gh` CLI, `actionlint` (optional).

## Global Constraints

- **Deploy account:** `687159379702` (dedicated `246Labs`), region `us-east-1`, CLI profile `personal-246labs`.
- **Domain/DNS account:** management `438465156498` (Route 53 zone for `246labs.cloud`); domain stays here.
- **No long-lived AWS credentials in GitHub** — OIDC federation only.
- **Terraform state:** S3 bucket `tf-state-246labs-687159379702` + DynamoDB lock table `tf-locks-246labs` in `687159379702`.
- **OIDC trust** scoped to `repo:<OWNER>/<REPO>:ref:refs/heads/main`, audience `sts.amazonaws.com`.
- **Amplify app** `246labs-site`: `platform = WEB_COMPUTE`, branch `main` with `enable_auto_build = false`; build via repo-root `amplify.yml` (monorepo `appRoot: web`).
- **GitHub PAT** for Amplify's repo connection is supplied only via `TF_VAR_github_access_token`; never committed.
- **SES** runs in `687159379702`; the Amplify compute role grants `ses:SendEmail`/`ses:SendRawEmail` on the verified identity.
- **Node 22** in CI. CI required status check name: `verify`.
- Prereqs on the executing machine: `terraform`, `gh` (authenticated), `aws` CLI with `personal-246labs`.
- Secrets never committed; `infra/.gitignore` excludes `*.tfstate*`, `.terraform/`, `*.tfvars`.

## File Structure

```
infra/
  versions.tf providers.tf variables.tf backend.tf
  oidc.tf iam-deploy.tf iam-compute.tf amplify.tf outputs.tf
  terraform.tfvars.example
  .gitignore
  README.md                      # runbook: bootstrap → apply → wire-up
  bootstrap/
    main.tf versions.tf          # state bucket + lock table (local state)
.github/workflows/
  ci.yml                         # lint/typecheck/test/build gate
  deploy.yml                     # OIDC → amplify start-job → poll
amplify.yml                      # existing build spec (unchanged)
web/                             # existing Next.js app (unchanged)
```

---

### Task 1: Terraform skeleton + state bootstrap

**Files:**
- Create: `infra/versions.tf`, `infra/providers.tf`, `infra/variables.tf`,
  `infra/backend.tf`, `infra/terraform.tfvars.example`, `infra/.gitignore`,
  `infra/bootstrap/versions.tf`, `infra/bootstrap/main.tf`

**Interfaces:**
- Produces: variables `aws_region`, `aws_profile`, `github_owner`, `github_repo`,
  `github_access_token` (sensitive), `ses_region`, `ses_sender`, `ses_recipient`,
  `ses_identity_arn` — consumed by Tasks 2–3. Backend bucket/table names consumed
  by the apply runbook (Task 8).

- [ ] **Step 1: Confirm terraform is available**

Run: `terraform version`
Expected: version `>= 1.6.0`. If missing, stop and report (prereq).

- [ ] **Step 2: Create `infra/versions.tf`**

```hcl
terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
```

- [ ] **Step 3: Create `infra/providers.tf`**

```hcl
provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = {
      Project   = "246labs-site"
      ManagedBy = "terraform"
    }
  }
}
```

- [ ] **Step 4: Create `infra/variables.tf`**

```hcl
variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "aws_profile" {
  type    = string
  default = "personal-246labs"
}

variable "github_owner" {
  type = string
}

variable "github_repo" {
  type    = string
  default = "246labs-site"
}

variable "github_access_token" {
  type      = string
  sensitive = true
}

variable "ses_region" {
  type    = string
  default = "us-east-1"
}

variable "ses_sender" {
  type    = string
  default = "no-reply@246labs.cloud"
}

variable "ses_recipient" {
  type    = string
  default = "hello@246labs.cloud"
}

variable "ses_identity_arn" {
  type        = string
  description = "ARN of the verified SES identity the compute role may send from"
  default     = "arn:aws:ses:us-east-1:687159379702:identity/246labs.cloud"
}
```

- [ ] **Step 5: Create `infra/backend.tf`**

```hcl
terraform {
  backend "s3" {
    bucket         = "tf-state-246labs-687159379702"
    key            = "site/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "tf-locks-246labs"
    encrypt        = true
  }
}
```

- [ ] **Step 6: Create `infra/.gitignore`**

```gitignore
.terraform/
.terraform.lock.hcl
*.tfstate
*.tfstate.*
*.tfvars
!*.tfvars.example
crash.log
```

- [ ] **Step 7: Create `infra/terraform.tfvars.example`**

```hcl
github_owner  = "your-github-username"
github_repo   = "246labs-site"
ses_sender    = "no-reply@246labs.cloud"
ses_recipient = "hello@246labs.cloud"
# github_access_token is provided via TF_VAR_github_access_token env var, NOT here.
```

- [ ] **Step 8: Create `infra/bootstrap/versions.tf`**

```hcl
terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
```

- [ ] **Step 9: Create `infra/bootstrap/main.tf`** (local state — creates the backend)

```hcl
provider "aws" {
  region  = "us-east-1"
  profile = "personal-246labs"
}

resource "aws_s3_bucket" "tf_state" {
  bucket = "tf-state-246labs-687159379702"
}

resource "aws_s3_bucket_versioning" "tf_state" {
  bucket = aws_s3_bucket.tf_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tf_state" {
  bucket = aws_s3_bucket.tf_state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "tf_state" {
  bucket                  = aws_s3_bucket.tf_state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "tf_locks" {
  name         = "tf-locks-246labs"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }
}
```

- [ ] **Step 10: Validate formatting and syntax (no AWS calls)**

Run:
```bash
cd infra && terraform fmt -check -recursive
terraform init -backend=false && terraform validate
cd bootstrap && terraform init -backend=false && terraform validate
```
Expected: `terraform fmt -check` clean; both `validate` print `Success! The configuration is valid.` (`-backend=false` skips S3/credential access.) Note: `infra` validate will FAIL only if Tasks 2–3 resources are referenced but absent — at this task, `infra/` contains no resources yet, so it validates clean.

- [ ] **Step 11: Commit**

```bash
cd /Users/christophercorbin/246labs
git add infra/versions.tf infra/providers.tf infra/variables.tf infra/backend.tf \
  infra/.gitignore infra/terraform.tfvars.example infra/bootstrap
git commit -m "feat(infra): terraform skeleton + S3/DynamoDB state bootstrap"
```

---

### Task 2: Terraform — GitHub OIDC provider + deploy role

**Files:**
- Create: `infra/oidc.tf`, `infra/iam-deploy.tf`

**Interfaces:**
- Consumes: variables `github_owner`, `github_repo` (Task 1).
- Produces: `aws_iam_openid_connect_provider.github`, `aws_iam_role.deploy`
  (name `gha-246labs-deploy`) — the deploy role references `aws_amplify_app.site.arn`
  created in Task 3.

- [ ] **Step 1: Create `infra/oidc.tf`**

```hcl
resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
  ]
}
```

- [ ] **Step 2: Create `infra/iam-deploy.tf`**

```hcl
data "aws_iam_policy_document" "deploy_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_owner}/${var.github_repo}:ref:refs/heads/main"]
    }
  }
}

resource "aws_iam_role" "deploy" {
  name               = "gha-246labs-deploy"
  assume_role_policy = data.aws_iam_policy_document.deploy_trust.json
}

data "aws_iam_policy_document" "deploy_perms" {
  statement {
    effect = "Allow"
    actions = [
      "amplify:StartJob",
      "amplify:GetJob",
      "amplify:GetApp",
      "amplify:GetBranch",
    ]
    resources = [
      aws_amplify_app.site.arn,
      "${aws_amplify_app.site.arn}/*",
    ]
  }
}

resource "aws_iam_role_policy" "deploy" {
  name   = "amplify-deploy"
  role   = aws_iam_role.deploy.id
  policy = data.aws_iam_policy_document.deploy_perms.json
}
```

- [ ] **Step 3: Format check (validate deferred to Task 3)**

Run: `cd infra && terraform fmt -check -recursive`
Expected: clean. NOTE: `terraform validate` will fail here because `aws_amplify_app.site` is defined in Task 3; that reference resolves once Task 3 lands. Do not run `validate` until Task 3 is complete.

- [ ] **Step 4: Commit**

```bash
git add infra/oidc.tf infra/iam-deploy.tf
git commit -m "feat(infra): GitHub OIDC provider and scoped Amplify deploy role"
```

---

### Task 3: Terraform — Amplify app/branch, compute (SES) role, outputs

**Files:**
- Create: `infra/amplify.tf`, `infra/iam-compute.tf`, `infra/outputs.tf`

**Interfaces:**
- Consumes: variables (Task 1); referenced by `iam-deploy.tf` (Task 2) via
  `aws_amplify_app.site.arn`.
- Produces: `aws_amplify_app.site`, `aws_amplify_branch.main`,
  `aws_iam_role.amplify_compute`; outputs `amplify_app_id`,
  `amplify_default_domain`, `deploy_role_arn`, `amplify_compute_role_arn`
  (consumed by the wire-up runbook, Task 9).

- [ ] **Step 1: Create `infra/iam-compute.tf`** (SSR runtime SES permission)

```hcl
data "aws_iam_policy_document" "amplify_compute_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["amplify.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "amplify_compute" {
  name               = "amplify-246labs-compute"
  assume_role_policy = data.aws_iam_policy_document.amplify_compute_trust.json
}

data "aws_iam_policy_document" "amplify_ses" {
  statement {
    effect    = "Allow"
    actions   = ["ses:SendEmail", "ses:SendRawEmail"]
    resources = [var.ses_identity_arn]
  }
}

resource "aws_iam_role_policy" "amplify_ses" {
  name   = "ses-send"
  role   = aws_iam_role.amplify_compute.id
  policy = data.aws_iam_policy_document.amplify_ses.json
}
```

- [ ] **Step 2: Create `infra/amplify.tf`**

```hcl
resource "aws_amplify_app" "site" {
  name                 = "246labs-site"
  repository           = "https://github.com/${var.github_owner}/${var.github_repo}"
  access_token         = var.github_access_token
  platform             = "WEB_COMPUTE"
  iam_service_role_arn = aws_iam_role.amplify_compute.arn
  build_spec           = file("${path.module}/../amplify.yml")

  environment_variables = {
    SES_REGION                = var.ses_region
    SES_SENDER                = var.ses_sender
    SES_RECIPIENT             = var.ses_recipient
    AMPLIFY_MONOREPO_APP_ROOT = "web"
  }
}

resource "aws_amplify_branch" "main" {
  app_id            = aws_amplify_app.site.id
  branch_name       = "main"
  enable_auto_build = false
  stage             = "PRODUCTION"
  framework         = "Next.js - SSR"
}
```

- [ ] **Step 3: Create `infra/outputs.tf`**

```hcl
output "amplify_app_id" {
  value = aws_amplify_app.site.id
}

output "amplify_default_domain" {
  value = aws_amplify_app.site.default_domain
}

output "deploy_role_arn" {
  value = aws_iam_role.deploy.arn
}

output "amplify_compute_role_arn" {
  value = aws_iam_role.amplify_compute.arn
}
```

- [ ] **Step 4: Full validate (still no AWS calls)**

Run:
```bash
cd infra && terraform fmt -check -recursive
terraform init -backend=false && terraform validate
```
Expected: `fmt` clean; `validate` prints `Success! The configuration is valid.` (all cross-file references — `aws_amplify_app.site.arn` in `iam-deploy.tf` — now resolve).

- [ ] **Step 5: Commit**

```bash
git add infra/amplify.tf infra/iam-compute.tf infra/outputs.tf
git commit -m "feat(infra): Amplify app/branch, SSR compute SES role, outputs"
```

---

### Task 4: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Produces: a job named `verify` — its check name is the required status check
  for branch protection (Task 9).

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: web
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: web/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test
      - run: npm run build
```

- [ ] **Step 2: Validate the workflow YAML**

Run (prefer actionlint if present, else YAML parse):
```bash
command -v actionlint >/dev/null && actionlint .github/workflows/ci.yml \
  || python3 -c "import yaml;yaml.safe_load(open('.github/workflows/ci.yml'));print('yaml ok')"
```
Expected: `actionlint` exits 0 with no findings, or `yaml ok`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add lint/typecheck/test/build gate workflow"
```

---

### Task 5: Deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: GitHub Actions repo variables `AWS_DEPLOY_ROLE_ARN`, `AWS_REGION`,
  `AMPLIFY_APP_ID` (set in Task 9).

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy

on:
  push:
    branches: [main]

permissions:
  id-token: write
  contents: read

concurrency:
  group: deploy-main
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ vars.AWS_DEPLOY_ROLE_ARN }}
          aws-region: ${{ vars.AWS_REGION }}

      - name: Trigger and await Amplify release
        env:
          APP_ID: ${{ vars.AMPLIFY_APP_ID }}
        run: |
          set -euo pipefail
          JOB_ID=$(aws amplify start-job \
            --app-id "$APP_ID" --branch-name main --job-type RELEASE \
            --query 'jobSummary.jobId' --output text)
          echo "Started Amplify release job $JOB_ID"
          while true; do
            STATUS=$(aws amplify get-job \
              --app-id "$APP_ID" --branch-name main --job-id "$JOB_ID" \
              --query 'job.summary.status' --output text)
            echo "status=$STATUS"
            case "$STATUS" in
              SUCCEED)          echo "Deploy succeeded"; exit 0 ;;
              FAILED|CANCELLED) echo "Deploy $STATUS"; exit 1 ;;
              *)                sleep 15 ;;
            esac
          done
```

- [ ] **Step 2: Validate the workflow YAML**

Run:
```bash
command -v actionlint >/dev/null && actionlint .github/workflows/deploy.yml \
  || python3 -c "import yaml;yaml.safe_load(open('.github/workflows/deploy.yml'));print('yaml ok')"
```
Expected: no findings / `yaml ok`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add OIDC-authenticated Amplify deploy workflow"
```

---

### Task 6: Infra runbook + repo docs

**Files:**
- Create: `infra/README.md`

**Interfaces:** none (documentation).

- [ ] **Step 1: Create `infra/README.md`** documenting the exact provisioning runbook

````markdown
# 246Labs Pipeline Infrastructure (Terraform)

Provisions the AWS side of the site's CI/CD in account `687159379702`
(profile `personal-246labs`): GitHub OIDC provider, the `gha-246labs-deploy`
role, the Amplify app/branch, and the Amplify SSR compute role (SES send).

## One-time prerequisites
1. A **GitHub fine-grained PAT** with access to the `246labs-site` repo:
   Contents: Read-only, Webhooks: Read and write (Amplify creates a webhook).
   Export it (never commit):
   ```bash
   export TF_VAR_github_access_token=github_pat_xxx
   ```
2. `terraform`, `aws` CLI (`personal-246labs`), and the repo pushed to GitHub.

## Bootstrap the state backend (once)
```bash
cd infra/bootstrap
terraform init
terraform apply        # creates the S3 state bucket + DynamoDB lock table
```

## Apply the pipeline infra
```bash
cd infra
terraform init         # uses the S3 backend created above
terraform apply \
  -var "github_owner=<OWNER>" \
  -var "github_repo=246labs-site"
# ses_* and ses_identity_arn have working defaults; override if needed.
```

## Wire outputs into GitHub Actions (see plan Task 9)
```bash
gh variable set AWS_REGION -b us-east-1
gh variable set AWS_DEPLOY_ROLE_ARN -b "$(terraform output -raw deploy_role_arn)"
gh variable set AMPLIFY_APP_ID     -b "$(terraform output -raw amplify_app_id)"
```

## Notes
- `main` branch has auto-build DISABLED — GitHub Actions triggers releases.
- SES identity must be verified out-of-band (DKIM records added to the
  management-account Route 53 zone) before the contact form works.
- The Amplify compute role grants `ses:SendEmail` to the SSR runtime; if the
  live contact form cannot send after apply, confirm the app's compute/service
  role in the Amplify console points at `amplify-246labs-compute`.
````

- [ ] **Step 2: Commit**

```bash
git add infra/README.md
git commit -m "docs(infra): provisioning runbook for the pipeline"
```

---

### Task 7: PROVISIONING — create private GitHub repo + push `main`

> **CONTROLLER/HUMAN. Outward-facing (creates a public-facing GitHub repo under your account) and pushes all history. Confirm before running.**

**Files:** none (git remote + push).

- [ ] **Step 1: Confirm gh auth and capture the owner**

Run:
```bash
gh auth status
OWNER=$(gh api user --jq .login); echo "owner=$OWNER"
```
Expected: authenticated; `owner=<your-login>`. Record `$OWNER` for later tasks.

- [ ] **Step 2: Create the private repo and push current `main`**

Run from `/Users/christophercorbin/246labs`:
```bash
gh repo create 246labs-site --private --source=. --remote=origin --push
```
Expected: repo `https://github.com/<OWNER>/246labs-site` created; `main` pushed.

- [ ] **Step 3: Verify**

Run: `git remote -v && gh repo view --json visibility,defaultBranchRef`
Expected: `origin` points at the new repo; visibility `PRIVATE`; default branch `main`.

---

### Task 8: PROVISIONING — apply Terraform (bootstrap → infra)

> **CONTROLLER/HUMAN. Creates real, billable AWS resources (S3, DynamoDB, IAM, Amplify) in `687159379702`. The GitHub PAT is required. Confirm before `apply`.**

**Files:** none (Terraform apply; state stored remotely).

- [ ] **Step 1: Provide the GitHub PAT (human)**

Generate a fine-grained PAT (repo `246labs-site`: Contents read, Webhooks read/write), then:
```bash
export TF_VAR_github_access_token=github_pat_xxx
```

- [ ] **Step 2: Bootstrap the state backend**

```bash
cd /Users/christophercorbin/246labs/infra/bootstrap
terraform init
terraform apply   # review plan, confirm: creates tf-state-246labs-687159379702 + tf-locks-246labs
```
Expected: bucket + table created; apply complete.

- [ ] **Step 3: Apply the pipeline infra**

```bash
cd /Users/christophercorbin/246labs/infra
terraform init
terraform apply -var "github_owner=$OWNER" -var "github_repo=246labs-site"
```
Expected: creates the OIDC provider, `gha-246labs-deploy`, `amplify-246labs-compute`,
the Amplify app + `main` branch. Review the plan before confirming.

- [ ] **Step 4: Capture outputs**

Run: `terraform output`
Expected: non-empty `amplify_app_id`, `deploy_role_arn`, `amplify_compute_role_arn`,
`amplify_default_domain`. Record them (used in Task 9).

---

### Task 9: PROVISIONING — wire outputs into GitHub + branch protection

> **CONTROLLER/HUMAN. Configures the repo. Confirm before running.**

**Files:** none (`gh` API calls).

- [ ] **Step 1: Set Actions variables from Terraform outputs**

```bash
cd /Users/christophercorbin/246labs/infra
gh variable set AWS_REGION -b us-east-1
gh variable set AWS_DEPLOY_ROLE_ARN -b "$(terraform output -raw deploy_role_arn)"
gh variable set AMPLIFY_APP_ID     -b "$(terraform output -raw amplify_app_id)"
```
Expected: three variables set (verify with `gh variable list`).

- [ ] **Step 2: Require the `verify` check on `main`**

The branch-protection API needs a typed JSON body (nested objects + booleans),
so pipe JSON via `--input -` rather than `-f key=val` (which sends strings and
mangles the payload):
```bash
gh api -X PUT "repos/$OWNER/246labs-site/branches/main/protection" \
  -H "Accept: application/vnd.github+json" \
  --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["verify"] },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null
}
JSON
```
Expected: HTTP 200 with the protection object. (`verify` is the CI job name from
Task 4; `required_pull_request_reviews: null` = no mandatory reviews for a solo
dev; `restrictions: null` = no push-actor restriction.)

- [ ] **Step 3: Verify protection**

Run: `gh api "repos/$OWNER/246labs-site/branches/main/protection" --jq '.required_status_checks.contexts'`
Expected: `["verify"]`.

---

### Task 10: MANUAL — domain DNS (management) + SES verification

> **HUMAN. Cross-account and out-of-band; documented for completeness. The pipeline works without this, but the custom domain and the live contact form do not until it's done.**

- [ ] **Step 1: Attach the custom domain in Amplify**

In the Amplify console (account `687159379702`) → app `246labs-site` → Domain
management → add `246labs.cloud`. Amplify shows CNAME/verification records.

- [ ] **Step 2: Add the DNS records into the management Route 53 zone**

In account `438465156498` (profile `personal-christopher-corbin`), add the
Amplify-provided verification + CNAME records to the `246labs.cloud` hosted zone.
Expected: Amplify domain status becomes `AVAILABLE`.

- [ ] **Step 3: Verify the SES sender identity**

In `687159379702`, verify the SES domain/address for `SES_SENDER` (add the DKIM
records to the same management Route 53 zone). If SES is in sandbox, also verify
`SES_RECIPIENT` or request production access.
Expected: SES identity `Verified`; `arn:aws:ses:us-east-1:687159379702:identity/246labs.cloud`
matches `var.ses_identity_arn`.

---

### Task 11: VERIFY — end-to-end pipeline run

> **CONTROLLER/HUMAN. Exercises the live pipeline.**

- [ ] **Step 1: Open a trivial PR and confirm the gate**

```bash
git checkout -b ci-smoke
# make a no-op visible change, e.g. a comment in web/app/page.tsx
git commit -am "chore: ci smoke test"
git push -u origin ci-smoke
gh pr create --fill
```
Expected: the `verify` check runs on the PR; the PR cannot merge until it is green.

- [ ] **Step 2: Merge and confirm deploy**

```bash
gh pr merge --squash --auto
```
Expected: on merge to `main`, `deploy.yml` runs — assumes the OIDC role, starts
an Amplify RELEASE job, polls to `SUCCEED`. Confirm in the Actions tab and that
the Amplify default domain serves the updated site.

- [ ] **Step 3: Negative check + contact form**

- Push a branch whose test fails; confirm its PR's `verify` check fails and the
  PR is blocked from merging.
- Once Task 10 is done, submit the live contact form and confirm an email
  arrives (proves the compute role's SES permission works end-to-end).

---

## Notes on testing philosophy

- **Authoring tasks (1–6)** are verified statically — `terraform fmt -check`,
  `terraform validate` (with `-backend=false`, no AWS calls), and workflow YAML
  linting. This is the meaningful "test" for declarative infra; there is no unit
  behavior to TDD.
- **Provisioning/verify tasks (7–11)** are validated by their real effects
  (resources created, outputs present, protection object returned) and by the
  end-to-end pipeline run in Task 11 — the true acceptance test.
- **Deploy safety:** the deploy workflow fails unless the Amplify job reaches
  `SUCCEED`; branch protection prevents un-verified code from reaching `main`
  (and therefore from deploying); OIDC trust is pinned to `refs/heads/main`.
