help:
	@echo "make"
	@echo "    build"
	@echo "        Build a new production docker instance."
	@echo "    build-dev"
	@echo "        Build a new dev docker instance."


build:
	./scripts/build.sh

build-dev:
	export DEV=true && \
	./scripts/build.sh
