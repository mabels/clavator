#!/bin/sh

DOCKERVERSION=$1
arch=$2
mkdir -p $HOME/.docker
echo $DOCKER_CONFIG_JSON | base64 -d > $HOME/.docker/config.json

rm -rf /clavator/gnupg-$arch.tmp
git clone file:///gnupg-clavator.git /clavator/gnupg-$arch.tmp
VERSION=$(cd /clavator/gnupg-$arch.tmp && git rev-parse --verify --short HEAD)
echo ARCH=$arch
echo DOCKERVERION=$DOCKERVERSION
echo VERSION=$VERSION

docker pull $DOCKER_REGISTRY:clavator-gnupg-$arch-$VERSION
if [ $? = 0 ]
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
pacman -Scc --noconfirm ; rm -f /var/cache/pacman/pkg/*
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
COPY gnupg-clavator-*.pkg.tar.xz /gnupg-clavator.pkg.tar.xz

CMD ["/bin/sh"]
RUNNER


. /builder/docker-push.sh clavator-gnupg-$arch-$VERSION /clavator/gnupg-$arch

touch /clavator/gnupg-$arch.$VERSION

