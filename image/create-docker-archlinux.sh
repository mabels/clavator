#/bin/bash

VERSION=$(date "+%Y%m%d")
if [ -z "$1" ]
then
  DOCKER_AUTH=$(ruby -e 'require "json"; puts JSON.parse(IO.read("#{ENV["HOME"]}/.docker/config.json"))["auths"]["https://index.docker.io/v1/"]["auth"]')
fi

echo Creating OS Images for $VERSION 

docker run -ti --rm --privileged multiarch/qemu-user-static:register --reset
docker run -ti --privileged ubuntu /sbin/losetup -D

docker build -f Dockerfile-create-os-images -t clavator-create-os-images .

for i in aarch64 x86_64 arm 
do
  echo "Run: /builder/create-docker-archlinux-$i $VERSION"
  docker ps -qa -f "name=$i-create-docker-archlinux" | xargs docker rm -f
  docker run -d --privileged \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /var/cache/docker/clavator:/clavator \
    --env "DOCKER_AUTH=$DOCKER_AUTH" \
    --name $i-create-docker-archlinux \
    -t clavator-create-os-images \
    /bin/sh /builder/create-docker-archlinux-$i.sh $VERSION
done


