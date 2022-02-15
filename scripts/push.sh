#!/usr/bin/env bash

bold=$(tput bold)
normal=$(tput sgr0)
INFO="${bold}$(tput setaf 2)INFO:   ${normal}"

SERVICE=pinnacle-chiro-provider
VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

AWS_REGION=us-east-1
AWS_ACCOUNT_ID=470110734843
ECR_SERVICE_URL=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$SERVICE

echo "${INFO} Logging into AWS"

aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_SERVICE_URL

echo "${INFO} Pushing version ${VERSION}"

docker tag $SERVICE:$VERSION $ECR_SERVICE_URL:$VERSION
docker push $ECR_SERVICE_URL:$VERSION

echo "${INFO} Pushing version ${VERSION} to latest"

docker tag $SERVICE:$VERSION $ECR_SERVICE_URL:latest
docker push $ECR_SERVICE_URL:latest