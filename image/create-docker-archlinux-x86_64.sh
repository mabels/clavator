#!/bin/sh

VERSION=$1
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
echo VERSION=$VERSION
#echo DOCKER_AUTH=$DOCKER_AUTH
arch=x86_64

mkdir /arch
[ -f /clavator/archlinux-bootstrap-2016.12.01-x86_64.tar.gz ] ||
  wget --directory-prefix=/clavator \
  https://mirrors.kernel.org/archlinux/iso/2016.12.01/archlinux-bootstrap-2016.12.01-x86_64.tar.gz

tar xzf /clavator/archlinux-bootstrap-2016.12.01-x86_64.tar.gz -C /arch
mv /arch/root.x86_64/* /arch/

reflector --verbose --latest 5 --sort rate --save /arch/etc/pacman.d/mirrorlist

/bin/sh /builder/create-docker-archlinux-updater.sh

arch-chroot /arch /bin/sh -x /updater.sh

cat > /arch/Dockerfile <<RUNNER
FROM scratch

COPY . /

CMD ["/bin/sh"]
RUNNER

echo "build"
docker build -t clavator-docker-archlinux-x86_64-$VERSION /arch
echo "tag"
docker tag clavator-docker-archlinux-x86_64-$VERSION fastandfearless/clavator:clavator-docker-archlinux-x86_64-$VERSION
echo "push"
[  -n "$DOCKER_AUTH" ] && \
  docker push fastandfearless/clavator:clavator-docker-archlinux-x86_64-$VERSION



