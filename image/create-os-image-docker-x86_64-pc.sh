mkdir -p /result/img
VBoxManage convertdd $image_name /result/img/virtual.vdi
lbzip2 -6 -n $(nproc) /result/img/virtual.vdi
ls -la /result/img/
export DISK_IMAGE=/result/img/virtual.vdi.bz2
#lbzip2 -6 -n $(nproc) $image_name
#export DISK_IMAGE=$image_name.bz2

cat > /result/Dockerfile <<RUNNER
FROM busybox

COPY /img/virtual.vdi.* /

CMD ["/bin/sh"]
RUNNER
