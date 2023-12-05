DB_SERVICE_NAME = postgres-transcendence
APP_SERVICE_NAME = django-transcendence
GANACHE_SERVICE_NAME = ganache-transcendence
CONTRACT_DEPLOYER_SERVICE_NAME = contract-deployer-transcendence
SERVICES = $(DB_SERVICE_NAME) $(APP_SERVICE_NAME) $(GANACHE_SERVICE_NAME) $(CONTRACT_DEPLOYER_SERVICE_NAME)

COMPOSE_SCRIPTS_DIR = _compose_scripts
COMPOSE_SCRIPTS = conditional-delete-container.sh \
		conditional-delete-image.sh \
		conditional-delete-volume.sh \
		conditional-stop-container.sh
DOCKER_SCRIPTS = $(addprefix $(COMPOSE_SCRIPTS_DIR)/,$(COMPOSE_SCRIPTS))

VENV_DIR = .venv

BOLD_YELLOW = \e[1;33m
RESET = \e[0m

# ALL ------------------------------------------------------------------------ #
start: docker-compose.yml
	docker-compose up --build --detach --force-recreate

stop:
	docker-compose down

restart: stop start

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

# BLOCKCHAIN ----------------------------------------------------------------- #
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

.PHONY: start stop restart clean fclean frestart \
		db-start db-stop db-restart db-clean db-fclean db-frestart \
		app-start app-stop app-restart app-clean app-fclean app-frestart \
		chmod-scripts volumes