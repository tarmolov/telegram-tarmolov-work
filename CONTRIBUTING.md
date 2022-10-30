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

## Run tests
```
$ make test
```

## Deploy
### Testing
1. Build and deploy a new version.
  ```
  $ make deploy-testing
  ```

2. Invoke function
  ```
  $ curl -s "https://functions.yandexcloud.net/d4e8rm8s3b2e0ng4sohd?text=test"
  ```
