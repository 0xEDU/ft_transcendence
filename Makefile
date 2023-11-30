SERVICES = django postgres
FOLDER = _compose_scripts
FILES = conditional-delete-container.sh \
		conditional-delete-image.sh \
		conditional-delete-volume.sh \
		conditional-stop-container.sh
DOCKER_SCRIPTS = $(addprefix $(FOLDER)/,$(FILES))

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
	@printf "⚠️ $(BOLD_YELLOW)[WARNING]$(RESET) If you're $(BOLD_YELLOW)SURE$(RESET) you want to delete the volumes, do it manually.\n"

frestart: fclean start


# DATABASE ------------------------------------------------------------------- #
start-db: volumes docker-compose.yml
	docker-compose up --build --detach postgres

stop-db: docker-compose.yml
	@./_compose_scripts/conditional-stop-container.sh postgres

restart-db: volumes docker-compose.yml
	docker-compose up --build --detach --force-recreate postgres

clean-db: chmod-scripts
	@./_compose_scripts/conditional-stop-container.sh postgres
	@./_compose_scripts/conditional-delete-container.sh postgres

fclean-db: clean-db
	@./_compose_scripts/conditional-delete-image.sh postgres

frestart-db: fclean-db start-db


# DJANGO --------------------------------------------------------------------- #
start-app: docker-compose.yml
	docker-compose up --build --detach django

stop-app: docker-compose.yml
	@./_compose_scripts/conditional-stop-container.sh django

restart-app: docker-compose.yml
	docker-compose up --build --detach --force-recreate django

clean-app: chmod-scripts
	@./_compose_scripts/conditional-stop-container.sh django
	@./_compose_scripts/conditional-delete-container.sh django

fclean-app: clean-app
	@./_compose_scripts/conditional-delete-image.sh django

frestart-app: fclean-app start-app

# BLOCKCHAIN ----------------------------------------------------------------- #
start-ganache: docker-compose.yml
	docker-compose up --build --detach ganache

stop-ganache: docker-compose.yml
	@./_compose_scripts/conditional-stop-container.sh ganache

restart-ganache: docker-compose.yml
	docker-compose up --build --detach --force-recreate ganache

clean-ganache: chmod-scripts
	@./_compose_scripts/conditional-stop-container.sh ganache
	@./_compose_scripts/conditional-delete-container.sh ganache

fclean-ganache: clean-ganache
	@./_compose_scripts/conditional-delete-image.sh ganache

frestart-ganache: fclean-ganache start-ganache

# BLOCKCHAIN ----------------------------------------------------------------- #
start-contract-deployer: docker-compose.yml
	docker-compose up --build --detach contract-deployer

stop-contract-deployer: docker-compose.yml
	@./_compose_scripts/conditional-stop-container.sh contract-deployer

restart-contract-deployer: docker-compose.yml
	docker-compose up --build --detach --force-recreate contract-deployer

clean-contract-deployer: chmod-scripts
	@./_compose_scripts/conditional-stop-container.sh contract-deployer
	@./_compose_scripts/conditional-delete-container.sh contract-deployer

fclean-contract-deployer: clean-contract-deployer
	@./_compose_scripts/conditional-delete-image.sh contract-deployer

frestart-contract-deployer: fclean-contract-deployer start-contract-deployer

# AUXILIAR ------------------------------------------------------------------- #
chmod-scripts: $(DOCKER_SCRIPTS)
	chmod +x $(DOCKER_SCRIPTS)

volumes:
	mkdir -p ~/goinfre/ft_transcendence_data

fetch-translation-hooks:
	django-admin makemessages -a

compile-translations:
	django-admin compilemessages

.PHONY: start stop restart clean fclean frestart \
		db-start db-stop db-restart db-clean db-fclean db-frestart \
		app-start app-stop app-restart app-clean app-fclean app-frestart \
		chmod-scripts volumes