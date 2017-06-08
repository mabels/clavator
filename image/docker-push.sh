
IMG_NAME=$1
BASE_PATH=$2
echo "HOME:$HOME"
echo "IMG_NAME:$IMG_NAME"
echo "BASE_PATH:$BASE_PATH"
echo "DOCKER_REGISTRY:$DOCKER_REGISTRY"
echo $(cat $HOME/.docker/config.json)
id
docker ps
find $HOME -ls

echo docker build -t $IMG_NAME $BASE_PATH
docker build -t $IMG_NAME $BASE_PATH

echo docker tag $IMG_NAME ${DOCKER_REGISTRY}$IMG_NAME
docker tag $IMG_NAME ${DOCKER_REGISTRY}$IMG_NAME

echo "DOCKER-PUSH:[$IMAGES]"
if [ -n $IMAGES -a -d $IMAGES ]
then
  echo docker save --output $IMAGES/$IMG_NAME.docker $IMG_NAME 
  docker save --output $IMAGES/$IMG_NAME.loading $IMG_NAME 
  mv $IMAGES/$IMG_NAME.loading $IMAGES/$IMG_NAME.docker
  chmod 755 $IMAGES
  chmod 644 $IMAGES/$IMG_NAME.docker
fi

echo docker push ${DOCKER_REGISTRY}$IMG_NAME
docker push ${DOCKER_REGISTRY}$IMG_NAME

