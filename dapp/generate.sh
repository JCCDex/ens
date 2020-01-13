#!/bin/bash

cross-env ENSContract=$1 ResolverContract=$2 Node=$3 Mainnet=$4 nuxt-ts generate

# test node
# npm run generate "0xbd1a42b09b52e84e2a95dd1c38b7125daf5f6647" "0xb9ee5486070b085c8dc133854d1a08657ce59980" https://mtnode1.jccdex.cn false

# main node
# npm run generate "0xea5a36ed305c5033e6ec27edb48009b79290ea51" "0xdf1b5192d3fc1928ef7fd0cdd567875972b9c9e4" https://chain3.mytokenpocket.vip true