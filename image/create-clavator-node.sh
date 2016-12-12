
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

rm -rf /clavator/build
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
docker tag clavator-node-$VERSION fastandfearless/clavator:clavator-node-$VERSION
echo "push"
[  -n "$DOCKER_AUTH" ] && \
  docker push fastandfearless/clavator:clavator-node-$VERSION

echo Complete Clavator Node $VERSION
touch /clavator/build.$VERSION

