#!/bin/bash

FILES=(
  "frontend/src/components/TickerSymbol.tsx"
  "frontend/src/components/SignalDisplay.tsx"
  "frontend/src/components/KlineChart.tsx"
)

for file in "${FILES[@]}"; do
  tsfmt --replace "$file"
done

echo "✅ successfully formatted."
