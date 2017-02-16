#/bin/bash

VERSION=$(date "+%Y%m%d")
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

docker build -f Dockerfile-create-os-images -t clavator-create-os-images .

for i in aarch64 x86_64 arm 
do
  echo "Run: /builder/create-docker-archlinux-$i $VERSION"
  docker ps -qa -f "name=$i-create-docker-archlinux" | xargs docker rm -f
  docker run -d --privileged \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /var/cache/docker/clavator:/clavator \
    --env "DOCKER_CONFIG_JSON=$DOCKER_CONFIG_JSON" \
    --name $i-create-docker-archlinux \
    -t clavator-create-os-images \
    /bin/sh /builder/create-docker-archlinux-$i.sh $VERSION
done


