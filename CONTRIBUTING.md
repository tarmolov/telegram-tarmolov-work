# Contributing

## Prerequisites
### Telegram
1. [Create telegram bots](https://core.telegram.org/bots/tutorial):
    * for production
    * for testing (optional)
2. Save token for bots.
3. Create telegrams channels:
    * for production
    * for testing (optional)
4. Add bots to the channels.and make them as `Administrators`.
5. Save channel id.
    * open created channel at https://web.telegram.org/
    * you see the url like this https://web.telegram.org/a/#-123456789
    * replace `-` to `-100` and you get `-100123456789`
6. Save channel ids.

### Google calendar
1. [Create calendars and service accounts](https://habr.com/ru/articles/524240/):
    * for production
    * for testing (optional)
2. Save calendar id and service account credentials.

### Yandex Cloud
1. [Create cloud](https://cloud.yandex.ru/docs/resource-manager/operations/cloud/create) with name `telegram-tarmolov-work`.
2. [Create service account](https://cloud.yandex.ru/docs/iam/operations/sa/create) with name `telegram-tarmolov-work` with two roles:
    * `serverless.functions.invoker`
    * `lockbox.payloadViewer`
3. [Create serverless functions](https://cloud.yandex.ru/docs/functions/operations/function/function-create):
    * `production`
    * `prestable`
    * `testing` (optional)
    * `development` (optional)
4. [Create secrets](https://cloud.yandex.ru/docs/lockbox/operations/secret-create) in Lockbox:
    * `production`
    * `testing` (optional)
5. [Install Yandex Cloud CLI](https://cloud.yandex.ru/docs/cli/quickstart#install)

### Yandex Tracker
1. [Obtain oauth token](https://cloud.yandex.com/en-ru/docs/tracker/concepts/access#section_about_OAuth) and save it.
2. [Copy organization ID](https://tracker.yandex.com/admin/orgs) and save it.
3. Set up local fields in queue.

| Name                             | Name in English                | Type     | Key                 |
| -------------------------------- | ------------------------------ | -------- | ------------------- |
| ID события в календаре           | Event ID in calendar           | String   | `calendarEventId`   |
| Время публикации                 | Publish time                   | DateTime | `publishDateTime`   |
| Запланированное время публикации | Scheduled time for publication | DateTime | `scheduledDateTime` |
| Запланированное время публикации | Scheduled time for publication | DateTime | `scheduledDateTime` |
| Продакшен                        | Production                     | Link     | `production`        |
| Тестинг                          | Testing                        | Link     | `testing`           |

4. Set up workflow.
5. Set up triggers to connect the serverless function and Yandex Tracker..
6. Set up auto actions to publish delayed posts.

### Fill in secret values in Yandex Lockbox
```
TELEGRAM_BOT_TOKEN="<saved telegram bot token>"
TELEGRAM_TESTING_CHANNEL_ID="<saved telegram channel id (optional)>"
TRACKER_OAUTH_TOKEN="<saved yandex tracker oauth token>"
TRACKER_ORG_ID="<yandex tracker organization id>"
TELEGRAM_PRODUCTION_CHANNEL_ID="<saved telegram channel id>"
ACCESS_SECRET_KEY="<random generated string>"
GOOGLE_API_KEY_FILE="<google service account credentials encrypted in base64>"
TRACKER_QUEUE="<yandex tracker queue>"
TRACKER_QUEUE_LOCAL_FIELD_HASH="<hash used for prefixes for yandex tracker local fields>"
CALENDAR_ID="<google calendar id>"
TRACKER_COMPONENTS_APPROVERS="<components approvers encrypted in base64 (optional)>"
```

## Getting Started

1. Install dependencies:

  ```
  $ nvm use
  $ make deps
  $ make env
  ```

## Lint code
```
$ make validate
```

## Run tests
```
$ make test
```

## Send requests manually
```
$ ./src/tests/manual/tracker.sh
$ ./src/tests/manual/telegram.sh
```

## Deploy
### Testing
1. Build and deploy a new version.
  ```
  $ make deploy-testing
  ```

2. Clear "testing" field in https://tracker.yandex.ru/BLOGTEST-6

3. Invoke function
  ```
  $ ./src/tools/make-request.sh
  $ ./src/tools/make-request.sh '{"key": "BLOGTEST-4"}'
  ```

### Production
```
$ make deploy-production
```
