## VARS
PYTHON_VERSION = python3.10

# Services names
DB_SERVICE_NAME = postgres-transcendence
APP_SERVICE_NAME = django-transcendence
GANACHE_SERVICE_NAME = ganache-transcendence
CONTRACT_DEPLOYER_SERVICE_NAME = contract-deployer-transcendence
SERVICES = $(DB_SERVICE_NAME) $(APP_SERVICE_NAME) $(GANACHE_SERVICE_NAME) $(CONTRACT_DEPLOYER_SERVICE_NAME)

# Scripts
DOCKER_SCRIPTS = $(addprefix _compose_scripts/,conditional-delete-container.sh conditional-delete-image.sh conditional-delete-volume.sh conditional-stop-container.sh)

# Virtual environment
VENV_DIR = ../ft_transcendence-venv

# Colours
BOLD_YELLOW = \e[1;33m
BOLD_RED = \033[1;91m
RESET = \e[0m

## RULES
# ALL ------------------------------------------------------------------------ #
start: docker-compose.yml
	docker-compose up --build --detach --force-recreate

stop:
	docker-compose down

restart: stop start

run:
	$(PYTHON_VERSION) manage.py runserver

migrate:
	$(PYTHON_VERSION) manage.py migrate

clean: clean-db clean-app

fclean: fclean-db fclean-app fclean-ganache fclean-contract-deployer
	@printf "⚠️ $(BOLD_YELLOW)[WARNING]$(RESET) If you're $(BOLD_YELLOW)SURE$(RESET) you want to delete the volumes, do it manually!\n"

frestart: fclean start


# DATABASE ------------------------------------------------------------------- #
start-db: volumes docker-compose.yml
	docker-compose up --build --detach $(DB_SERVICE_NAME)

stop-db: docker-compose.yml
	@./_compose_scripts/conditional-stop-container.sh $(DB_SERVICE_NAME)

restart-db: volumes docker-compose.yml
	docker-compose up --build --detach --force-recreate $(DB_SERVICE_NAME)

clean-db: chmod-scripts
	@./_compose_scripts/conditional-stop-container.sh $(DB_SERVICE_NAME)
	@./_compose_scripts/conditional-delete-container.sh $(DB_SERVICE_NAME)

fclean-db: clean-db
	@./_compose_scripts/conditional-delete-image.sh postgres

frestart-db: fclean-db start-db


# DJANGO --------------------------------------------------------------------- #
start-app: docker-compose.yml
	docker-compose up --build --detach $(APP_SERVICE_NAME)

stop-app: docker-compose.yml
	@./_compose_scripts/conditional-stop-container.sh $(APP_SERVICE_NAME)

restart-app: docker-compose.yml
	docker-compose up --build --detach --force-recreate $(APP_SERVICE_NAME)

clean-app: chmod-scripts
	@./_compose_scripts/conditional-stop-container.sh $(APP_SERVICE_NAME)
	@./_compose_scripts/conditional-delete-container.sh $(APP_SERVICE_NAME)

fclean-app: clean-app
	@./_compose_scripts/conditional-delete-image.sh django

frestart-app: fclean-app start-app


# BLOCKCHAIN ----------------------------------------------------------------- #
start-ganache: docker-compose.yml
	docker-compose up --build --detach $(GANACHE_SERVICE_NAME)

stop-ganache: docker-compose.yml
	@./_compose_scripts/conditional-stop-container.sh $(GANACHE_SERVICE_NAME)

restart-ganache: docker-compose.yml
	docker-compose up --build --detach --force-recreate $(GANACHE_SERVICE_NAME)

clean-ganache: chmod-scripts
	@./_compose_scripts/conditional-stop-container.sh $(GANACHE_SERVICE_NAME)
	@./_compose_scripts/conditional-delete-container.sh $(GANACHE_SERVICE_NAME)

fclean-ganache: clean-ganache
	@./_compose_scripts/conditional-delete-image.sh $(GANACHE_SERVICE_NAME)

frestart-ganache: fclean-ganache start-ganache


# EVEN MORE BLOCKCHAIN ------------------------------------------------------- #
start-contract-deployer: docker-compose.yml
	docker-compose up --build --detach $(CONTRACT_DEPLOYER_SERVICE_NAME)

stop-contract-deployer: docker-compose.yml
	@./_compose_scripts/conditional-stop-container.sh $(CONTRACT_DEPLOYER_SERVICE_NAME)

restart-contract-deployer: docker-compose.yml
	docker-compose up --build --detach --force-recreate $(CONTRACT_DEPLOYER_SERVICE_NAME)

clean-contract-deployer: chmod-scripts
	@./_compose_scripts/conditional-stop-container.sh $(CONTRACT_DEPLOYER_SERVICE_NAME)
	@./_compose_scripts/conditional-delete-container.sh $(CONTRACT_DEPLOYER_SERVICE_NAME)

fclean-contract-deployer: clean-contract-deployer
	@./_compose_scripts/conditional-delete-image.sh $(CONTRACT_DEPLOYER_SERVICE_NAME)

frestart-contract-deployer: fclean-contract-deployer start-contract-deployer


# AUXILIAR ------------------------------------------------------------------- #
chmod-scripts: $(DOCKER_SCRIPTS)
	chmod +x $(DOCKER_SCRIPTS)

volumes:
	mkdir -p ~/goinfre/ft_transcendence/postgres \
			 ~/goinfre/ft_transcendence/ganache

fetch-translation-hooks:
	django-admin makemessages -a

compile-translations:
	django-admin compilemessages

check-python:
	@command -v $(PYTHON_VERSION) >/dev/null 2>&1 || { echo >&2 "❌ $(BOLD_RED)[ERROR]$(RESET) $(BOLD_YELLOW)$(PYTHON_VERSION)$(RESET) is required but not installed. $(BOLD_RED)Aborting.$(RESET)"; exit 1; }

create-venv: check-python
	$(PYTHON_VERSION) -m venv $(VENV_DIR)

delete-venv:
	rm -rf $(VENV_DIR)

install:
	@read -p "Have you already activated the virtual environment? (y/n): " choice; \
	if [ "$$choice" = "y" ] || [ "$$choice" = "Y" ]; then \
		pip install -r requirements.txt; \
	else \
		echo "Please activate the virtual environment first."; \
	fi

# ---------------------------------------------------------------------------- #

.PHONY: start stop restart run migrate clean fclean frestart \
		db-start db-stop db-restart db-clean db-fclean db-frestart \
		app-start app-stop app-restart app-clean app-fclean app-frestart \
		ganache-start ganache-stop ganache-restart ganache-clean ganache-fclean ganache-frestart \
		contract-deployer-start contract-deployer-stop contract-deployer-restart contract-deployer-clean contract-deployer-fclean contract-deployer-frestart \
		chmod-scripts volumes fetch-translation-hooks compile-translations check-python create-venv delete-venv install
