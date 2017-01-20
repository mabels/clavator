
ARCH=$1
DOCKERVERSION=$2
mkdir -p $HOME/.docker
cat > $HOME/.docker/config.json <<RUNNER
{
  "auths": {
    "registry.clavator.com:5000": {
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
node /builder/docker-extract.js registry.clavator.com:5000/clavator-gnupg-$ARCH-$GNUPGVERSION /arch/gnupg
mkdir /arch/clavator
node /builder/docker-extract.js registry.clavator.com:5000/clavator-node-$NODEVERSION /arch/clavator

rm -rf /arch/etc/letsencrypt/live/clavator.com
mkdir -p /arch/etc/letsencrypt/live/clavator.com
wget --directory-prefix=/arch/etc/letsencrypt/live/clavator.com https://clavator.com/privkey.pem
wget --directory-prefix=/arch/etc/letsencrypt/live/clavator.com https://clavator.com/fullchain.pem


cp /builder/mirrorlist.$ARCH /arch/mirrorlist

cat > /arch/Dockerfile <<RUNNER
FROM registry.clavator.com:5000/clavator-docker-archlinux-$ARCH-$DOCKERVERSION

COPY clavator/ /clavator
COPY etc/ /etc
COPY gnupg/gnupg-clavator.tar.xz /
COPY mirrorlist /etc/pacman.d/
RUN  pacman -Syu --noconfirm
RUN  pacman -U --noconfirm --force /gnupg-clavator.tar.xz

CMD ["/bin/sh", "-c", "cd /clavator && npm start"]
RUNNER

ls -la /arch/gnupg /arch/clavator

echo "build"
docker build -t clavator-docker-$ARCH-$NODEVERSION-$GNUPGVERSION /arch
echo "tag"
docker tag clavator-docker-$ARCH-$NODEVERSION-$GNUPGVERSION registry.clavator.com:5000/clavator-docker-$ARCH-$NODEVERSION-$GNUPGVERSION
echo "push"
docker push registry.clavator.com:5000/clavator-docker-$ARCH-$NODEVERSION-$GNUPGVERSION
