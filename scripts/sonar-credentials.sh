#!/usr/bin/env bash
#
# Prints the local SonarQube login, and checks it actually works.
set -euo pipefail

readonly HOST_URL="${SONAR_HOST_URL:-http://localhost:9000}"
# SonarQube rejects anything under 12 characters, or missing an
# uppercase, a lowercase, a digit or a symbol. Keep those four in mind
# before shortening this.
readonly PASSWORD="${SONAR_PASSWORD:-P@ssw0rd1234}"

printf '\n    Dashboard: %s\n' "${HOST_URL}"
printf '    Login:     admin\n'
printf '    Password:  %s\n\n' "${PASSWORD}"

if ! curl -fsS "${HOST_URL}/api/system/status" > /dev/null 2>&1; then
  printf '    SonarQube is not responding. Start it with: npm run sonar:up\n\n'
  exit 0
fi

if curl -fsS -u "admin:${PASSWORD}" "${HOST_URL}/api/authentication/validate" 2>/dev/null | grep -q '"valid":true'; then
  printf '    \033[32mVerified:\033[0m these credentials work.\n\n'
else
  printf '    \033[31mThese credentials are rejected.\033[0m The password was changed by hand.\n'
  printf '    Re-run with SONAR_PASSWORD set, or wipe the instance: npm run sonar:reset\n\n'
fi
