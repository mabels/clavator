ln $image_name $image_name.p1
#sh /builder/retry_losetup.sh -o 2097152 -f $image_name.p1
#echo "----<<map"
#losetup -l 
#ls -la $image_name*
#echo "---->>map"
#part1=$(losetup -l | grep $image_name.p1 | awk '{print $1}')
part1=$(sh /builder/to_loop.sh $image_name.p1 2097152)
root_disk=$part1
