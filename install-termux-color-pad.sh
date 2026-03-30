#!/data/data/com.termux/files/usr/bin/sh

set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
SOURCE_SCRIPT="$SCRIPT_DIR/scripts/fake-miner.sh"
TARGET_DIR="${PREFIX:-/data/data/com.termux/files/usr}/bin"
TARGET_SCRIPT="$TARGET_DIR/termux-intensity-pad"

if [ ! -f "$SOURCE_SCRIPT" ]; then
  printf 'Source script not found: %s\n' "$SOURCE_SCRIPT" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"
cp "$SOURCE_SCRIPT" "$TARGET_SCRIPT"
chmod 755 "$TARGET_SCRIPT"

printf 'Installed command: termux-intensity-pad\n'
printf 'Run it from anywhere with:\n'
printf '  termux-intensity-pad\n'
