mkdir -p /result/img
xz -z -T 2 -9 $image_name
ln $image_name.xz /result/img

cat > /result/Dockerfile <<RUNNER
FROM busybox

COPY /img/$image_name.xz /
RUN ln -s $image_name.xz sdcard.img.xz
RUN ln -s $image_name.xz rpi23.img.xz

CMD ["/bin/sh"]
RUNNER
