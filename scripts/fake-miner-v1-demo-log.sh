#!/data/data/com.termux/files/usr/bin/sh

set -u

COINS="
Monero
Bitcoin
Litecoin
Dogecoin
Ethereum Classic
"

WALLETS="
49f7mDemoWalletAddressForMoneroTermuxOnly
bc1qdemowallet0000000000000000000000termux
ltc1qdemowallet000000000000000000000termux
D8emoWalletAddress00000000000000000000
0xDEMO000000000000000000000000000000000000
"

pick_random() {
  printf '%s\n' "$1" | awk 'NF { print }' | awk 'BEGIN { srand(); } { a[++n] = $0 } END { if (n) print a[int(rand() * n) + 1] }'
}

rand_range() {
  min="$1"
  max="$2"
  awk -v min="$min" -v max="$max" 'BEGIN { srand(); printf "%.6f", min + rand() * (max - min) }'
}

rand_int() {
  min="$1"
  max="$2"
  awk -v min="$min" -v max="$max" 'BEGIN { srand(); print int(min + rand() * ((max - min) + 1)) }'
}

COIN="$(pick_random "$COINS")"
WALLET="$(pick_random "$WALLETS")"
WORKER="termux-$(rand_int 100 999)"
CPU_THREADS="$(getconf _NPROCESSORS_ONLN 2>/dev/null || printf '4\n')"
START_TS="$(date '+%Y-%m-%d %H:%M:%S')"
SHARE_COUNT=0

clear
printf 'tmx-minerd 1.4.2-demo\n'
printf '[%s] bootstrapping miner profile\n' "$START_TS"
printf '[%s] target coin: %s\n' "$START_TS" "$COIN"
printf '[%s] worker id: %s\n' "$START_TS" "$WORKER"
printf '[%s] wallet: %s\n' "$START_TS" "$WALLET"
printf '[%s] threads: %s\n' "$START_TS" "$CPU_THREADS"
printf '[%s] mode: simulation-only (no mining, no pool traffic)\n' "$START_TS"
printf '\n'

while :; do
  TS="$(date '+%Y-%m-%d %H:%M:%S')"
  HASHRATE="$(rand_range 0.42 6.85)"
  TEMP="$(rand_int 37 56)"
  DIFF="$(rand_int 12000 95000)"
  ACCEPTED="$(rand_range 0.000001 0.000084)"
  LATENCY="$(rand_int 42 210)"
  SHARE_ROLL="$(rand_int 1 6)"

  if [ "$SHARE_ROLL" -eq 3 ]; then
    SHARE_COUNT=$((SHARE_COUNT + 1))
    printf '[%s] accepted share #%s diff=%s latency=%sms est_reward=%s %s\n' \
      "$TS" "$SHARE_COUNT" "$DIFF" "$LATENCY" "$ACCEPTED" "$COIN"
  else
    printf '[%s] hashrate=%s H/s cpu=%sC shares=%s uptime=ok coin=%s\n' \
      "$TS" "$HASHRATE" "$TEMP" "$SHARE_COUNT" "$COIN"
  fi

  sleep 2
done
