
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

rm -rf /clavator/build.tmp
git clone file:///clavator.git /clavator/build.tmp
VERSION=$(cd /clavator/build.tmp && git rev-parse --verify --short HEAD)

if [ -f /clavator/build.$VERSION ]
then
  echo "Clavator Build Completed"
  exit
fi
rm -rf /clavator/build
mv /clavator/build.tmp /clavator/build
echo $VERSION > /clavator/build/.VERSION

mv /etc/pacman.d/mirrorlist.clavator /etc/pacman.d/mirrorlist
mv /etc/hosts.clavator /etc/hosts
cat /etc/hosts /etc/pacman.d/mirrorlist
pacman -Syyu --noconfirm npm nodejs python2

cd /clavator/build && \
  npm install &&
  npm run build

cat > /clavator/build/Dockerfile <<RUNNER
FROM scratch

COPY . /
RUNNER

echo "build"
docker build -t clavator-node-$VERSION /clavator/build
echo "tag"
docker tag clavator-node-$VERSION registry.clavator.com:5000/clavator-node-$VERSION
echo "push"
docker push registry.clavator.com:5000/clavator-node-$VERSION

echo Complete Clavator Node $VERSION
touch /clavator/build.$VERSION

