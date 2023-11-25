DB_SERVICE_NAME = postgres-transcendence
APP_SERVICE_NAME = django-transcendence
SERVICES = $(DB_SERVICE_NAME) $(APP_SERVICE_NAME)

COMPOSE_SCRIPTS_DIR = _compose_scripts
COMPOSE_SCRIPTS = conditional-delete-container.sh \
		conditional-delete-image.sh \
		conditional-delete-volume.sh \
		conditional-stop-container.sh
DOCKER_SCRIPTS = $(addprefix $(COMPOSE_SCRIPTS_DIR)/,$(COMPOSE_SCRIPTS))

BOLD_YELLOW = \e[1;33m
RESET = \e[0m

# ALL ------------------------------------------------------------------------ #
start: docker-compose.yml
	docker-compose up --build --detach --force-recreate

stop:
	docker-compose down

restart: stop start

clean: clean-db clean-app

fclean: fclean-db fclean-app
	@printf "⚠️ $(BOLD_YELLOW)[WARNING]$(RESET) If you're $(BOLD_YELLOW)SURE$(RESET) you want to delete the volumes, do it manually.\n"

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
	@./_compose_scripts/conditional-delete-image.sh $(DB_SERVICE_NAME)

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
	@./_compose_scripts/conditional-delete-image.sh $(APP_SERVICE_NAME)

frestart-app: fclean-app start-app


# AUXILIAR ------------------------------------------------------------------- #
chmod-scripts: $(DOCKER_SCRIPTS)
	chmod +x $(DOCKER_SCRIPTS)

volumes:
	mkdir -p ~/goinfre/ft_transcendence_data

fetch-translation-hooks:
	django-admin makemessages -a

compile-translations:
	django-admin compilemessages

check-python:
	@command -v python3 >/dev/null 2>&1 || { echo >&2 "Python 3 is required but not installed. Aborting."; exit 1; }

create-venv: check-python
	python3 -m venv .venv

install:
	@read -p "Have you already activated the virtual environment? (y/n): " choice; \
	if [ "$$choice" = "y" ] || [ "$$choice" = "Y" ]; then \
		pip install -r requirements.txt; \
	else \
		echo "Please activate the virtual environment first."; \
	fi

# ---------------------------------------------------------------------------- #
.PHONY: start stop restart clean fclean frestart \
		db-start db-stop db-restart db-clean db-fclean db-frestart \
		app-start app-stop app-restart app-clean app-fclean app-frestart \
		chmod-scripts volumes