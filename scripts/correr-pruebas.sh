#!/usr/bin/env bash
# Corre scripts/*-test.mjs (necesita CHROME y AXE). Lo que falla con carga se repite una vez, solo:
# varias pruebas miden tiempos en navegador. Lo que falle dos veces hace fallar la corrida.
set -u
cd "$(dirname "$0")/.."
python3 -m http.server 8765 --bind 127.0.0.1 >/dev/null 2>&1 &
srv=$!
trap 'kill "$srv" 2>/dev/null' EXIT
sleep 1
t=$(mktemp -d)
una() { b=$(basename "$1"); if timeout 420 node "$1" >"$t/$b.log" 2>&1; then echo "ok $b"; else echo "falla $b"; fi; }
export -f una; export t
ls scripts/*-test.mjs | xargs -P 3 -I{} bash -c 'una {}' >"$t/res"
grep -c '^ok' "$t/res"
malas=0
for b in $(awk '$1=="falla"{print $2}' "$t/res"); do
  if timeout 420 node "scripts/$b" >"$t/$b.log" 2>&1; then echo "paso al repetir: $b"; else
    echo "FALLA $b"; tail -15 "$t/$b.log"; malas=$((malas + 1)); fi
done
exit "$malas"
