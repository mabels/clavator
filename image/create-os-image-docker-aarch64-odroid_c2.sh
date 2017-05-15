echo "clean hard link"
rm -f $image_name.p?
mkdir -p /result/img
echo "compress image"
xz -z -T 2 -9 $image_name
mv $image_name.xz /result/img/

base_image_name=`basename $image_name`
echo "Image:" $image_name
echo "BaseName:" $base_image_name
cat > /result/Dockerfile <<RUNNER
FROM busybox

COPY /img/$base_image_name.xz /
RUN ln -s $base_image_name.xz sdcard.img.xz
RUN ln -s $base_image_name.xz odroid_c2.img.xz 

CMD ["/bin/sh"]
RUNNER
