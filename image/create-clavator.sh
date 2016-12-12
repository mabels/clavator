#/bin/bash

if [ -z "$1" ]
then
  DOCKER_AUTH=$(ruby -e 'require "json"; puts JSON.parse(IO.read("#{ENV["HOME"]}/.docker/config.json"))["auths"]["https://index.docker.io/v1/"]["auth"]')
fi


docker run -ti --rm --privileged multiarch/qemu-user-static:register --reset
#docker run -ti --privileged ubuntu /sbin/losetup -D

docker build -f Dockerfile-create-os-images -t clavator-create-os-images .

docker build -f Dockerfile-create-clavator -t clavator-create-clavator .


docker ps -qa -f "name=create-clavator-node" | xargs docker rm -f
docker run -d --privileged \
     -v /var/run/docker.sock:/var/run/docker.sock \
     -v /var/cache/docker/clavator:/clavator \
     --env "DOCKER_AUTH=$DOCKER_AUTH" \
     --name create-clavator-node \
     -t clavator-create-clavator \
     /bin/sh /builder/create-clavator-node.sh


DOCKERVERSION=20161212
for i in x86_64 arm aarch64 
do
  echo Creating GnuPg Executables for $i 
  echo "Run: /builder/create-gnupg-$i"
  docker ps -qa -f "name=$i-create-gnupg" | xargs docker rm -f
  docker run -d --privileged \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /var/cache/docker/clavator:/clavator \
    --env "DOCKER_AUTH=$DOCKER_AUTH" \
    --name $i-create-gnupg \
    -t clavator-create-clavator \
    /bin/sh /builder/create-gnupg.sh $DOCKERVERSION $i
done


