rm -f /run/docker.sock
dockerd --storage-driver=overlay --data-root=/mnt/var/lib/docker &
DOCKER_PID=$!
echo "daemon:"$DOCKER_PID
until docker ps
do
  sleep 1
done
echo "DOCKER DAEMON is active"
ls -la /docker/
ls -lad /bin /usr/bin
docker info
df
docker load < /docker/clavator-docker-$ARCH-$GNUPGVERSION-$NODEVERSION.docker
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
