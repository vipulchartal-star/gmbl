#!/data/data/com.termux/files/usr/bin/sh

set -u

PALETTES="
52 124 196 231
22 34 46 231
28 40 46 231
23 35 48 231
17 27 39 231
53 129 201 16
58 178 226 16
88 202 208 16
"

palette_count() {
  printf '%s\n' "$PALETTES" | awk 'NF { count++ } END { print count }'
}

palette_at() {
  index="$1"
  printf '%s\n' "$PALETTES" | awk 'NF { rows[++n] = $0 } END { if (n) print rows['"$index"'] }'
}

draw_bar() {
  level="$1"
  count=0
  while [ "$count" -lt 20 ]; do
    if [ "$count" -lt "$level" ]; then
      printf '#'
    else
      printf '.'
    fi
    count=$((count + 1))
  done
}

draw_screen() {
  pair="$(palette_at "$PALETTE_INDEX")"
  BG_LOW="$(printf '%s\n' "$pair" | awk '{ print $1 }')"
  BG_MID="$(printf '%s\n' "$pair" | awk '{ print $2 }')"
  BG_HIGH="$(printf '%s\n' "$pair" | awk '{ print $3 }')"
  FG="$(printf '%s\n' "$pair" | awk '{ print $4 }')"

  if [ "$INTENSITY" -le 6 ]; then
    BG="$BG_LOW"
  elif [ "$INTENSITY" -le 13 ]; then
    BG="$BG_MID"
  else
    BG="$BG_HIGH"
  fi

  printf '\033[2J\033[H'
  printf '\033[48;5;%sm\033[38;5;%sm' "$BG" "$FG"

  row=0
  while [ "$row" -lt 15 ]; do
    printf '                                                                                \n'
    row=$((row + 1))
  done

  printf '\033[H'
  printf '                              TERMUX INTENSITY PAD                              \n'
  printf '                                                                                \n'
  printf '                     press keys here to raise the color intensity               \n'
  printf '                                                                                \n'
  printf '                              palette: %-2s  bg: %-3s fg: %-3s                 \n' \
    "$PALETTE_INDEX" "$BG" "$FG"
  printf '                                                                                \n'
  printf '                              intensity: ['
  draw_bar "$INTENSITY"
  printf ']                              \n'
  printf '                                                                                \n'
  printf '                           space = next palette, q = quit                       \n'
  printf '                                                                                \n'
  printf '                           total taps: %-6s fade: auto                          \n' "$KEY_COUNT"
  printf '                                                                                \n'
  printf '                                                                                \n'
  printf '                                                                                \n'
  printf '                                                                                \n'
  printf '\033[0m'
}

cleanup() {
  stty sane 2>/dev/null || true
  printf '\033[0m\033[2J\033[H'
}

TOTAL_PALETTES="$(palette_count)"
PALETTE_INDEX=1
INTENSITY=0
KEY_COUNT=0
IDLE_TICKS=0

trap cleanup EXIT INT TERM

stty -echo -icanon min 0 time 2
draw_screen

while :; do
  KEY="$(dd bs=1 count=1 2>/dev/null)"

  if [ -n "$KEY" ]; then
    if [ "$KEY" = "q" ]; then
      break
    fi

    if [ "$KEY" = " " ]; then
      PALETTE_INDEX=$((PALETTE_INDEX + 1))
      if [ "$PALETTE_INDEX" -gt "$TOTAL_PALETTES" ]; then
        PALETTE_INDEX=1
      fi
    fi

    KEY_COUNT=$((KEY_COUNT + 1))
    INTENSITY=$((INTENSITY + 3))
    if [ "$INTENSITY" -gt 20 ]; then
      INTENSITY=20
    fi
    IDLE_TICKS=0
    draw_screen
    continue
  fi

  IDLE_TICKS=$((IDLE_TICKS + 1))
  if [ "$IDLE_TICKS" -ge 2 ] && [ "$INTENSITY" -gt 0 ]; then
    INTENSITY=$((INTENSITY - 1))
    draw_screen
  fi
done
