#/bin/bash

DOCKER_REGISTRY=$1
DOCKER_CONFIG_JSON=$(ruby docker_config_json.rb $DOCKER_REGISTRY)
DOCKERVERSION=$2
if [ -z $DOCKER_CONFIG_JSON ]
then
  echo "Need a registry name"
  echo "- index.docker.io/v1/fastandfearless/clavator:<imgname>"
  echo "- registry.clavator.com:5000/<imgname>"
  exit 1
fi


docker run -ti --rm --privileged multiarch/qemu-user-static:register --reset
#docker run -ti --privileged ubuntu /sbin/losetup -D

docker build -f Dockerfile-create-os-images -t clavator-create-os-images .

docker build -f Dockerfile-create-clavator --no-cache -t clavator-create-clavator .


docker ps -qa -f "name=create-clavator-node" | xargs docker rm -f
docker run -d --privileged \
     -v /var/run/docker.sock:/var/run/docker.sock \
     -v /var/cache/docker/clavator:/clavator \
     --env "DOCKER_CONFIG_JSON=$DOCKER_CONFIG_JSON" \
     --env "DOCKER_REGISTRY=$DOCKER_REGISTRY" \
     --name create-clavator-node \
     -t clavator-create-clavator \
     /bin/sh /builder/create-clavator-node.sh


for i in x86_64 arm aarch64 
do
  echo Creating GnuPg Executables for $i 
  echo "Run: /builder/create-gnupg-$i"
  docker ps -qa -f "name=$i-create-gnupg" | xargs docker rm -f
  docker run -d --privileged \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /var/cache/docker/clavator:/clavator \
    --env "DOCKER_CONFIG_JSON=$DOCKER_CONFIG_JSON" \
    --env "DOCKER_REGISTRY=$DOCKER_REGISTRY" \
    --name $i-create-gnupg \
    -t clavator-create-clavator \
    /bin/sh /builder/create-gnupg.sh $DOCKERVERSION $i
done


