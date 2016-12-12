
ARCH=$1
DOCKERVERSION=$2
mkdir -p $HOME/.docker
cat > $HOME/.docker/config.json <<RUNNER
{
  "auths": {
    "https://index.docker.io/v1/": {
      "auth": "$DOCKER_AUTH"
    }
  }
}
RUNNER
echo ARCH=$ARCH 


NODEVERSION=$(cat /clavator/build/.VERSION)
GNUPGVERSION=$(cat /clavator/gnupg-$ARCH/.VERSION)
echo NODEVERSION=$NODEVERSION
echo GNUPGVERSION=$GNUPGVERSION
echo DOCKERVERSION=$DOCKERVERSION

mkdir /arch
mkdir /arch/gnupg
node /builder/docker-extract.js clavator-gnupg-$ARCH-$GNUPGVERSION /arch/gnupg
mkdir /arch/clavator
node /builder/docker-extract.js clavator-node-$NODEVERSION /arch/clavator

rm -rf /arch/etc/letsencrypt/live/clavator.com
mkdir -p /arch/etc/letsencrypt/live/clavator.com
wget --directory-prefix=/arch/etc/letsencrypt/live/clavator.com https://clavator.com/privkey.pem
wget --directory-prefix=/arch/etc/letsencrypt/live/clavator.com https://clavator.com/fullchain.pem


cat > /arch/Dockerfile <<RUNNER
FROM clavator-docker-archlinux-$ARCH-$DOCKERVERSION

COPY clavator/ /clavator
COPY gnupg/ /gnupg
COPY etc/ /etc
#RUN /usr/bin/make -C /gnupg install
#RUN /bin/rm -rf /gnupg

CMD ["/bin/sh", "-c", "cd /clavator && npm start"]
RUNNER

#ls -la /arch/gnupg /arch/clavator

echo "build"
docker build -t clavator-docker-$ARCH-$NODEVERSION-$GNUPGVERSION /arch
echo "tag"
docker tag clavator-docker-$ARCH-$NODEVERSION-$GNUPGVERSION fastandfearless/clavator:clavator-docker-$ARCH-$NODEVERSION-$GNUPGVERSION
echo "push"
[  -n "$DOCKER_AUTH" ] && \
  docker push fastandfearless/clavator:clavator-docker-$ARCH-$NODEVERSION-$GNUPGVERSION
