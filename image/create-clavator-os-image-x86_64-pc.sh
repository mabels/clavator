#!/bin/sh

VERSION=$1
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

echo VERSION=$VERSION
#echo DOCKER_AUTH=$DOCKER_AUTH
arch=x86_64

ln -s /run/docker.sock.outer /run/docker.sock

rm -rf /images
mkdir -p /images
node /builder/docker-extract.js \
  registry.clavator.com:5000/clavator-os-image-x86_64-pc-$VERSION \
  /images

xz -d /images/virtual.vdi.xz
image_name=/images/virtual.raw
qemu-img convert \
  -O raw /images/virtual.vdi \
  $image_name
ls -la /images

ln $image_name $image_name.p1
losetup -o 1048576 -f $image_name.p1
part1=$(losetup -l | grep $image_name.p1 | awk '{print $1}')

rm -rf /docker
mkdir -p /docker
docker pull registry.clavator.com:5000/clavator-docker-x86_64-8955526-8a88284
docker save -o /docker/clavator-docker-x86_64-8955526-8a88284.docker \
  registry.clavator.com:5000/clavator-docker-x86_64-8955526-8a88284
ls -la /docker

mkdir -p /mnt
mount $part1 /mnt
#rm -rf /var/lib/docker
#ln -s /mnt/var/lib/docker /var/lib/docker
#ls -la /var/lib/
#mkdir -p /mnt/docker
#rsync -axH  /var/lib/docker /mnt/var/lib
#mv /var/run/docker.sock /var/run/docker.sock.outer
rm -f /run/docker.sock
docker daemon --storage-driver=overlay --graph=/mnt/var/lib/docker &
DOCKER_PID=$!
echo "daemon:"$DOCKER_PID
until docker ps
do
  sleep 1
done
echo "DOCKER DAEMON is active"
docker load < /docker/clavator-docker-x86_64-8955526-8a88284.docker
echo "load:"$?
docker images -a
kill $DOCKER_PID
echo "DOCKER DAEMON is shutdown"
while pgrep docker
do
  sleep 1
done
echo "DOCKER DAEMON is done"
ln -nfs /run/docker.sock.outer /run/docker.sock
umount $part1
losetup -d $part1

rm -f /images/virtual.vdi
VBoxManage convertdd $image_name /images/virtual.vdi 
echo "compressing"
xz -z -9 -T 2 /images/virtual.vdi

mkdir -p /result
mv /images/virtual.vdi.xz /result
cat > /result/Dockerfile <<RUNNER
FROM busybox

COPY /virtual.vdi.xz /

CMD ["/bin/sh"]
RUNNER

echo "build"
docker build -t clavator-image-x86_64-pc-$VERSION /result
echo "tag"
docker tag clavator-image-x86_64-pc-$VERSION registry.clavator.com:5000/clavator-image-x86_64-pc-$VERSION
echo "push"
docker push registry.clavator.com:5000/clavator-image-x86_64-pc-$VERSION

