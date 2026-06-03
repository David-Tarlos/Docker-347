#!/bin/sh
set -e

# Substitute FRONTEND_MS_* placeholders in all JS/CSS files with values from
# environment variables (injected via K8s ConfigMap at pod start).

VARS="FRONTEND_MS_ACCOUNT_HOLDINGS FRONTEND_MS_ACCOUNT_FRIENDS FRONTEND_MS_BUYSELL_BUY FRONTEND_MS_BUYSELL_SELL FRONTEND_MS_SENDRECEIVE_SEND"

for file in /usr/share/nginx/html/static/js/*.js /usr/share/nginx/html/static/css/*.css; do
  [ -f "$file" ] || continue
  for var in $VARS; do
    value=$(eval echo "\$$var")
    if [ -n "$value" ]; then
      # Use | as sed delimiter since URLs contain /
      sed -i "s|$var|$value|g" "$file"
    fi
  done
done

echo "[entrypoint] runtime env substitution done"
