OUT_DIR=out
NODE_MODULES_BIN=node_modules/.bin/
MOCHA_OPTIONS ?= -R dot -r source-map-support/register -r src/tests/setup.js -t 10000 --exit

.PHONY: deps
deps:
	@npm i
	@npx husky install

.PHONY: env
env:
	@./tools/generate-env-file.js

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
test: build test-unit test-functional

.PHONY: test-unit
test-unit:
	@echo Run unit tests...
	@${NODE_MODULES_BIN}mocha $(MOCHA_OPTIONS) $(MOCHA_EXTRA_OPTIONS) "$(OUT_DIR)/tests/unit/**/*.test.js"

.PHONY: test-functional
test-functional:
	@echo Run functional tests...
	@cp -r src/tests/__fixtures/ out/tests/__fixtures
	@${NODE_MODULES_BIN}mocha $(MOCHA_OPTIONS) $(MOCHA_EXTRA_OPTIONS) "$(OUT_DIR)/tests/functional/**/*.test.js"

.PHONY: zip
zip:
	zip -r $(OUT_DIR)/tarmolov_work.zip out/app package.json package-lock.json

.PHONY: deploy-testing
deploy-testing: clean build-production zip
	yc serverless function version create \
	  --service-account-id ajefocfisp51nn3k11pb \
	  --function-name=testing \
	  --runtime nodejs16 \
	  --entrypoint out/app/app.handler \
	  --memory 128m \
	  --execution-timeout 10s \
	  --environment ENVIRONMENT=testing \
	  --secret name=testing,key=TELEGRAM_BOT_TOKEN,environment-variable=TELEGRAM_BOT_TOKEN \
	  --secret name=testing,key=TRACKER_OAUTH_TOKEN,environment-variable=TRACKER_OAUTH_TOKEN \
	  --secret name=testing,key=TRACKER_ORG_ID,environment-variable=TRACKER_ORG_ID \
	  --source-path $(OUT_DIR)/tarmolov_work.zip

.PHONY: deploy-production
deploy-production: clean build-production zip
	yc serverless function version create \
	  --service-account-id ajefocfisp51nn3k11pb \
	  --function-name=production \
	  --runtime nodejs16 \
	  --entrypoint out/app/app.handler \
	  --memory 128m \
	  --execution-timeout 10s \
	  --environment ENVIRONMENT=production \
	  --secret name=production,key=TELEGRAM_BOT_TOKEN,environment-variable=TELEGRAM_BOT_TOKEN \
	  --secret name=production,key=TRACKER_OAUTH_TOKEN,environment-variable=TRACKER_OAUTH_TOKEN \
	  --secret name=production,key=TRACKER_ORG_ID,environment-variable=TRACKER_ORG_ID \
	  --source-path $(OUT_DIR)/tarmolov_work.zip

.PHONY: clean
clean:
	@rm -rf $(OUT_DIR)
