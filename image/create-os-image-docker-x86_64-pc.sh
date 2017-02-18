mkdir -p /result/img
VBoxManage convertdd $image_name /result/img/virtual.vdi
xz -z -9 -T 2 /result/img/virtual.vdi

cat > /result/Dockerfile <<RUNNER
FROM busybox

COPY /img/virtual.vdi.xz /

CMD ["/bin/sh"]
RUNNER
