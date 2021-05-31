#!/bin/sh
rsync -hPrvz --chmod=Du=rwx,Dgo=rx,Fu=rw,Fog=r --delete --exclude=*.psd ./dist/ root@albertowd.dev:/var/www/albertowd.dev/dsv-tool/
