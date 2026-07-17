#!/usr/bin/env bash
set -euo pipefail

# ────────────────────────────────────────────────────────────
# generate-secret.sh
# Creates a .env file with a cryptographically random
# JWT signing key and a MySQL database password.
# ────────────────────────────────────────────────────────────

JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
DB_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
DB_ROOT_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")

if [ -f .env ]; then
  echo "⚠️  .env already exists. Backing up to .env.backup.$(date +%s)"
  cp .env ".env.backup.$(date +%s)"
fi

cat > .env <<EOF
# ─── Database (MySQL) ─────────────────────────────────────
DATABASE_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
DATABASE_PASSWORD=${DB_PASSWORD}
DATABASE_USERNAME=lifetracker
DATABASE_NAME=lifetracker

# ─── JWT Security ─────────────────────────────────────────
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION_MS=86400000

# ─── SMTP / Email (optional — for password reset) ────────
# MAIL_HOST=smtp.resend.com
# MAIL_PORT=587
# MAIL_USERNAME=resend
# MAIL_PASSWORD=
# MAIL_FROM=noreply@lifetracker.app

# ─── App URL ──────────────────────────────────────────────
APP_BASE_URL=http://localhost
EOF

echo "✅ .env created with secure secrets!"
echo "   Database root password: ${DB_ROOT_PASSWORD}"
echo "   Database app password:  ${DB_PASSWORD}"
echo "   JWT Secret:             ${JWT_SECRET}"
echo ""
echo "📋 Run: docker compose up -d"
