# 246Labs Self-Hosted Matomo Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.
>
> **Task classes:** Tasks 1–4 are **AUTHORING** (OpenTofu files + committed stack config + the site component, verified by `tofu validate`/`fmt` and the web test suite — no AWS/GitHub mutations, subagent-safe). Tasks 5–6 are **PROVISIONING** (real `tofu apply`, cross-account DNS, the Matomo installer, Amplify env vars, live verify) — controller/human, billable/irreversible; confirm before each.

**Goal:** Stand up privacy-first, self-hosted **Matomo** web analytics for 246labs.cloud on a hardened single EC2 instance in the `246Labs` AWS account, and load a cookieless tracker on the Next.js site.

**Architecture:** OpenTofu module `infra/matomo/` provisions a `t4g.small` EC2 (IMDSv2, encrypted EBS, SSM-only — no SSH) in the default VPC, an Elastic IP, a separate encrypted data volume, an S3 backup bucket, and a DLM snapshot policy. User-data brings up Matomo + MariaDB + Caddy (auto-HTTPS) via Docker Compose. The site loads a cookieless Matomo snippet gated on `NEXT_PUBLIC_MATOMO_*` env vars (no-op until set). Infra applied by the controller; the site change ships via the existing Amplify pipeline.

**Tech Stack:** OpenTofu (`tofu`) + AWS provider ~>5.0, EC2 Graviton/AL2023, Docker Compose (Matomo + MariaDB + Caddy), AWS SSM/DLM/S3, Next.js 16 `next/script`, Vitest.

## Global Constraints

- Account `687159379702` (`246Labs`), region `us-east-1`, profile `personal-246labs`, toolchain **OpenTofu (`tofu`)**. Work from repo root `/Users/christophercorbin/246labs`; feature branch off `main`.
- Instance: **`t4g.small`** (ARM). **IMDSv2 required**; **encrypted** root + data EBS; **no inbound SSH / no port 22 / no key pair** — admin via **SSM Session Manager**. Security group inbound: **443 and 80 only** (80 for ACME); egress all.
- Minimal IAM instance role: SSM managed policy + write to the specific backup bucket only.
- Hostname **`analytics.246labs.cloud`** → **A record to the Elastic IP**, created in the **management** account Route 53 zone (`438465156498`) as a **manual step** with `personal-christopher-corbin` (the `infra/matomo/` module stays single-account).
- Backups: nightly `mysqldump` → **versioned, encrypted S3** (expire > **30 days**) **+** DLM EBS snapshots of the data volume.
- **No secrets in git:** DB passwords generated in user-data, stored in `/srv/matomo/.env` (root-only) and SSM Parameter Store SecureString. The committed compose/Caddyfile reference env, never literals.
- Site tracker is **cookieless** (`disableCookies`), honors DNT, no cookie banner. Config via public env `NEXT_PUBLIC_MATOMO_URL` + `NEXT_PUBLIC_MATOMO_SITE_ID`; the component renders nothing when either is unset (safe to ship pre-install).
- Privacy policy updated to state cookieless self-hosted Matomo (the "no analytics… cookies" line becomes accurate).
- OpenTofu state: existing S3 backend bucket `tf-state-246labs-687159379702`, **key `matomo/terraform.tfstate`** (separate from the site infra state).
- Gate: infra tasks `cd infra/matomo && tofu fmt -check -recursive && tofu init -backend=false && tofu validate`; site task `cd web && npm test && npm run lint && npx tsc --noEmit && npm run build`.

## File Structure

