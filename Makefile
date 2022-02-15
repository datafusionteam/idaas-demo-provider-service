help:
	@echo "make"
	@echo "    build"
	@echo "        Build a new production docker instance."
	@echo "    push"
	@echo "        Push an already built production docker instance to AWS ECR."


build:
	./scripts/build.sh

push:
	./scripts/push.sh
