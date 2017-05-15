
ARCH=$1
DOCKERVERSION=$2
mkdir -p $HOME/.docker

echo $DOCKER_CONFIG_JSON | base64 -d > $HOME/.docker/config.json
echo ARCH=$ARCH 


NODEVERSION=$(cat /clavator/build/.VERSION)
GNUPGVERSION=$(cat /clavator/gnupg-$ARCH/.VERSION)
echo NODEVERSION=$NODEVERSION
echo GNUPGVERSION=$GNUPGVERSION
echo DOCKERVERSION=$DOCKERVERSION


mkdir /arch
mkdir /arch/gnupg
node /builder/docker-2-docker.js clavator-gnupg-$ARCH-$GNUPGVERSION /arch/gnupg.docker ${DOCKER_REGISTRY} $DOCKER_HTTP_REGISTRY
node /builder/docker-extract.js /arch/gnupg.docker /arch/gnupg
mkdir /arch/clavator
node /builder/docker-2-docker.js clavator-node-$NODEVERSION /arch/clavator.docker ${DOCKER_REGISTRY} $DOCKER_HTTP_REGISTRY
node /builder/docker-extract.js /arch/clavator.docker /arch/clavator

rm -rf /arch/etc/letsencrypt/live/clavator.com
mkdir -p /arch/etc/letsencrypt/live/clavator.com
wget --directory-prefix=/arch/etc/letsencrypt/live/clavator.com https://clavator.com/privkey.pem
wget --directory-prefix=/arch/etc/letsencrypt/live/clavator.com https://clavator.com/fullchain.pem


cp /builder/mirrorlist.$ARCH /arch/mirrorlist

node /builder/docker-2-docker.js clavator-docker-archlinux-$ARCH-$DOCKERVERSION /arch/clavator-docker-archlinux-$ARCH-$DOCKERVERSION.docker ${DOCKER_REGISTRY} $DOCKER_HTTP_REGISTRY
docker load < /arch/clavator-docker-archlinux-$ARCH-$DOCKERVERSION.docker
cat > /arch/Dockerfile <<RUNNER
FROM clavator-docker-archlinux-$ARCH-$DOCKERVERSION

COPY clavator/ /clavator
COPY etc/ /etc
COPY gnupg/gnupg-clavator.pkg.tar.xz /
COPY mirrorlist /etc/pacman.d/
RUN pacman -Syu --force --noconfirm
RUN pacman -U --noconfirm --force /gnupg-clavator.pkg.tar.xz
RUN pacman -Scc --noconfirm ; rm -f /var/cache/pacman/pkg/* 

CMD ["/bin/sh", "-c", "cd /clavator && npm start"]
RUNNER

ls -la /arch/gnupg /arch/clavator

. /builder/docker-push.sh clavator-docker-$ARCH-$NODEVERSION-$GNUPGVERSION /arch

