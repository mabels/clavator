ln $image_name $image_name.p1
#ls -la $image_name $image_name.p1
#sh /builder/retry_losetup.sh -o 1048576 -f $image_name.p1
#part1=$(losetup -l | grep $image_name.p1 | awk '{print $1}')
part1=$(sh /builder/to_loop.sh $image_name.p1 1048576)
ln $image_name $image_name.p2
#ls -la $image_name $image_name.p1 $image_name.p2
#sh /builder/retry_losetup.sh -o 135266304 -f $image_name.p2
#part2=$(losetup -l | grep $image_name.p2 | awk '{print $1}')
part2=$(sh /builder/to_loop.sh $image_name.p2 135266304)
root_disk=$part2
