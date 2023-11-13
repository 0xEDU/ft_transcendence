#!/bin/bash

PINK="\033[38;5;206m"
RESET='\033[0m'

# Check if an image name argument is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <image_name>"
    exit 1
fi

IMAGE_NAME="$1"

# Escape special characters in the image name using printf
ESCAPED_NAME=$(printf "%q" "$IMAGE_NAME")

# Check if the image exists
if docker image inspect "$ESCAPED_NAME" &> /dev/null; then
    # Remove the image if it exists
    printf "Deleting image ${PINK}${ESCAPED_NAME}${RESET}...\n"
    docker rmi "$ESCAPED_NAME"
else
    # Image does not exist, no action needed
    printf "Image ${PINK}${ESCAPED_NAME}${RESET} does not exist. No action needed.\n"
fi