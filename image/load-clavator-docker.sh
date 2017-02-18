
rm -rf /docker
mkdir -p /docker
docker pull ${DOCKER_REGISTRY}clavator-docker-$ARCH-$GNUPGVERSION-$NODEVERSION
docker save -o /docker/clavator-docker-$ARCH-$GNUPGVERSION-$NODEVERSION.docker \
  ${DOCKER_REGISTRY}clavator-docker-$ARCH-$GNUPGVERSION-$NODEVERSION
ls -la /docker

