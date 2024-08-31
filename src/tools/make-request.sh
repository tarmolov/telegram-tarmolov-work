SCRIPT_DIRECTORY=$(dirname -- "$0";)
source ${SCRIPT_DIRECTORY}/../../.env

SERVERLESS_ID=`yc serverless function get --name testing | awk '$1 ~ /^id:/ {print $2}'`
DATA="${1:-{\"key\": \"BLOGTEST-6\"}}"
URL="https://functions.yandexcloud.net/${SERVERLESS_ID}?channel_id=${TELEGRAM_TESTING_CHANNEL_ID}&publish_url_field=testing"

echo $URL
curl -v -X POST -H "Content-Type: application/json" -d "$DATA" "$URL"
