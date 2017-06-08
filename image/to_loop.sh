#!/bin/bash
argc_count=$#
image_name=$1
offset="0"
if [ $argc_count == 2 ]
then
  offset=$2
fi
dev=$(sh /builder/retry_losetup.sh -o $offset -f --show $image_name)
>&2 echo "to_loop.sh $image_name@$offset to $dev"
echo $dev
