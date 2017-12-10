
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
IFS='^' read -r access_key secret_key endpoint bucket <<< "$IMAGES"
if [ -n $access_key -a -n $secret_key ]
then
    mkdir -p $HOME/.aws
    cat > $HOME/.aws/credentials <<S3CFG
[default]
aws_access_key_id = $access_key
aws_secret_access_key = $secret_key
S3CFG
    #aws s3 --endpoint $endpoint ls s3://$bucket
    awsCmd="aws s3 cp --endpoint $endpoint - s3://$bucket/$IMG_NAME.docker"
    echo "docker save $IMG_NAME | $awsCmd"
    docker save $IMG_NAME | $awsCmd 
else
  if [ -n $IMAGES -a -d $IMAGES ]
  then
    echo docker save --output $IMAGES/$IMG_NAME.docker $IMG_NAME 
    docker save --output $IMAGES/$IMG_NAME.loading $IMG_NAME 
    mv $IMAGES/$IMG_NAME.loading $IMAGES/$IMG_NAME.docker

    chmod 755 $IMAGES
    chmod 644 $IMAGES/$IMG_NAME.docker
  fi
fi

echo docker push ${DOCKER_REGISTRY}$IMG_NAME
docker push ${DOCKER_REGISTRY}$IMG_NAME

