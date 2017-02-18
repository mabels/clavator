losetup -f $image_name
hole_disk=$(losetup -l | grep $image_name | awk '{print $1}')
ln $image_name $image_name.p1
losetup -o 1048576 -f $image_name.p1
part1=$(losetup -l | grep $image_name.p1 | awk '{print $1}')
ln $image_name $image_name.p2
losetup -o 135266304 -f $image_name.p2
part2=$(losetup -l | grep $image_name.p2 | awk '{print $1}')
