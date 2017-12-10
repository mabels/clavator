#/bin/bash

VERSION=$2
IMAGES=$3
if [ -z $VERSION ]
then
  VERSION=$(date "+%Y%m%d")
fi
DOCKER_REGISTRY=$1
DOCKER_CONFIG_JSON=$(ruby docker_config_json.rb $DOCKER_REGISTRY)
if [ -z $DOCKER_CONFIG_JSON ]
then
  echo "Need a registry name"
  echo "- index.docker.io/v1/fastandfearless/clavator:<imgname>"
  echo "- registry.clavator.com:5000/<imgname>"
  exit 1
fi

ARCHLINUXARM=https://archlinux.clavator.com/archlinuxarm/
ARCHLINUX=https://archlinux.clavator.com/archlinux/

echo Creating OS Images for $VERSION 

docker run -ti --rm --privileged multiarch/qemu-user-static:register --reset

docker build -f Dockerfile-create-os-images -t clavator-create-os-images .


for i in aarch64 x86_64 arm 
do
  archdir=/var/cache/docker/clavator/arch/$i/$(uuidgen)
  echo "Run: /builder/create-docker-archlinux-$i $VERSION $archdir"
  docker ps -qa -f "name=$i-create-docker-archlinux" | xargs -r docker rm -f
  VIMAGES="$IMAGES:$IMAGES"
  IFS='^' read -r access_key secret_key endpoint bucket <<< "$IMAGES"
  if [ -n $access_key -a -n $secret_key ]
  then
    VIMAGES=""
  fi
  docker run -d --privileged \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /var/cache/docker/clavator:/clavator \
    -v $archdir:/arch \
    $VIMAGES \
    --env "IMAGES=$IMAGES" \
    --env "DOCKER_CONFIG_JSON=$DOCKER_CONFIG_JSON" \
    --env "DOCKER_REGISTRY=$DOCKER_REGISTRY" \
    --env "ARCHLINUXARM=$ARCHLINUXARM" \
    --env "ARCHLINUX=$ARCHLINUX" \
    --name $i-create-docker-archlinux \
    -t clavator-create-os-images \
    /bin/sh /builder/create-docker-archlinux-$i.sh $VERSION
done


