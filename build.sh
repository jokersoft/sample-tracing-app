#!/bin/bash

export TAG=v1.0.0

docker build -t yarche/sample-tracing-app:${TAG} .
docker push yarche/sample-tracing-app:${TAG}
