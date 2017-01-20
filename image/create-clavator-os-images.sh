#/bin/bash

if [ -z $1 ]
then
  VERSION=$(date "+%Y%m%d")
else
  VERSION=$1
fi
DOCKER_AUTH=$(ruby -e 'require "json"; puts JSON.parse(IO.read("#{ENV["HOME"]}/.docker/config.json"))["auths"]["registry.clavator.com:5000"]["auth"]')

echo Creating OS Images for $VERSION 

docker run -ti --rm --privileged multiarch/qemu-user-static:register --reset
docker run -ti --privileged ubuntu /sbin/losetup -D

docker build -f Dockerfile-create-os-images -t clavator-create-os-images .

for i in x86_64-pc # aarch64-odroid-c2
#for i in aarch64-odroid-c2 arm-odroid-c1 x86_64-pc arm-rpi23 arm-odroid-xu3 
do
  echo "Run: /builder/create-clavator-os-image-$i.sh $VERSION"
  docker ps -qa -f "name=$i-create-clavator-os-image" | xargs docker rm -f
  docker run -d --privileged \
    -v /var/run/docker.sock:/var/run/docker.sock.outer \
    -v /var/cache/docker/clavator:/clavator \
    --env "DOCKER_AUTH=$DOCKER_AUTH" \
    --name $i-create-clavator-os-image \
    -t clavator-create-os-images \
    /bin/sh /builder/create-clavator-os-image-$i.sh $VERSION
done


