#!/usr/bin/env bash
set -euo pipefail
TS=$(date -u +%Y%m%dT%H%M%SZ)
DUMP="/tmp/matomo-${TS}.sql.gz"
docker exec matomo-db-1 sh -c 'exec mariadb-dump --single-transaction -umatomo -p"$(cat /run/secrets/db_password)" matomo' | gzip > "$DUMP"
aws s3 cp "$DUMP" "s3://${BACKUP_BUCKET}/dumps/matomo-${TS}.sql.gz"
rm -f "$DUMP"
