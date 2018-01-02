echo "clean hard link"
rm -f $image_name.p?
mkdir -p /result/img
echo "compress image"
lbzip2 -6 -n $(nproc) $image_name
mv $image_name.bz2 /result/img/
export DISK_IMAGE=/result/img/$image_name.bz2

base_image_name=`basename $image_name`
echo "Image:" $image_name
echo "BaseName:" $base_image_name
cat > /result/Dockerfile <<RUNNER
FROM busybox

COPY /img/$base_image_name.bz2 /
RUN ln -s $base_image_name.bz2 sdcard.img.bz2
RUN ln -s $base_image_name.bz2 odroid_c2.img.bz2 

CMD ["/bin/sh"]
RUNNER
