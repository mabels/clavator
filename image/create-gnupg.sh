#!/bin/sh

DOCKERVERSION=$1
arch=$2
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


rm -rf /clavator/gnupg-$arch
git clone file:///gnupg.git -b quick-keytocard /clavator/gnupg-$arch
VERSION=$(cd /clavator/gnupg-$arch && git rev-parse --verify --short HEAD)
echo ARCH=$arch
echo DOCKERVERION=$DOCKERVERSION
echo VERSION=$VERSION

if [ -f /clavator/gnupg-$arch.$VERSION ]
then
  echo "GnuPg Build Completed"
  exit
fi
echo $VERSION > /clavator/gnupg-$arch/.VERSION
echo $arch > /clavator/gnupg-$arch/.ARCH

cat <<EOF > /clavator/gnupg-$arch/builder.sh
pacman -Syyu --noconfirm openssh openssl git gcc autoconf make wget base-devel \
  libpng python2 pcsclite imagemagick mesa-libgl librsvg fig2dev ghostscript texinfo 

(cd /clavator/gnupg-$arch && sh ./autogen.sh)
(cd /clavator/gnupg-$arch && sh ./configure --sysconfdir=/etc --enable-maintainer-mode && make && make install)

EOF
myarch=$(uname -m)
if [ "$myarch" = "$arch" ]
then
  QEMU=
else
  QEMU=/usr/bin/qemu-$arch-static
fi

echo "Starting: clavator-docker-archlinux-$arch-$DOCKERVERSION"
docker run -i \
   -v /var/cache/docker/clavator:/clavator \
   -t clavator-docker-archlinux-$arch-$DOCKERVERSION \
   $QEMU /bin/sh /clavator/gnupg-$arch/builder.sh

cat > /clavator/gnupg-$arch/Dockerfile <<RUNNER
FROM scratch

COPY . /

CMD ["/bin/sh"]
RUNNER

echo "build"
docker build -t clavator-gnupg-$arch-$VERSION /clavator/gnupg-$arch
echo "tag"
docker tag clavator-gnupg-$arch-$VERSION fastandfearless/clavator:clavator-gnupg-$arch-$VERSION
echo "push"
[  -n "$DOCKER_AUTH" ] && \
  docker push fastandfearless/clavator:clavator-gnupg-$arch-$VERSION

touch /clavator/gnupg-$arch.$VERSION

