SERVICES = django postgres
FOLDER = scripts
FILES = conditional-delete-container.sh \
		conditional-delete-image.sh \
		conditional-delete-volume.sh \
		conditional-stop-container.sh
DOCKER_SCRIPTS = $(addprefix $(FOLDER)/,$(FILES))

# ALL ------------------------------------------------------------------------ #
start: docker-compose.yml
	docker-compose up --build --detach --force-recreate

stop:
	docker-compose down

clean: clean-db

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
	@./scripts/conditional-delete-image.sh db-inception-img

frestart-db: fclean-db start-db

# DJANGO --------------------------------------------------------------------- #
start-app: docker-compose.yml
	docker-compose up --build --detach django

stop-app: docker-compose.yml
	docker-compose down django

restart-app: docker-compose.yml
	docker-compose up --build --detach --force-recreate django

clean-app: chmod-scripts
	@./scripts/conditional-stop-container.sh django
	@./scripts/conditional-delete-container.sh django

fclean-app: clean-app
	@./scripts/conditional-delete-image.sh app-inception-img

frestart-app: fclean-app start-app

# AUXILIAR ------------------------------------------------------------------- #
chmod-scripts: $(DOCKER_SCRIPTS)
	chmod +x $(DOCKER_SCRIPTS)

volumes:
	mkdir -p ~/goinfre/ft_transcendence_data

.PHONY: start clean \
		start-db clean-db \
		start-django clean-django \
		chmod-scripts