```
infra/matomo/
  versions.tf providers.tf variables.tf backend.tf
  data.tf                  # default VPC/subnet + AL2023 arm64 AMI (SSM param)
  main.tf                  # EC2, EIP, EBS data volume+attach, SG, user-data wiring
  iam.tf                   # SSM role + backup-bucket policy + instance profile
  backups.tf               # S3 backup bucket + DLM snapshot policy
  outputs.tf               # instance id, elastic ip, hostname, backup bucket
  user-data.sh.tftpl       # cloud-init: docker + mount data vol + stack + backup timer
  stack/
    docker-compose.yml     # matomo + mariadb + caddy (env-driven, no secrets)
    Caddyfile              # auto-HTTPS for analytics.246labs.cloud
    backup.sh              # mysqldump → S3
  README.md                # apply + DNS + install runbook
web/
  components/Analytics.tsx # cookieless Matomo snippet (env-gated, no-op if unset)
  app/layout.tsx           # render <Analytics/>
  app/privacy/page.tsx     # corrected cookies wording
  tests/components/Analytics.test.tsx
  tests/pages/privacy.test.tsx  # (extend existing)
```

---

### Task 1: OpenTofu module skeleton + data sources

**Files:** Create `infra/matomo/{versions.tf,providers.tf,variables.tf,backend.tf,data.tf}`

**Interfaces:** Produces vars (`aws_region`, `aws_profile`, `instance_type`, `analytics_hostname`, `data_volume_gb`, `backup_retention_days`) and data sources (`data.aws_vpc.default`, `data.aws_subnets.default`, `data.aws_ssm_parameter.al2023_arm`) consumed by Tasks 2–3.

- [ ] **Step 1: `infra/matomo/versions.tf`**
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

- [ ] **Step 2: `infra/matomo/providers.tf`**
```hcl
provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = {
      Project   = "246labs-matomo"
      ManagedBy = "terraform"
    }
  }
}
```

- [ ] **Step 3: `infra/matomo/backend.tf`**
```hcl
terraform {
  backend "s3" {
    bucket         = "tf-state-246labs-687159379702"
    key            = "matomo/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "tf-locks-246labs"
    encrypt        = true
  }
}
```

- [ ] **Step 4: `infra/matomo/variables.tf`**
```hcl
variable "aws_region" {
  type    = string
  default = "us-east-1"
}
variable "aws_profile" {
  type    = string
  default = "personal-246labs"
}
variable "instance_type" {
  type    = string
  default = "t4g.small"
}
variable "analytics_hostname" {
  type    = string
  default = "analytics.246labs.cloud"
}
variable "data_volume_gb" {
  type    = number
  default = 20
}
variable "backup_retention_days" {
  type    = number
  default = 30
}
```

- [ ] **Step 5: `infra/matomo/data.tf`**
```hcl
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Latest Amazon Linux 2023 ARM64 AMI id, resolved at plan time.
data "aws_ssm_parameter" "al2023_arm" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-arm64"
}
```

- [ ] **Step 6: Validate**

Run: `cd infra/matomo && tofu fmt -check -recursive && tofu init -backend=false && tofu validate`
Expected: fmt clean; `Success! The configuration is valid.` (no resources yet — data sources + vars only).

- [ ] **Step 7: Commit**
```bash
git add infra/matomo/versions.tf infra/matomo/providers.tf infra/matomo/backend.tf infra/matomo/variables.tf infra/matomo/data.tf
git commit -m "feat(matomo): terraform module skeleton + data sources"
```

---

### Task 2: IAM role + backups (S3 + DLM)

**Files:** Create `infra/matomo/iam.tf`, `infra/matomo/backups.tf`

**Interfaces:** Produces `aws_iam_instance_profile.matomo` (consumed by the EC2 in Task 3), `aws_s3_bucket.backups`, `aws_dlm_lifecycle_policy.matomo_data`. Consumes vars/data from Task 1.

