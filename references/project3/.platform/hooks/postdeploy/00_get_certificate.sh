#!/usr/bin/env bash
# .platform/hooks/postdeploy/00_get_certificate.sh
sudo certbot -n -d provo-crib-connect.is404.net --nginx --agree-tos --email kimballberrett@gmail.com