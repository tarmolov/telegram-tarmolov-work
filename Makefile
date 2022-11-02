OUT_DIR=out
NODE_MODULES_BIN=node_modules/.bin/
MOCHA_OPTIONS ?= -R dot -r source-map-support/register -r src/tests/setup.js --exit

.PHONY: deps
deps:
	@npm i

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
test: build test-manual

.PHONY: test-manual
test-manual:
	@echo Run manual tests...
	@${NODE_MODULES_BIN}mocha $(MOCHA_OPTIONS) $(MOCHA_EXTRA_OPTIONS) --timeout 100000 "$(OUT_DIR)/tests/manual/**/*.test.js"

.PHONY: zip
zip:
	zip -r $(OUT_DIR)/tarmolov_work.zip out/app package.json package-lock.json

.PHONY: deploy-serverless
deploy-serverless:
	yc serverless function version create \
	  --service-account-id ajefocfisp51nn3k11pb \
	  --function-name=testing \
	  --runtime nodejs16 \
	  --entrypoint out/app/app.handler \
	  --memory 128m \
	  --execution-timeout 3s \
	  --secret name=testing,key=TELEGRAM_BOT_TOKEN,environment-variable=TELEGRAM_BOT_TOKEN \
	  --secret name=testing,key=TRACKER_OAUTH_TOKEN,environment-variable=TRACKER_OAUTH_TOKEN \
	  --secret name=testing,key=TRACKER_ORG_ID,environment-variable=TRACKER_ORG_ID \
	  --source-path $(OUT_DIR)/tarmolov_work.zip

.PHONY: deploy-testing
deploy-testing: clean build-production zip deploy-serverless

.PHONY: clean
clean:
	@rm -rf $(OUT_DIR)
