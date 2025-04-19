.ONESHELL:
SHELL = /bin/bash

CONDA_ACTIVATE = source $$(conda info --base)/etc/profile.d/conda.sh ; conda activate ; conda activate

PROJECT_NAME := rlcard_showdown

# I added this since this should be usabe in docker without conda too.
CONDA_CMD = if command -v conda >/dev/null 2>&1; then $(CONDA_ACTIVATE) $(PROJECT_NAME); else echo "conda is not installed"; fi

.PHONY: help
help:
	@egrep -h '\s##\s' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m  %-30s\033[0m %s\n", $$1, $$2}'

create_environment: ## create conda environment
	$(CONDA_ACTIVATE)	
	conda create -n $(PROJECT_NAME) python=$$(cat .python-version)

install_requirements: ## install requirements.txt using pip
	$(CONDA_CMD)
	pip install -r requirements.txt

pip_compile: ## compile dependencies
	$(CONDA_CMD)
	pip install pip-tools
	pip-compile requirements.in -o requirements.txt

docker-rebuild: ## Stop, rebuild, and restart Docker containers in detached mode
	docker compose down
	docker compose build
	docker compose up -d

docker-restart: ## Restart Docker containers without rebuilding
	docker compose down
	docker compose up -d

docker-logs: ## View Docker container logs
	docker compose logs -f