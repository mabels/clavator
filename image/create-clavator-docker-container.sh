
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
node /builder/docker-extract.js ${DOCKER_REGISTRY}clavator-gnupg-$ARCH-$GNUPGVERSION /arch/gnupg
mkdir /arch/clavator
node /builder/docker-extract.js ${DOCKER_REGISTRY}clavator-node-$NODEVERSION /arch/clavator

rm -rf /arch/etc/letsencrypt/live/clavator.com
mkdir -p /arch/etc/letsencrypt/live/clavator.com
wget --directory-prefix=/arch/etc/letsencrypt/live/clavator.com https://clavator.com/privkey.pem
wget --directory-prefix=/arch/etc/letsencrypt/live/clavator.com https://clavator.com/fullchain.pem


cp /builder/mirrorlist.$ARCH /arch/mirrorlist

cat > /arch/Dockerfile <<RUNNER
FROM ${DOCKER_REGISTRY}clavator-docker-archlinux-$ARCH-$DOCKERVERSION

COPY clavator/ /clavator
COPY etc/ /etc
COPY gnupg/gnupg-clavator.pkg.tar.xz /
COPY mirrorlist /etc/pacman.d/
RUN pacman -Syu --noconfirm
RUN pacman -U --noconfirm --force /gnupg-clavator.pkg.tar.xz
RUN pacman -Scc --noconfirm ; rm -f /var/cache/pacman/pkg/* 

CMD ["/bin/sh", "-c", "cd /clavator && npm start"]
RUNNER

ls -la /arch/gnupg /arch/clavator

. /builder/docker-push.sh clavator-docker-$ARCH-$NODEVERSION-$GNUPGVERSION /arch

