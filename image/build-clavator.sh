
mkdir -p js/clavator
cat <<DOCKER > js/clavator/Dockerfile
FROM build-clavator

COPY clavator-builder.sh /

CMD ["/bin/sh", "/clavator-builder.sh"]
DOCKER

cat <<CLAVATOR > js/clavator/clavator-builder.sh
/usr/bin/pacman --noconfirm -Sy imagemagick mesa-libgl librsvg fig2dev ghostscript texinfo
rm -rf /clavator/js /clavator/js.done
git clone https://github.com/mabels/clavator.git /clavator/js
cd /clavator/js && git rev-parse --verify --short HEAD > VERSION
cd /clavator/js && npm install 
cd /clavator/js && npm run build 
touch /clavator/js.done
CLAVATOR

docker build -t build-clavator-js js/clavator
docker run -d \
  -v /var/cache/docker/clavator:/clavator \
  -t build-clavator-js