- [ ] **Step 1: `infra/matomo/backups.tf`**
```hcl
resource "aws_s3_bucket" "backups" {
  bucket = "matomo-backups-246labs-687159379702"
}
resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id
  versioning_configuration { status = "Enabled" }
}
resource "aws_s3_bucket_server_side_encryption_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id
  rule { apply_server_side_encryption_by_default { sse_algorithm = "AES256" } }
}
resource "aws_s3_bucket_public_access_block" "backups" {
  bucket                  = aws_s3_bucket.backups.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id
  rule {
    id     = "expire-old-dumps"
    status = "Enabled"
    filter {}
    expiration { days = var.backup_retention_days }
    noncurrent_version_expiration { noncurrent_days = var.backup_retention_days }
  }
}

# DLM daily snapshots of volumes tagged Snapshot=matomo-data.
data "aws_iam_policy_document" "dlm_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["dlm.amazonaws.com"]
    }
  }
}
resource "aws_iam_role" "dlm" {
  name               = "matomo-dlm"
  assume_role_policy = data.aws_iam_policy_document.dlm_assume.json
}
resource "aws_iam_role_policy_attachment" "dlm" {
  role       = aws_iam_role.dlm.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSDataLifecycleManagerServiceRole"
}
resource "aws_dlm_lifecycle_policy" "matomo_data" {
  description        = "Daily snapshots of the Matomo data volume"
  execution_role_arn = aws_iam_role.dlm.arn
  state              = "ENABLED"
  policy_details {
    resource_types = ["VOLUME"]
    target_tags    = { Snapshot = "matomo-data" }
    schedule {
      name = "daily"
      create_rule { interval = 24, interval_unit = "HOURS", times = ["05:00"] }
      retain_rule { count = 7 }
      tags_to_add = { SnapshotCreator = "dlm-matomo" }
    }
  }
}
```

- [ ] **Step 2: `infra/matomo/iam.tf`**
```hcl
data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}
resource "aws_iam_role" "matomo" {
  name               = "matomo-instance"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}
# SSM Session Manager access (replaces SSH).
resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.matomo.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}
# Write-only-ish access to the backup bucket + read the SSM params it writes.
data "aws_iam_policy_document" "matomo_inline" {
  statement {
    sid       = "Backups"
    actions   = ["s3:PutObject", "s3:ListBucket"]
    resources = [aws_s3_bucket.backups.arn, "${aws_s3_bucket.backups.arn}/*"]
  }
  statement {
    sid       = "SsmParams"
    actions   = ["ssm:PutParameter", "ssm:GetParameter"]
    resources = ["arn:aws:ssm:${var.aws_region}:*:parameter/matomo/*"]
  }
}
resource "aws_iam_role_policy" "matomo" {
  name   = "matomo-inline"
  role   = aws_iam_role.matomo.id
  policy = data.aws_iam_policy_document.matomo_inline.json
}
resource "aws_iam_instance_profile" "matomo" {
  name = "matomo-instance"
  role = aws_iam_role.matomo.name
}
```

- [ ] **Step 3: Validate**

Run: `cd infra/matomo && tofu fmt -check -recursive && tofu init -backend=false && tofu validate`
Expected: fmt clean; validate succeeds.

- [ ] **Step 4: Commit**
```bash
git add infra/matomo/iam.tf infra/matomo/backups.tf
git commit -m "feat(matomo): SSM instance role, backup S3 bucket, DLM snapshot policy"
```

---

### Task 3: Compute + networking + committed stack + user-data

**Files:** Create `infra/matomo/main.tf`, `infra/matomo/outputs.tf`, `infra/matomo/user-data.sh.tftpl`, `infra/matomo/stack/{docker-compose.yml,Caddyfile,backup.sh}`

**Interfaces:** Consumes Task 1 data/vars + Task 2 `aws_iam_instance_profile.matomo`. Produces outputs `elastic_ip`, `analytics_hostname`, `instance_id`, `backup_bucket`.

