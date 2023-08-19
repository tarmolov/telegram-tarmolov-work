OUT_DIR=out
NODE_MODULES_BIN=node_modules/.bin/
MOCHA_OPTIONS ?= -R dot -r source-map-support/register -r src/tests/setup.js -t 20000 --exit
SERVICE_ACCOUNT_ID=$(shell yc iam service-account get --name telegram-tarmolov-work | awk '$1 ~ /^id:/ {print $2}')

.PHONY: deps
deps:
	@npm i
	@npx husky install

.PHONY: env
env:
	@./src/tools/generate-env-file.cjs

.PHONY: build
build:
	@${NODE_MODULES_BIN}tsc -p ./tsconfig.json

.PHONY: build-production
build-production:
	@${NODE_MODULES_BIN}tsc -p ./tsconfig-production.json

.PHONY: validate
validate:
	@${NODE_MODULES_BIN}eslint src

.PHONY: test
test: build test-unit test-functional test-integration

.PHONY: test-unit
test-unit:
	@echo Run unit tests...
	@NO_LOGGING=1 ENVIRONMENT=tests ${NODE_MODULES_BIN}mocha $(MOCHA_OPTIONS) $(MOCHA_EXTRA_OPTIONS) "$(OUT_DIR)/tests/unit/**/*.test.js"

.PHONY: test-functional
test-functional:
	@echo Run functional tests...
	@cp -r src/tests/__fixtures/ out/tests/__fixtures
	@NO_LOGGING=1 ENVIRONMENT=tests ${NODE_MODULES_BIN}mocha $(MOCHA_OPTIONS) $(MOCHA_EXTRA_OPTIONS) "$(OUT_DIR)/tests/functional/**/*.test.js"

.PHONY: test-integration
test-integration:
	@echo Run integration tests...
	@NO_LOGGING=1 ENVIRONMENT=tests ${NODE_MODULES_BIN}mocha $(MOCHA_OPTIONS) $(MOCHA_EXTRA_OPTIONS) "$(OUT_DIR)/tests/integration/**/*.test.js"

.PHONY: zip
zip:
	zip -r $(OUT_DIR)/tarmolov_work.zip out/app package.json package-lock.json

.PHONY: deploy-production
deploy-production: test clean build-production zip
	$(MAKE) deploy ENV=prestable SECRET_ENV=production
	$(MAKE) deploy ENV=production SECRET_ENV=production

.PHONY: deploy-testing
deploy-testing: test clean build-production zip
	$(MAKE) deploy ENV=development SECRET_ENV=testing
	$(MAKE) deploy ENV=testing SECRET_ENV=testing

.PHONY: deploy
deploy:
	@echo
	@echo Deploying $(ENV)...
	yc serverless function version create \
	  --service-account-id $(SERVICE_ACCOUNT_ID) \
	  --function-name=$(ENV) \
	  --runtime nodejs16 \
	  --entrypoint out/app/app.handler \
	  --memory 128m \
	  --execution-timeout 10s \
	  --environment ENVIRONMENT=$(ENV) \
	  --secret name=$(SECRET_ENV),key=TELEGRAM_BOT_TOKEN,environment-variable=TELEGRAM_BOT_TOKEN \
	  --secret name=$(SECRET_ENV),key=TRACKER_OAUTH_TOKEN,environment-variable=TRACKER_OAUTH_TOKEN \
	  --secret name=$(SECRET_ENV),key=TRACKER_ORG_ID,environment-variable=TRACKER_ORG_ID \
	  --secret name=$(SECRET_ENV),key=ACCESS_SECRET_KEY,environment-variable=ACCESS_SECRET_KEY \
	  --secret name=$(SECRET_ENV),key=GOOGLE_API_KEY_FILE,environment-variable=GOOGLE_API_KEY_FILE \
	  --secret name=$(SECRET_ENV),key=TRACKER_QUEUE,environment-variable=TRACKER_QUEUE \
	  --secret name=$(SECRET_ENV),key=TRACKER_QUEUE_LOCAL_FIELD_HASH,environment-variable=TRACKER_QUEUE_LOCAL_FIELD_HASH \
	  --secret name=$(SECRET_ENV),key=CALENDAR_ID,environment-variable=CALENDAR_ID \
	  --secret name=$(SECRET_ENV),key=TELEGRAM_PRODUCTION_CHANNEL_ID,environment-variable=TELEGRAM_PRODUCTION_CHANNEL_ID \
	  --secret name=$(SECRET_ENV),key=TELEGRAM_TESTING_CHANNEL_ID,environment-variable=TELEGRAM_TESTING_CHANNEL_ID \
	  --source-path $(OUT_DIR)/tarmolov_work.zip

.PHONY: digest
digest: build
	@NO_LOGGING=1 node ./out/tools/generate-digest.js

.PHONY: clean
clean:
	@rm -rf $(OUT_DIR)
