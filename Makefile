SERVICES = django postgres
FOLDER = scripts
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

fclean: fclean-db fclean-app
	@printf "⚠️ $(BOLD_YELLOW)[WARNING]$(RESET) If you're $(BOLD_YELLOW)SURE$(RESET) you want to delete the volumes, do it manually.\n"

frestart: fclean start


# DATABASE ------------------------------------------------------------------- #
start-db: volumes docker-compose.yml
	docker-compose up --build --detach postgres

stop-db: docker-compose.yml
	docker-compose stop postgres

restart-db: volumes docker-compose.yml
	docker-compose up --build --detach --force-recreate postgres

clean-db: chmod-scripts
	@./scripts/conditional-stop-container.sh postgres
	@./scripts/conditional-delete-container.sh postgres

fclean-db: clean-db
	@./scripts/conditional-delete-image.sh postgres

frestart-db: fclean-db start-db


# DJANGO --------------------------------------------------------------------- #
start-app: docker-compose.yml
	docker-compose up --build --detach django

stop-app: docker-compose.yml
	docker-compose stop django

restart-app: docker-compose.yml
	docker-compose up --build --detach --force-recreate django

clean-app: chmod-scripts
	@./scripts/conditional-stop-container.sh django
	@./scripts/conditional-delete-container.sh django

fclean-app: clean-app
	@./scripts/conditional-delete-image.sh django

frestart-app: fclean-app start-app


# AUXILIAR ------------------------------------------------------------------- #
chmod-scripts: $(DOCKER_SCRIPTS)
	chmod +x $(DOCKER_SCRIPTS)

volumes:
	mkdir -p ~/goinfre/ft_transcendence_data


.PHONY: start stop restart clean fclean frestart \
		db-start db-stop db-restart db-clean db-fclean db-frestart \
		app-start app-stop app-restart app-clean app-fclean app-frestart \
		chmod-scripts volumes