- [ ] **Step 1: `infra/matomo/main.tf`** (complete file — the data volume must share the instance's AZ, so the chosen subnet's AZ drives both)
```hcl
data "aws_subnet" "chosen" {
  id = tolist(data.aws_subnets.default.ids)[0]
}

resource "aws_security_group" "matomo" {
  name        = "matomo"
  description = "Matomo: HTTPS + ACME only, no SSH"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "HTTP (ACME + redirect)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_ebs_volume" "data" {
  availability_zone = data.aws_subnet.chosen.availability_zone
  size              = var.data_volume_gb
  type              = "gp3"
  encrypted         = true
  tags              = { Name = "matomo-data", Snapshot = "matomo-data" }
}

resource "aws_instance" "matomo" {
  ami                    = data.aws_ssm_parameter.al2023_arm.value
  instance_type          = var.instance_type
  subnet_id              = data.aws_subnet.chosen.id
  vpc_security_group_ids = [aws_security_group.matomo.id]
  iam_instance_profile   = aws_iam_instance_profile.matomo.name

  metadata_options {
    http_tokens   = "required" # IMDSv2
    http_endpoint = "enabled"
  }
  root_block_device {
    volume_type = "gp3"
    volume_size = 16
    encrypted   = true
  }
  user_data = templatefile("${path.module}/user-data.sh.tftpl", {
    hostname      = var.analytics_hostname
    backup_bucket = aws_s3_bucket.backups.bucket
    region        = var.aws_region
    admin_email   = "admin@246labs.cloud"
  })
  tags = { Name = "matomo" }
}

resource "aws_volume_attachment" "data" {
  device_name = "/dev/sdf"
  volume_id   = aws_ebs_volume.data.id
  instance_id = aws_instance.matomo.id
}

resource "aws_eip" "matomo" {
  instance = aws_instance.matomo.id
  domain   = "vpc"
  tags     = { Name = "matomo" }
}
```

- [ ] **Step 2: `infra/matomo/outputs.tf`**
```hcl
output "elastic_ip" {
  value       = aws_eip.matomo.public_ip
  description = "Add an A record: analytics.246labs.cloud -> this IP (management Route 53 zone)"
}
output "analytics_hostname" { value = var.analytics_hostname }
output "instance_id" { value = aws_instance.matomo.id }
output "backup_bucket" { value = aws_s3_bucket.backups.bucket }
```

- [ ] **Step 3: `infra/matomo/stack/docker-compose.yml`** (env-driven; no secrets in file)
```yaml
services:
  db:
    image: mariadb:11
    restart: unless-stopped
    environment:
      MARIADB_DATABASE: matomo
      MARIADB_USER: matomo
      MARIADB_PASSWORD_FILE: /run/secrets/db_password
      MARIADB_ROOT_PASSWORD_FILE: /run/secrets/db_root_password
    volumes:
      - /srv/matomo/db:/var/lib/mysql
    secrets: [db_password, db_root_password]
    networks: [internal]

  matomo:
    image: matomo:5
    restart: unless-stopped
    environment:
      MATOMO_DATABASE_HOST: db
      MATOMO_DATABASE_USERNAME: matomo
      MATOMO_DATABASE_PASSWORD_FILE: /run/secrets/db_password
      MATOMO_DATABASE_DBNAME: matomo
    volumes:
      - /srv/matomo/matomo:/var/www/html
    secrets: [db_password]
    depends_on: [db]
    networks: [internal, web]

  caddy:
    image: caddy:2
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    volumes:
      - /srv/matomo/Caddyfile:/etc/caddy/Caddyfile:ro
      - /srv/matomo/caddy_data:/data
    depends_on: [matomo]
    networks: [web]

secrets:
  db_password:
    file: /srv/matomo/secrets/db_password
  db_root_password:
    file: /srv/matomo/secrets/db_root_password

networks:
  internal: { internal: true }
  web: {}
```

- [ ] **Step 4: `infra/matomo/stack/Caddyfile`**
```
{$MATOMO_HOSTNAME} {
	reverse_proxy matomo:80
	encode gzip
}
```

