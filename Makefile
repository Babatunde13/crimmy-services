COMMIT_SHA=$(shell git rev-parse --short HEAD)

.PHONY: setup install build run help

.PHONY: install
install:
## install: install dependencies for all services
	@echo "Installing Gateway dependencies..."
	cd ./gateway && npm install
	echo "Installing Gateway dependencies... Done"
	@echo "Installing Owner Service dependencies..."
	cd ./owner-service && npm install
	echo "Installing Owner Service dependencies... Done"
	@echo "Installing Product Service dependencies..."
	cd ./product-service && npm install
	echo "Installing Product Service dependencies... Done"
	@echo "Installing Order Service dependencies..."
	cd ./order-service && npm install
	echo "Installing Order Service dependencies... Done"

.PHONY: build
build:
## build: build the application
	@echo "Building Gateway..."
	cd ./gateway && npm run build
	echo "Building Gateway... Done"
	@echo "Building Owner Service..."
	cd ./owner-service && npm run build
	echo "Building Owner Service... Done"
	@echo "Building Product Service..."
	cd ./product-service && npm run build
	echo "Building Product Service... Done"
	@echo "Building Order Service..."
	cd ./order-service && npm run build
	echo "Building Order Service... Done"

.PHONY: setup
## setup: setup proto files and sample .env files for all services
setup:
	@echo "Generating Proto files..."
	cp -r ./proto ./gateway && cp -r ./proto ./owner-service && cp -r ./proto ./product-service && cp -r ./proto ./order-service
	echo "Generating Proto files... Done"
	@echo "Generating .env files..."
	cp ./.env.example ./gateway/.env && cp ./.env.example ./owner-service/.env && cp ./.env.example ./product-service/.env && cp ./.env.example ./order-service/.env
	echo "Generating .env files... Done"


.PHONY: run
run:
## run: run the application with docker-compose
	@echo "Running the application..."
	docker-compose up --build
	echo "Running the application... Done"


.PHONY: help
## help: prints this help message
help:
	@echo "Usage: \n"
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' |  sed -e 's/^/ /'