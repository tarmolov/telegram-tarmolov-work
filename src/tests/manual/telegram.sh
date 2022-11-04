SCRIPT_DIRECTORY=$(dirname -- "$0";)
source ${SCRIPT_DIRECTORY}/../../../.env
MSG="**Hello, world**"
MSG_EDIT="__Hi, world__"

echo Sending text message...
MESSAGE=`curl -s -X POST \
    -H 'Content-Type: application/json' \
    -d "{\"chat_id\": ${TELEGRAM_TESTING_CHANNEL_ID}, \"parse_mode\": \"MarkdownV2\", \"text\": \"$MSG\"}" \
    https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
echo $MESSAGE | jq .
MESSAGE_ID=`echo $MESSAGE | jq .result.message_id`

echo Editing text message...
curl -s -X POST \
    -H 'Content-Type: application/json' \
    -d "{\"chat_id\": ${TELEGRAM_TESTING_CHANNEL_ID}, \"message_id\": $MESSAGE_ID, \"parse_mode\": \"MarkdownV2\", \"text\": \"$MSG_EDIT\"}" \
    https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText | jq .

echo Sending photo with caption...
MESSAGE_PHOTO=`curl -s -F "chat_id=${TELEGRAM_TESTING_CHANNEL_ID}" -F "caption=$MSG" -F parse_mode=MarkdownV2 \
    -F photo=@${SCRIPT_DIRECTORY}/../__fixtures/car.png \
    https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`
echo $MESSAGE_PHOTO | jq .
MESSAGE_PHOTO_ID=`echo $MESSAGE_PHOTO | jq .result.message_id`

echo Editing photo with caption...
curl -s -F chat_id=${TELEGRAM_TESTING_CHANNEL_ID} -F "message_id=$MESSAGE_PHOTO_ID" \
    -F "media={\"type\":\"photo\", \"caption\":\"$MSG_EDIT\", \"parse_mode\":\"MarkdownV2\", \"media\":\"attach://photo\"}" \
    -F photo=@${SCRIPT_DIRECTORY}/../__fixtures/train.png \
    https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageMedia | jq .

echo
