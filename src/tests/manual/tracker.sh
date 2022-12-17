SCRIPT_DIRECTORY=$(dirname -- "$0";)
source ${SCRIPT_DIRECTORY}/../../../.env

URL="https://api.tracker.yandex.net/v2/issues/BLOGTEST-18"
curl -s -H "Authorization: OAuth ${TRACKER_OAUTH_TOKEN}" -H "X-Org-ID: ${TRACKER_ORG_ID}" "$URL" | jq .
