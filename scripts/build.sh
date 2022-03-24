#!/usr/bin/env bash

bold=$(tput bold)
normal=$(tput sgr0)
INFO="${bold}$(tput setaf 2)INFO   ${normal}"

NAMESPACE=${NAMESPACE:-dfs}
SERVICE=${SERVICE:-chiro-provider}
VERSION=${VERSION:-$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')}

if [[ -z "$DEV" ]]; then
  TARGET="prod"
else
  TARGET="dev"
fi

echo "${INFO} Building $NAMESPACE-$SERVICE $VERSION image ($TARGET)"

docker build -t $NAMESPACE-$SERVICE:$VERSION --target=$TARGET .

if [[ -z "$DEV" ]]; then
  ENVIRONMENT="prod"
else
  ENVIRONMENT="dev"
fi

REGISTRY=${REGISTRY:-localhost:5000}

if [ "$ENVIRONMENT" != "dev" ]; then
  echo "${INFO} Targetting non-development environment"
  echo "${INFO} Logging into AWS"

  AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}
  AWS_REGION=${AWS_REGION:-us-east-1}
  REGISTRY=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

  echo "${INFO} Setting docker image registry: $REGISTRY"

  aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $REGISTRY/$NAMESPACE-$SERVICE
fi

echo "${INFO} Pushing version ${VERSION}"

docker tag $NAMESPACE-$SERVICE:$VERSION $REGISTRY/$NAMESPACE-$SERVICE:$VERSION
docker push $REGISTRY/$NAMESPACE-$SERVICE:$VERSION

echo "${INFO} Pushing version ${VERSION} to latest"

docker tag $NAMESPACE-$SERVICE:$VERSION $REGISTRY/$NAMESPACE-$SERVICE:latest
docker push $REGISTRY/$NAMESPACE-$SERVICE:latest