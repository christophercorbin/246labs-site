# 246Labs Self-Hosted Matomo Analytics — Design Spec

**Date:** 2026-07-13
**Status:** Approved (design), pending implementation plan
**Site:** https://246labs.cloud · repo `christophercorbin/246labs-site` (app in `web/`)

## Overview

Privacy-first, self-hosted web analytics for 246labs.cloud using **Matomo**,
running on the studio's own AWS (account `246Labs`, `687159379702`). Chosen over
hosted analytics for data ownership and as a live "we run our own infrastructure"
proof point. Matomo runs on a single hardened EC2 instance via Docker Compose;
the Next.js site loads a cookieless tracker; the privacy policy is updated to
match. Because 246Labs sells security & compliance audits, the box is hardened
from the start (a self-hosted tool that fails a security scan is unacceptable).

This is a new subsystem (analytics infra + a small site integration), separate
from the site's CI/CD. It ships in two phases: infra first, then the
site-integration once Matomo yields a site-id.

## Goals

- Know the marketing traffic (visitors, sources, top pages) about to be driven
  to the site — first-party, cookieless, no cookie banner.
- Data owned in 246Labs' own AWS account; no third-party analytics vendor.
- A hardened, patchable, backed-up deployment defined in OpenTofu (dogfooding
  the studio's IaC + AWS practice).

## Non-Goals

- No HA/multi-node, no CDN in front of Matomo, no log-import analytics, no
  Matomo plugins beyond core, no BI/warehouse export.
- No change to the site's CI/CD pipeline, contact backend, or brand.
- Not a hosted-Matomo or SaaS-analytics option (deliberately self-hosted).

## Architecture

**Account/region:** `687159379702` (`246Labs`), `us-east-1`, CLI profile
`personal-246labs`. Toolchain: OpenTofu (`tofu`), matching the existing IaC.

**Compute:** one **`t4g.small` (Graviton/ARM)** EC2 instance running three
containers via **Docker Compose**:
- **Matomo** (official image, ARM-compatible tag),
- **MariaDB** (persisted on a dedicated encrypted EBS data volume),
- **Caddy** as reverse proxy with **automatic HTTPS** (Let's Encrypt) for
  `analytics.246labs.cloud`.

**Addressing:** an **Elastic IP** attached to the instance so the DNS A record
is stable across reboots.

**Storage:** encrypted EBS root; a separate **encrypted EBS data volume**
mounted for MariaDB data + Matomo config (so the DB survives instance
replacement and can be snapshotted independently).

## Security hardening (binding)

- **No inbound SSH.** No port 22, no key pair. Administrative shell access is
  **AWS SSM Session Manager** only (instance has the SSM agent + role).
- **Security group:** inbound `443` from `0.0.0.0/0`, inbound `80` from
  `0.0.0.0/0` (ACME HTTP-01 + redirect to HTTPS) only. All egress allowed.
- **IMDSv2 required** (`http_tokens = required`).
- **Encrypted EBS** (root + data), default AWS-managed KMS acceptable.
- **Minimal IAM instance role:** SSM managed-instance policy + write access to
  the specific backup S3 bucket only. No other permissions.
- **OS patching:** `unattended-upgrades` enabled via user-data. Matomo and
  container images updated on a documented cadence.
- **Matomo admin:** strong password set during install; force HTTPS; Matomo's
  `trusted_hosts` pinned to `analytics.246labs.cloud`. No credentials committed.
- **DB:** MariaDB bound to the Docker network only (never published to host/
  public); root + Matomo DB passwords supplied via env/secret file, not
  committed.

## DNS & TLS

- `analytics.246labs.cloud` → **A record to the Elastic IP**, created in the
  Route 53 hosted zone that lives in the **management** account
  (`438465156498`). This is a **cross-account** change. **Default: a manual
  step** with the `personal-christopher-corbin` profile (same pattern used for
  the site's existing domain/SES records), rather than an OpenTofu
  cross-account aliased provider — keeps the `infra/matomo/` module
  single-account and out of management credentials.
- **Caddy** obtains and renews the TLS cert automatically for that hostname once
  the A record resolves and ports 80/443 are reachable.

## Backups

Two independent restore paths:
1. **Nightly `mysqldump` → S3** — a cron/systemd-timer in the stack dumps the
   Matomo DB to a **versioned, encrypted** S3 bucket in `687159379702`
   (lifecycle: expire dumps older than **30 days**).
2. **Scheduled EBS snapshots** of the data volume via **Data Lifecycle Manager
   (DLM)**.

## Infrastructure as Code

New `infra/matomo/` OpenTofu module (uses the existing S3 state backend; either
a separate state key or a distinct workspace):
- `aws_instance` (t4g.small, IMDSv2, encrypted root, SSM role, user-data),
- `aws_eip` + association,
- `aws_ebs_volume` (encrypted) + attachment for the DB,
- `aws_security_group` (443/80 in),
- `aws_iam_role` + instance profile (SSM + backup-bucket-scoped),
- `aws_s3_bucket` (versioned, encrypted, public-access-blocked) for dumps,
- `aws_dlm_lifecycle_policy` for EBS snapshots,
- outputs: instance id, Elastic IP, backup bucket, analytics hostname.

The **Docker Compose file + Caddyfile + backup script** are committed under
`infra/matomo/stack/` and delivered to the instance via user-data (or SSM
document). Secrets (DB passwords) are generated at provision time and stored in
SSM Parameter Store (SecureString) or a non-committed `.env` on the box — never
in git.

## Site integration (cookieless)

- Add the Matomo tracking snippet to the Next app root layout via `next/script`
  (`strategy="afterInteractive"`), pointed at `https://analytics.246labs.cloud`
  with the site-id from install.
- **Cookieless:** call `_paq.push(['disableCookies'])` before tracking; honor
  Do-Not-Track. No cookie banner required.
- The Matomo URL + site-id live in the layout (public values, not secrets); a
  small `components/Analytics.tsx` encapsulates the snippet.
- Ships through the existing CI/CD pipeline (verify → deploy).

## Privacy policy update

The current line "This site sets no analytics or advertising cookies" is now
inaccurate once analytics exist. Update to state the truth: **self-hosted,
cookieless Matomo** — first-party, no third-party trackers, no advertising
cookies, data stored in 246Labs' own AWS account; visitors can opt out
(Matomo opt-out / DNT respected).

## Phasing & the site-id ordering

Matomo's **site-id** is created in the first-run web installer, so:
- **Phase A (infra):** `tofu apply` the `infra/matomo/` module; add the DNS
  record; Caddy brings up TLS. Verify `https://analytics.246labs.cloud` serves
  the Matomo installer.
- **Phase B (install — human):** run the Matomo web installer — create the admin
  user, add the `246labs.cloud` site → obtain the **site-id**. Set
  `trusted_hosts` + force-HTTPS.
- **Phase C (site integration):** wire the cookieless snippet (with the site-id)
  into the Next app + update the privacy policy; ship via the pipeline.

## Error handling & operations

- If Caddy can't get a cert (DNS not propagated / ports closed): documented as
  the first check; the A record + SG 80/443 must be live first.
- DB container restart-policy `unless-stopped`; data on the persistent EBS
  volume so container/instance replacement doesn't lose data.
- Restore runbook: from latest S3 dump or from an EBS snapshot.
- Cost note: ~$12–15/mo (instance + EIP + small EBS + snapshots + tiny S3). The
  accepted trade for ownership; ongoing OS/Matomo patching is the owner's.

## Testing / verification

- **Infra (Phase A):** `tofu fmt`/`validate`; after apply, confirm the instance
  is SSM-reachable (no SSH), the SG exposes only 80/443, IMDSv2 required,
  volumes encrypted, `https://analytics.246labs.cloud` returns the Matomo
  installer with a valid cert, and **there is no open port 22**.
- **Site (Phase C):** unit test that `components/Analytics.tsx` renders the
  Matomo script with the configured URL + site-id and pushes `disableCookies`;
  privacy-page test asserts the updated wording (and that it no longer claims
  "no analytics"); full suite + build gate green; ships via pipeline.
- **Live:** a real page view registers in Matomo; a `securityheaders.com` /
  quick port check on `analytics.246labs.cloud` shows only 80/443 and HTTPS.

## Decisions recorded

- Matomo, self-hosted, single `t4g.small` EC2 + Docker Compose (Matomo +
  MariaDB + Caddy auto-TLS), in `687159379702`.
- Hardened: SSM-only (no SSH), SG 80/443, IMDSv2, encrypted EBS, minimal IAM.
- `analytics.246labs.cloud` A→EIP in the management Route 53 zone (cross-account).
- Backups: nightly mysqldump→S3 + DLM EBS snapshots.
- OpenTofu module `infra/matomo/`; committed compose/Caddyfile; secrets in SSM/
  non-committed env.
- Cookieless site snippet (no banner); privacy policy corrected.
- Two/three-phase rollout around the installer-created site-id.
