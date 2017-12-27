mkdir -p /result/img
VBoxManage convertdd $image_name /result/img/virtual.vdi
lzma -z -9 -T $(nproc) /result/img/virtual.vdi
export DISK_IMAGE=/result/img/virtual.vdi

cat > /result/Dockerfile <<RUNNER
FROM busybox

COPY /img/virtual.vdi.lzma /

CMD ["/bin/sh"]
RUNNER
