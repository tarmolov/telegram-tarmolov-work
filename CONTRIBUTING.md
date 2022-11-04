# Contributing

## Requirements
The project is build on [Node.js](http://nodejs.org/) application engine and uses [npm](http://npmjs.org) for tracking dependencies.

Extra dependencies which are need for development issues:
  * [Yandec Cloud CLI](https://cloud.yandex.ru/docs/cli/quickstart#install)

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
  $ ./tools/make-request.sh
  $ ./tools/make-request.sh '{"key": "BLOGTEST-4"}'
  ```
