#!/usr/bin/env bash
#
# Runs a full SonarQube analysis against the local dockerised instance:
# brings the stack up, bootstraps credentials, collects coverage and scans.
#
# Override the admin password with SONAR_PASSWORD if you have already set one.
set -euo pipefail

readonly HOST_URL="${SONAR_HOST_URL:-http://localhost:9000}"
# SonarQube rejects anything under 12 characters, or missing an
# uppercase, a lowercase, a digit or a symbol. Keep those four in mind
# before shortening this.
readonly PASSWORD="${SONAR_PASSWORD:-P@ssw0rd1234}"
readonly NETWORK='dsv-tool-sonar'
readonly TOKEN_NAME='dsv-tool-local-scan'
readonly BOOT_TIMEOUT=300

cd "$(dirname "$0")/.."
readonly PROJECT_DIR="$PWD"

info () { printf '\033[36m==>\033[0m %s\n' "$1"; }
fail () { printf '\033[31mError:\033[0m %s\n' "$1" >&2; exit 1; }

docker info > /dev/null 2>&1 || fail 'Docker does not appear to be running.'

info 'Starting the SonarQube stack'
docker compose up -d

info "Waiting for SonarQube to report UP (up to ${BOOT_TIMEOUT}s; first boot is slow)"
deadline=$(( SECONDS + BOOT_TIMEOUT ))
until [ "$(curl -fsS "${HOST_URL}/api/system/status" 2>/dev/null | node -pe 'JSON.parse(require("fs").readFileSync(0,"utf8")).status' 2>/dev/null || echo DOWN)" = 'UP' ]; do
  [ "$SECONDS" -lt "$deadline" ] || fail "SonarQube did not start within ${BOOT_TIMEOUT}s. Check: docker compose logs sonarqube"
  sleep 5
done

# A fresh instance ships admin/admin and demands a change before it will do
# anything useful. On later runs that call fails, which just means it was
# already rotated.
if curl -fsS -u "admin:${PASSWORD}" "${HOST_URL}/api/authentication/validate" 2>/dev/null | grep -q '"valid":true'; then
  info 'Admin password already set'
else
  info 'Rotating the default admin password'
  curl -fsS -u 'admin:admin' -X POST "${HOST_URL}/api/users/change_password" \
    -d "login=admin&previousPassword=admin&password=${PASSWORD}" > /dev/null \
    || fail "Could not authenticate as admin. If you changed the password by hand, re-run with SONAR_PASSWORD set."
fi

info 'Issuing a scanner token'
# Tokens are write-once: the value is only returned at creation, so replace it.
curl -fsS -u "admin:${PASSWORD}" -X POST "${HOST_URL}/api/user_tokens/revoke" \
  -d "name=${TOKEN_NAME}" > /dev/null 2>&1 || true
TOKEN="$(curl -fsS -u "admin:${PASSWORD}" -X POST "${HOST_URL}/api/user_tokens/generate" \
  -d "name=${TOKEN_NAME}" | node -pe 'JSON.parse(require("fs").readFileSync(0,"utf8")).token')"
[ -n "$TOKEN" ] || fail 'Could not generate a scanner token.'

info 'Running the test suite with coverage'
npm run test:coverage

info 'Scanning'
# `/usr/src` is the scanner image's working directory, and the lcov report
# names files relative to the project root, so they line up.
docker run --rm \
  --network "$NETWORK" \
  -v "${PROJECT_DIR}:/usr/src" \
  -e SONAR_TOKEN="$TOKEN" \
  sonarsource/sonar-scanner-cli \
  -Dsonar.host.url='http://sonarqube:9000'

printf '\n\033[32m==>\033[0m Analysis complete.\n\n'
printf '    Dashboard: %s/dashboard?id=dsv-tool\n' "${HOST_URL}"
printf '    Login:     admin\n'
printf '    Password:  %s\n\n' "${PASSWORD}"
printf '    (override with SONAR_PASSWORD; run `npm run sonar:credentials` to see this again)\n\n'
