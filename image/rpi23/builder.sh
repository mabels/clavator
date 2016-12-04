
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

cd /root/rpi23-gen-image && \
	RPI_MODEL=2 \
	RELEASE=stretch \
	HOSTNAME=clavator \
	./rpi23-gen-image.sh 
pwd
ls -la

mkdir /root/odroid-c2
cd /root/odroid-c2
mv /root/odroid-c2-minimal-debian-ubuntu .

pwd
ls -la

cat > Dockerfile <<RUNNER
FROM ubuntu:xenial

COPY . /odroid-c2

CMD ["/bin/bash"]
RUNNER

docker build -t odroid-c2-$distro-$VERSION .
docker tag odroid-c2-$distro-$arch-$VERSION fastandfearless/clavator:odroid-c2-$distro-$arch-$VERSION
docker push fastandfearless/clavator:odroid-c2-$distro-$arch-$VERSION


