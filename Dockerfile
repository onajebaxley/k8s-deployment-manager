## Onaje Baxley
## 6/25/18
## Builds the Docker image of the current project based off of
## The current "working" directory (literally)

## Start with latest NodeJS image (v10.x)
FROM node:latest

## Create a project dir within the image, then copy over compiled contents
RUN mkdir k8s-deployment-manager
COPY ./working k8s-deployment-manager
COPY ./.k8s-deployment-managerrc k8s-deployment-manager
COPY ./package.json k8s-deployment-manager
COPY ./tsconfig.json k8s-deployment-manager
COPY ./tslint.json k8s-deployment-manager

## Install necessary node packages
WORKDIR /k8s-deployment-manager
RUN ["npm", "install"]

## Set the env for apprc
ENV NODE_ENV production

## Entrypoint command
CMD [ "node", "src/index.js", "--start" ]

