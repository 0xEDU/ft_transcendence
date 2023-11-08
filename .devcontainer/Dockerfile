FROM python:3.8.10-alpine as django-build

RUN apk update && apk add git 

WORKDIR /workspaces

COPY . .

WORKDIR /workspaces/ft_transcendence

RUN pip install --upgrade pip

RUN pip install -r transcendence-core/requirements/local.txt
# RUN pip install -r transcendence-core/requirements/local.txt

FROM django-build as django-deploy

WORKDIR /workspaces/ft_transcendence

CMD [ "sleep", "infinity" ]
