echo "IMAGES=$IMAGES"

mkdir -p $HOME/.docker
echo $DOCKER_CONFIG_JSON | base64 -d > $HOME/.docker/config.json

rm -rf /clavator/build.tmp
git clone file:///clavator.git /clavator/build.tmp
VERSION=$(cd /clavator/build.tmp && git rev-parse --verify --short HEAD)

docker pull ${DOCKER_REGISTRY}clavator-node-$VERSION
#if [ $? = 0 ]
#then
#  echo "Clavator Build Completed"
#  exit
#fi


rm -rf /clavator/build
mv /clavator/build.tmp /clavator/build
echo $VERSION > /clavator/build/.VERSION

mv /etc/pacman.d/mirrorlist.clavator /etc/pacman.d/mirrorlist
mv /etc/hosts.clavator /etc/hosts
cat /etc/hosts /etc/pacman.d/mirrorlist
pacman -Syyu --noconfirm npm nodejs python2
pacman -Scc --noconfirm ; rm -f /var/cache/pacman/pkg/* 

cd /clavator/build && \
  npm install &&
  npm run build

cat > /clavator/build/Dockerfile <<RUNNER
FROM scratch

COPY . /
RUNNER


. /builder/docker-push.sh clavator-node-$VERSION /clavator/build

echo Complete Clavator Node $VERSION
touch /clavator/build.$VERSION