- [ ] **Step 5: `infra/matomo/stack/backup.sh`**
```bash
#!/usr/bin/env bash
set -euo pipefail
TS=$(date -u +%Y%m%dT%H%M%SZ)
DUMP="/tmp/matomo-${TS}.sql.gz"
docker exec matomo-db-1 sh -c 'exec mariadb-dump --single-transaction -umatomo -p"$(cat /run/secrets/db_password)" matomo' | gzip > "$DUMP"
aws s3 cp "$DUMP" "s3://${BACKUP_BUCKET}/dumps/matomo-${TS}.sql.gz"
rm -f "$DUMP"
```

- [ ] **Step 6: `infra/matomo/user-data.sh.tftpl`** (cloud-init; installs docker, mounts data vol, writes stack + secrets, starts it, schedules backup)
```bash
#!/usr/bin/env bash
set -euxo pipefail

dnf update -y
dnf install -y docker
systemctl enable --now docker
# docker compose plugin
mkdir -p /usr/local/lib/docker/cli-plugins
curl -fsSL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-aarch64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Mount the data EBS volume (find the non-root NVMe device with no filesystem).
DATA_DEV=""
for d in /dev/nvme*n1; do
  [ "$d" = "$(findmnt -n -o SOURCE / | sed 's/p[0-9]*$//')" ] && continue
  if ! blkid "$d" >/dev/null 2>&1; then DATA_DEV="$d"; break; fi
  # already-formatted data disk (reattach case)
  if blkid "$d" | grep -q 'TYPE="xfs"'; then DATA_DEV="$d"; fi
done
if [ -n "$DATA_DEV" ]; then
  blkid "$DATA_DEV" >/dev/null 2>&1 || mkfs.xfs "$DATA_DEV"
  mkdir -p /srv/matomo
  echo "$DATA_DEV /srv/matomo xfs defaults,nofail 0 2" >> /etc/fstab
  mount -a
fi

mkdir -p /srv/matomo/{db,matomo,caddy_data,secrets}

# Generate DB secrets once; persist to SSM SecureString for recovery.
gen() { tr -dc 'A-Za-z0-9' </dev/urandom | head -c 40; }
if [ ! -f /srv/matomo/secrets/db_password ]; then
  gen > /srv/matomo/secrets/db_password
  gen > /srv/matomo/secrets/db_root_password
  chmod 600 /srv/matomo/secrets/*
  aws ssm put-parameter --region ${region} --name /matomo/db_password --type SecureString \
    --value "$(cat /srv/matomo/secrets/db_password)" --overwrite || true
  aws ssm put-parameter --region ${region} --name /matomo/db_root_password --type SecureString \
    --value "$(cat /srv/matomo/secrets/db_root_password)" --overwrite || true
fi

# Stack files (compose + Caddyfile fetched from instance metadata is not available;
# they are written here from the committed copies baked into user-data at apply time).
cat > /srv/matomo/docker-compose.yml <<'COMPOSE'
${compose_yml}
COMPOSE
cat > /srv/matomo/Caddyfile <<'CADDY'
${caddyfile}
CADDY
cat > /srv/matomo/backup.sh <<'BACKUP'
${backup_sh}
BACKUP
chmod +x /srv/matomo/backup.sh

export MATOMO_HOSTNAME="${hostname}"
echo "MATOMO_HOSTNAME=${hostname}" > /srv/matomo/.env
cd /srv/matomo
MATOMO_HOSTNAME="${hostname}" docker compose --env-file /srv/matomo/.env up -d

# Nightly backup at 04:30 UTC via systemd timer.
cat > /etc/systemd/system/matomo-backup.service <<UNIT
[Service]
Type=oneshot
Environment=BACKUP_BUCKET=${backup_bucket}
ExecStart=/srv/matomo/backup.sh
UNIT
cat > /etc/systemd/system/matomo-backup.timer <<UNIT
[Timer]
OnCalendar=*-*-* 04:30:00 UTC
Persistent=true
[Install]
WantedBy=timers.target
UNIT
systemctl daemon-reload
systemctl enable --now matomo-backup.timer

dnf install -y dnf-automatic
systemctl enable --now dnf-automatic.timer
```
NOTE: the `${compose_yml}`, `${caddyfile}`, `${backup_sh}` template vars are supplied by extending the `templatefile(...)` call in `main.tf` to also pass `compose_yml = file("${path.module}/stack/docker-compose.yml")`, `caddyfile = file("${path.module}/stack/Caddyfile")`, `backup_sh = file("${path.module}/stack/backup.sh")`. Update the Task-1/Step-1 `main.tf` `user_data` block's `templatefile` map to include these three keys.

