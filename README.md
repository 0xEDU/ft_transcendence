<h1 align="center">
	ft_transcendence
</h1>

<p align="center">
    <img src="https://github.com/riceset/riceset/blob/main/42_badges/ft_transcendencen.png" />
</p>

## Summary
> <i>Welcome to the last project of 42's common core. The goal here is to reply the classic pong game with some additional features. </i>
> <i>The backend uses Django and the frontend uses the bootstrap toolkit. (sorta). </i>

## Features

- Pong Game
- WIP

## Getting Started

### Prerequisites
- Docker (preferably Docker Desktop, but not needed). Follow the [official installation page](https://www.docker.com/products/docker-desktop/);
- Python 3.10;
	```
	sudo apt-get update
	sudo apt-get install python3.10
	```
- Updated Pip for Python 3.10;
	```
	python3.10 -m pip install --upgrade pip
	```
- Python 3.10's virtual environment;
 	```
  	sudo apt-get install python3.10-venv
  	```
### Setting up
- Download the repo
	```
	git clone https://github.com/0xEDU/ft_transcendence.git
	```
- Create a virtual environment.
	```
	python3.10 -m venv ft_transcendence-venv
 	```
	This command is simply going to create a new directory named `ft_transcendence-venv`, where every package/dependency specific for the project will be installed. We usually choose to create the virtual environment on the same level of the git repository, not inside it, but this is just a suggestion, both ways should work fine.
- Activate the virtual environment.
	```
 	source ft_transcendence-venv/bin/activate
 	```
 - Get in the repo's directory and install the project requirements inside the newly activated virtual environment. You can do so by using a very nifty Makefile directive we created:
	```
 	cd ft_transcendence/
 	make install
 	```
 - Create the `.env` file in the root of the project repository. Ask one of our members for the contents of this file. We don't bite :) (probably).
 - Create the containers for the project. This step takes a while to complete and might be a bit demanding for older, slower systems. Why not treat yourself to a lovely cuppa? 🍵
	```
 	make start
 	```
 - Bootstrap the database. Before launching the application, we need to set up the necessary tables. In the world of Django, this is called "running migrations".
	```
 	make migrate
 	```
 - FINALLY, finally: Start the server.
	```
 	make run
 	```
 - You can access our web application by opening the browser and visiting [https://localhost:8000](https://localhost:8000)

Thank you for trying out our project! 😄
