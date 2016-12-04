#!/bin/bash

/usr/local/bin/gpg2 --quick-gen-key "$1" rsa2048 cert
fingerprint=$(/usr/local/bin/gpg2 --fingerprint "$1" | grep -v 'pub' | grep -v 'uid' | awk '{$1=$1;print}')
/usr/local/bin/gpg2 --quick-addkey "$fingerprint" rsa2048 auth
/usr/local/bin/gpg2 --quick-addkey "$fingerprint" rsa2048 sign
/usr/local/bin/gpg2 --quick-addkey "$fingerprint" rsa2048 encrypt