- [ ] **Step 7: Wire the three stack files into the `templatefile` map** — in `infra/matomo/main.tf`, the `user_data` becomes:
```hcl
  user_data = templatefile("${path.module}/user-data.sh.tftpl", {
    hostname      = var.analytics_hostname
    backup_bucket = aws_s3_bucket.backups.bucket
    region        = var.aws_region
    admin_email   = "admin@246labs.cloud"
    compose_yml   = file("${path.module}/stack/docker-compose.yml")
    caddyfile     = file("${path.module}/stack/Caddyfile")
    backup_sh     = file("${path.module}/stack/backup.sh")
  })
```

- [ ] **Step 8: Validate**

Run: `cd infra/matomo && tofu fmt -check -recursive && tofu init -backend=false && tofu validate`
Expected: fmt clean; `Success! The configuration is valid.` (all resources + templatefile resolve).

- [ ] **Step 9: Commit**
```bash
git add infra/matomo/main.tf infra/matomo/outputs.tf infra/matomo/user-data.sh.tftpl infra/matomo/stack
git commit -m "feat(matomo): EC2/EIP/data-volume/SG + docker-compose stack + user-data"
```

---

### Task 4: Site integration (cookieless tracker) + privacy update

**Files:** Create `web/components/Analytics.tsx`, `web/tests/components/Analytics.test.tsx`; Modify `web/app/layout.tsx`, `web/app/privacy/page.tsx`, `web/tests/pages/privacy.test.tsx`

**Interfaces:** `Analytics()` — reads `process.env.NEXT_PUBLIC_MATOMO_URL` + `NEXT_PUBLIC_MATOMO_SITE_ID`; renders the cookieless snippet only when both are set, else `null`.

- [ ] **Step 1: Write the failing test** `web/tests/components/Analytics.test.tsx`
```tsx
import { render } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Analytics } from "@/components/Analytics";

const OLD = { ...process.env };
afterEach(() => { process.env = { ...OLD }; });

describe("Analytics", () => {
  it("renders nothing when env is not configured", () => {
    delete process.env.NEXT_PUBLIC_MATOMO_URL;
    delete process.env.NEXT_PUBLIC_MATOMO_SITE_ID;
    const { container } = render(<Analytics />);
    expect(container.querySelector("script")).toBeNull();
  });

  it("renders a cookieless Matomo snippet when configured", () => {
    process.env.NEXT_PUBLIC_MATOMO_URL = "https://analytics.246labs.cloud";
    process.env.NEXT_PUBLIC_MATOMO_SITE_ID = "1";
    const { container } = render(<Analytics />);
    const script = container.querySelector("script");
    expect(script).not.toBeNull();
    const js = script?.innerHTML ?? "";
    expect(js).toContain("disableCookies");
    expect(js).toContain("analytics.246labs.cloud");
    expect(js).toContain("matomo.php");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd web && npx vitest run tests/components/Analytics.test.tsx`
Expected: FAIL — module `@/components/Analytics` not found.

