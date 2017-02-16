  #/bin/bash

if [ -z $1 ]
then
  VERSION=$(date "+%Y%m%d")
else
  VERSION=$1
fi
DOCKER_CONFIG_JSON=$(ruby docker_config_json.rb $1)
if [ -z $DOCKER_CONFIG_JSON ]
then
  echo "Need a registry name"
  echo "- index.docker.io/v1/fastandfearless/clavator:<imgname>"
  echo "- registry.clavator.com:5000/<imgname>"
  exit 1
fi


echo Creating OS Images for $VERSION 

docker run -ti --rm --privileged multiarch/qemu-user-static:register --reset
docker run -ti --privileged ubuntu /sbin/losetup -D

docker build -f Dockerfile-create-os-images -t clavator-create-os-images .

for i in x86_64-pc aarch64-odroid-c2 arm-odroid-c1 x86_64-pc arm-rpi23 arm-odroid-xu3 
do
  echo "Run: /builder/create-clavator-os-image-$i.sh $VERSION"
  docker ps -qa -f "name=$i-create-clavator-os-image" | xargs docker rm -f
  docker run -d --privileged \
    -v /var/run/docker.sock:/var/run/docker.sock.outer \
    -v /var/cache/docker/clavator:/clavator \
    --env "DOCKER_CONFIG_JSON=$DOCKER_CONFIG_JSON" \
    --name $i-create-clavator-os-image \
    -t clavator-create-os-images \
    /bin/sh /builder/create-clavator-os-image-$i.sh $VERSION
done


