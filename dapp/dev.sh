#!/bin/bash
cross-env ENSContract=$1 ResolverContract=$2 Node=$3 Mainnet=$4 MoacAddress=$5 MoacSecret=$6 nuxt-ts

# public test node

# 0xE8B1D54bf8094f06eb1ad84a892C775d093325da is admin of root node
# npm run dev 0xbd1a42b09b52e84e2a95dd1c38b7125daf5f6647 0xb9ee5486070b085c8dc133854d1a08657ce59980 https://mtnode1.jccdex.cn false 0xE8B1D54bf8094f06eb1ad84a892C775d093325da 0x38912dc2726c16db2c0fa99dfad81eb208f74be2a4fbbdc2a0787ce19cdeab9c

# 0xE8B1D54bf8094f06eb1ad84a892C775d093325da is owner of "test" domain
# npm run dev 0xbd1a42b09b52e84e2a95dd1c38b7125daf5f6647 0xb9ee5486070b085c8dc133854d1a08657ce59980 https://mtnode1.jccdex.cn false 0x54cafc00a5f8200876f88034c26a748966e46940 0x3210414b81f2ef03e8c3559e20feb68a02bdd9d47a51aa5e31f5f910fa59e444
