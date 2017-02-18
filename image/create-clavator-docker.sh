#/bin/bash

DOCKER_REGISTRY=$1
DOCKER_CONFIG_JSON=$(ruby docker_config_json.rb $DOCKER_REGISTRY)
IMAGEVERSION=$2
NODEVERSION=$3
GNUPGVERSION=$4

if [ -z $DOCKER_CONFIG_JSON ]
then
  echo "Need a registry name"
  echo "- index.docker.io/v1/fastandfearless/clavator:<imgname>"
  echo "- registry.clavator.com:5000/<imgname>"
  exit 1
fi

echo Creating Clavator Docker

docker run -ti --rm --privileged multiarch/qemu-user-static:register --reset

docker build -f Dockerfile-create-os-images -t clavator-create-os-images .

for i in x86_64 arm aarch64 
do
  echo "Run: /builder/create-clavator-docker-container $i -NODE $NODEVERSION -GNUPG $GNUPGVERSION"
  docker ps -qa -f "name=$i-create-clavator-docker-container" | xargs docker rm -f
  docker run -ti --privileged \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /var/cache/docker/clavator:/clavator \
    --env "DOCKER_CONFIG_JSON=$DOCKER_CONFIG_JSON" \
    --env "DOCKER_REGISTRY=$DOCKER_REGISTRY" \
    --env "IMAGEVERSION=$IMAGEVERSION" \
    --env "NODEVERSION=$NODEVERSION" \
    --env "GNUPGVERSION=$GNUPGVERSION" \
    --name $i-create-clavator-docker-container \
    -t clavator-create-os-images \
    /bin/sh /builder/create-clavator-docker-container.sh $i $IMAGEVERSION
done

