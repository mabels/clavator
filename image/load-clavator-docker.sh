
rm -rf /docker
mkdir -p /docker
node /builder/docker-2-docker.js clavator-docker-$ARCH-$GNUPGVERSION-$NODEVERSION /docker/clavator-docker-$ARCH-$GNUPGVERSION-$NODEVERSION.docker ${DOCKER_REGISTRY} $DOCKER_HTTP_REGISTRY
ls -la /docker

