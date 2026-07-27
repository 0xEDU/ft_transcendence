<h1 align="center">
	ft_transcendence
</h1>

<p align="center">
    <img src="https://github.com/riceset/riceset/blob/main/42_badges/ft_transcendencen.png" />
</p>

## Resumen
> <i>Bienvenido al último proyecto del núcleo común de 42. El objetivo aquí es recrear el clásico juego pong con algunas características adicionales. </i>
> <i>El backend utiliza Django y el frontend utiliza el kit de herramientas de bootstrap. (más o menos). </i>

## Características

- Juego de Pong
- WIP

## Primeros Pasos

### Prerrequisitos
- Docker (preferiblemente Docker Desktop, pero no es obligatorio). Sigue la [página de instalación oficial](https://www.docker.com/products/docker-desktop/);
- Python 3.10;
	```
	sudo apt-get update
	sudo apt-get install python3.10
	```
- Pip actualizado para Python 3.10;
	```
	python3.10 -m pip install --upgrade pip
	```
- Entorno virtual de Python 3.10;
 	```
  	sudo apt-get install python3.10-venv
  	```
### Configuración
- Descarga el repositorio
	```
	git clone https://github.com/0xEDU/ft_transcendence.git
	```
- Crea un entorno virtual.
	```
	python3.10 -m venv ft_transcendence-venv
 	```
	Este comando simplemente creará un nuevo directorio llamado `ft_transcendence-venv`, donde se instalará cada paquete/dependencia específica para el proyecto. Usualmente elegimos crear el entorno virtual al mismo nivel que el repositorio git, no dentro de él, pero esto es solo una sugerencia, ambas formas deberían funcionar bien.
- Activa el entorno virtual.
	```
 	source ft_transcendence-venv/bin/activate
 	```
 - Entra en el directorio del repositorio e instala los requisitos del proyecto dentro del entorno virtual recién activado. Puedes hacerlo utilizando una directiva de Makefile muy ingeniosa que creamos:
	```
 	cd ft_transcendence/
 	make install
 	```
 - Crea el archivo `.env` en la raíz del repositorio del proyecto. Pide el contenido de este archivo a uno de nuestros miembros. No mordemos :) (probablemente).
 - Crea los contenedores para el proyecto. Este paso tarda un tiempo en completarse y puede ser un poco exigente para sistemas más antiguos y lentos. ¿Por qué no te consientes con una rica tacita de té? 🍵
	```
 	make start
 	```
 - Arranca la base de datos. Antes de lanzar la aplicación, necesitamos configurar las tablas necesarias. En el mundo de Django, esto se llama "ejecutar migraciones".
	```
 	make migrate
 	```
 - FINALMENTE, finalmente: Inicia el servidor.
	```
 	make run
 	```
 - Puedes acceder a nuestra aplicación web abriendo el navegador y visitando [https://localhost:8000](https://localhost:8000)

¡Gracias por probar nuestro proyecto! 😄