- [ ] **Step 3: Create `web/components/Analytics.tsx`**
```tsx
import Script from "next/script";

export function Analytics() {
  const url = process.env.NEXT_PUBLIC_MATOMO_URL;
  const siteId = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;
  if (!url || !siteId) return null;

  const base = url.replace(/\/$/, "");
  const snippet = `
    var _paq = window._paq = window._paq || [];
    _paq.push(['disableCookies']);
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function() {
      var u="${base}/";
      _paq.push(['setTrackerUrl', u+'matomo.php']);
      _paq.push(['setSiteId', '${siteId}']);
      var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
      g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
    })();
  `;
  return (
    <Script id="matomo" strategy="afterInteractive">
      {snippet}
    </Script>
  );
}
```
(The inline JS references `matomo.php`/`matomo.js`; the test asserts `matomo.php` + `disableCookies` + the host.)

- [ ] **Step 4: Render it in `web/app/layout.tsx`** — add the import and render `<Analytics />` as the last child inside `<body>` (after `<Footer />`):
```tsx
import { Analytics } from "@/components/Analytics";
```
```tsx
        <Footer />
        <Analytics />
      </body>
```

- [ ] **Step 5: Update the privacy cookies paragraph** — in `web/app/privacy/page.tsx`, replace the paragraph that begins "This site sets no analytics or advertising cookies." with:
```tsx
        <p>
          We use <strong className="text-ink">Matomo</strong> for analytics —
          self-hosted on our own AWS, cookieless, and never shared with a
          third party. No advertising cookies, no cross-site tracking; we
          respect your browser&apos;s Do Not Track. Our hosting provider (AWS
          Amplify/CloudFront) also keeps standard server logs — IP address,
          user agent, request time — for security and operations.
        </p>
```

- [ ] **Step 6: Update the privacy test** — in `web/tests/pages/privacy.test.tsx`, change the assertion that expects `/no analytics or advertising cookies/i` to assert the new truth:
```tsx
    expect(screen.getByText(/self-hosted on our own AWS, cookieless/i)).toBeInTheDocument();
```
(Keep the other privacy assertions — collection list, deletion email — as-is.)

- [ ] **Step 7: Run tests + full gate**

Run: `cd web && npm test && npm run lint && npx tsc --noEmit && npm run build`
Expected: Analytics tests pass (null when unset; snippet when set); privacy test passes on the new wording; build succeeds (the component is a no-op at build since env is unset locally).

- [ ] **Step 8: Commit**
```bash
git add web/components/Analytics.tsx web/tests/components/Analytics.test.tsx web/app/layout.tsx web/app/privacy/page.tsx web/tests/pages/privacy.test.tsx
git commit -m "feat: cookieless Matomo tracker (env-gated) + privacy policy update"
```

---

### Task 5: PROVISION — apply infra, DNS, install Matomo, wire env

> **CONTROLLER/HUMAN. Billable AWS + cross-account DNS + the Matomo installer. Confirm before `apply`.**

- [ ] **Step 1: Apply the module** (from the branch)
```bash
cd /Users/christophercorbin/246labs/infra/matomo
export AWS_PROFILE=personal-246labs   # backend + provider
tofu init
tofu plan -out matomo.tfplan          # review: EC2, EIP, EBS, SG, IAM, S3, DLM
tofu apply matomo.tfplan
tofu output                            # note elastic_ip, backup_bucket
```

- [ ] **Step 2: DNS (management account, manual)**
Add an A record `analytics.246labs.cloud` → the `elastic_ip` output, in the `246labs.cloud` Route 53 zone (`Z02305342HXRSXC7R8OX5`) using `--profile personal-christopher-corbin`. Wait for it to resolve.

