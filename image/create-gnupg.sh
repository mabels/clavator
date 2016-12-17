#!/bin/sh

DOCKERVERSION=$1
arch=$2
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


rm -rf /clavator/gnupg-$arch.tmp
git clone file:///gnupg-clavator.git /clavator/gnupg-$arch.tmp
VERSION=$(cd /clavator/gnupg-$arch.tmp && git rev-parse --verify --short HEAD)
echo ARCH=$arch
echo DOCKERVERION=$DOCKERVERSION
echo VERSION=$VERSION

if [ -f /clavator/gnupg-$arch.$VERSION ]
then
  echo "GnuPg Build Completed"
  exit
fi
rm -rf /clavator/gnupg-$arch
mv /clavator/gnupg-$arch.tmp /clavator/gnupg-$arch
git clone --bare /gnupg.git /clavator/gnupg-$arch/gnupg.git
echo $VERSION > /clavator/gnupg-$arch/.VERSION
echo $arch > /clavator/gnupg-$arch/.ARCH
sed -i.orig "s|source=(\"git://github.com/mabels/gnupg.git|source=(\"git+file:///clavator/gnupg-$arch/gnupg.git|" /clavator/gnupg-$arch/PKGBUILD


cp /makepkg.patch /clavator/gnupg-$arch/
cat <<EOF > /clavator/gnupg-$arch/builder.sh
mv /etc/hosts.clavator /etc/hosts
mv /etc/pacman.d/mirrorlist.clavator /etc/pacman.d/mirrorlist
cat /etc/hosts /etc/pacman.d/mirrorlist
pacman -Syyu --noconfirm base-devel openssh openssl git gcc autoconf make wget base-devel \
  libpng python2 pcsclite imagemagick mesa-libgl librsvg fig2dev ghostscript texinfo 
#  rsync sudo

#echo "%wheel ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
#useradd -g wheel -m builder

(cd /usr/bin && patch -p0 ) < /clavator/gnupg-$arch/makepkg.patch

#chown -R builder /clavator/gnupg-$arch

(cd /clavator/gnupg-$arch && makepkg -s --noconfirm)

EOF
myarch=$(uname -m)
if [ "$myarch" = "$arch" ]
then
  QEMU=
else
  QEMU=/usr/bin/qemu-$arch-static
fi

echo "Starting: clavator-docker-archlinux-$arch-$DOCKERVERSION"
docker run -i --privileged \
   -v /var/cache/docker/clavator:/clavator \
   -t clavator-docker-archlinux-$arch-$DOCKERVERSION \
   $QEMU /bin/sh /clavator/gnupg-$arch/builder.sh

cat > /clavator/gnupg-$arch/Dockerfile <<RUNNER
FROM scratch

COPY gnupg-clavator-*.pkg.tar.xz /
COPY gnupg-clavator-*.pkg.tar.xz /gnupg-clavator.tar.xz

CMD ["/bin/sh"]
RUNNER

echo "build"
docker build -t clavator-gnupg-$arch-$VERSION /clavator/gnupg-$arch
echo "tag"
docker tag clavator-gnupg-$arch-$VERSION \
  registry.clavator.com:5000/clavator-gnupg-$arch-$VERSION
echo "push"
docker push registry.clavator.com:5000/clavator-gnupg-$arch-$VERSION

touch /clavator/gnupg-$arch.$VERSION

