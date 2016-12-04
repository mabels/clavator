#/bin/bash

echo $DOCKER_HOST
VERSION=$(git rev-parse --verify --short HEAD)
auth=$(ruby -e 'require "json"; puts JSON.parse(IO.read("#{ENV["HOME"]}/.docker/config.json"))["auths"]["https://index.docker.io/v1/"]["auth"]')
docker build -t build-clavator .
docker run -ti --rm --privileged multiarch/qemu-user-static:register --reset
docker run -d --privileged \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --env "DOCKER_AUTH=$auth" \
  --env "VERSION=$VERSION" \
  -t build-clavator