- [ ] **Step 3: Verify infra + security posture**
```bash
P=personal-246labs; IP=<elastic_ip>
aws ec2 describe-instances --profile $P --filters Name=tag:Name,Values=matomo \
  --query 'Reservations[].Instances[].{IMDSv2:MetadataOptions.HttpTokens,State:State.Name}' --output text  # required/running
aws ec2 describe-security-groups --profile $P --filters Name=group-name,Values=matomo \
  --query 'SecurityGroups[].IpPermissions[].FromPort' --output text                                        # 80 443 only (NO 22)
nc -zv -w5 "$IP" 22 && echo "PORT 22 OPEN (FAIL)" || echo "port 22 closed (good)"
curl -sI "https://analytics.246labs.cloud" | head -1                                                       # 200/302 once Caddy has the cert
```
Expected: IMDSv2 required, running; SG exposes only 80/443 (no 22); port 22 closed; HTTPS serves (valid cert; may take a few min for ACME after DNS resolves).

- [ ] **Step 4: Run the Matomo installer (human, browser)**
Open `https://analytics.246labs.cloud` → complete the installer (DB host `db`, user `matomo`, DB name `matomo`, password from `aws ssm get-parameter --name /matomo/db_password --with-decryption`), create the admin user, add website `https://246labs.cloud`. Record the **site-id** (usually `1`). In Matomo → Settings, set `trusted_hosts` to `analytics.246labs.cloud` and force HTTPS.

- [ ] **Step 5: Wire the site env vars (Amplify)**
```bash
aws amplify update-app --app-id d6h6ewkweev1n --profile personal-246labs --region us-east-1 \
  --environment-variables \
  AMPLIFY_DIFF_DEPLOY=false,AMPLIFY_MONOREPO_APP_ROOT=web,SES_REGION=us-east-1,SES_SENDER=no-reply@246labs.cloud,SES_RECIPIENT=hello@246labs.cloud,NEXT_PUBLIC_MATOMO_URL=https://analytics.246labs.cloud,NEXT_PUBLIC_MATOMO_SITE_ID=<SITE_ID>
```
(Preserves the existing env vars; adds the two `NEXT_PUBLIC_MATOMO_*`. These are inlined at `next build`, so a redeploy is required — happens when the branch merges in Task 6.)

---

### Task 6: Ship the site + live verify

> **CONTROLLER. Whole-branch review happens first (SDD), then merge → Amplify deploy → verify.**

- [ ] **Step 1: Ship via pipeline**
```bash
cd /Users/christophercorbin/246labs
git push -u origin feat/matomo-analytics
gh pr create --fill
gh pr merge --squash --auto --delete-branch
```
Wait for CI → deploy → a NEW Amplify job (id greater than current latest) to `SUCCEED` before verifying.

- [ ] **Step 2: Live verify**
```bash
B=https://246labs.cloud
curl -s "$B/?cb=$RANDOM" | grep -c "matomo.php"            # tracker present (env now set)
curl -s "$B/privacy?cb=$RANDOM" | grep -c "cookieless"     # updated policy live
# Then visit the site in a browser and confirm the visit appears in Matomo → Visitors → Real-time.
```
Expected: tracker snippet present, privacy updated; a real visit shows in Matomo real-time.

- [ ] **Step 3: Human checks (user)**
Confirm a browser visit registers in Matomo; confirm no cookie banner (cookieless); confirm `analytics.246labs.cloud` shows a valid cert and only 80/443 respond.

---

## Notes on testing philosophy

- OpenTofu is validated statically (`fmt`/`validate`, no AWS calls) in the authoring tasks; correctness of the running stack is proven by the Task-5 provisioning checks (SSM reachable, no port 22, IMDSv2, HTTPS serving) and the Task-6 live pageview — the real acceptance test.
- The site component is unit-tested for its env-gating contract (null when unset — so shipping before install is safe — and a cookieless snippet when set) and the privacy wording; visual/tracking behavior is the live check.
- Secrets are generated on-box and never enter git or state literals; the plan's committed files reference env/secret files only.
- Security posture is a first-class deliverable (SG 80/443, no SSH, IMDSv2, encrypted EBS) and is explicitly verified in Task 5 — appropriate for a studio that sells security audits.
