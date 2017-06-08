ln $image_name $image_name.p1
#sh /builder/retry_losetup.sh -o 1048576 -f $image_name.p1
#part1=$(losetup -l | grep $image_name.p1 | awk '{print $1}')
part1=$(sh /builder/to_loop.sh $image_name.p1 1048576)
root_disk=$part1

