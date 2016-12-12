
mkdir -p x86_64/gnupg
cat <<DOCKER > x86_64/gnupg/Dockerfile
FROM build-clavator

COPY gnupg-builder.sh /

CMD ["/bin/sh", "/gnupg-builder.sh"]
DOCKER

cat <<GNUPG > x86_64/gnupg/gnupg-builder.sh
/usr/bin/pacman --noconfirm -Sy imagemagick mesa-libgl librsvg fig2dev ghostscript texinfo
rm -rf /clavator/x86_64/gnupg /clavator/x86_64/gnupg.done
mkdir -p /clavator/x86_64/gnupg
cd /clavator/x86_64/gnupg && sh ./autogen.sh
cd /clavator/x86_64 && git rev-parse --verify --short HEAD > VERSION
cd /clavator/x86_64/gnupg && ./configure --sysconfdir=/etc --enable-maintainer-mode && make
touch /clavator/x86_64/gnupg.done
GNUPG


docker build -t build-gnupg-x86_64 x86_64/gnupg
docker run -d \
  -v /var/cache/docker/clavator:/clavator \
  -t build-gnupg-x86_64 

