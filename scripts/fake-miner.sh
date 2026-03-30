#!/data/data/com.termux/files/usr/bin/sh

set -u

PALETTES="
196 16
46 16
21 231
201 16
226 16
51 16
208 16
93 231
160 231
33 16
"

random_index() {
  max="$1"
  awk -v max="$max" 'BEGIN { srand(); print int(rand() * max) + 1 }'
}

palette_count() {
  printf '%s\n' "$PALETTES" | awk 'NF { count++ } END { print count }'
}

palette_at() {
  index="$1"
  printf '%s\n' "$PALETTES" | awk 'NF { rows[++n] = $0 } END { if (n) print rows['"$index"'] }'
}

draw_screen() {
  pair="$(palette_at "$CURRENT_INDEX")"
  BG="$(printf '%s\n' "$pair" | awk '{ print $1 }')"
  FG="$(printf '%s\n' "$pair" | awk '{ print $2 }')"

  printf '\033[2J\033[H'
  printf '\033[48;5;%sm\033[38;5;%sm' "$BG" "$FG"

  i=0
  while [ "$i" -lt 14 ]; do
    printf '                                                                                \n'
    i=$((i + 1))
  done

  printf '\033[H'
  printf '                                TERMUX COLOR PAD                               \n'
  printf '                                                                                \n'
  printf '                         press any key to change colors                         \n'
  printf '                                                                                \n'
  printf '                              current bg: %-3s fg: %-3s                         \n' "$BG" "$FG"
  printf '                                                                                \n'
  printf '                           keys: any key = next color                           \n'
  printf '                                                                                \n'
  printf '                              q = quit the demo                                 \n'
  printf '                                                                                \n'
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

TOTAL="$(palette_count)"
CURRENT_INDEX="$(random_index "$TOTAL")"

trap cleanup EXIT INT TERM

stty -echo -icanon min 1 time 0
draw_screen

while :; do
  KEY="$(dd bs=1 count=1 2>/dev/null)"

  if [ "$KEY" = "q" ]; then
    break
  fi

  CURRENT_INDEX=$((CURRENT_INDEX + 1))
  if [ "$CURRENT_INDEX" -gt "$TOTAL" ]; then
    CURRENT_INDEX=1
  fi

  draw_screen
done
