#!/bin/bash
PRS=(697 701 702 703 704 706 707 708 709 710 711 712 713 714 715)

while true; do
  all_merged=true
  for pr in "${PRS[@]}"; do
    state=$(gh pr view "$pr" --json state -q .state 2>/dev/null)
    if [ "$state" != "MERGED" ] && [ "$state" != "CLOSED" ]; then
      all_merged=false
      break
    fi
  done
  
  if [ "$all_merged" = true ]; then
    echo "ALL_PRS_MERGED"
    exit 0
  fi
  echo "Still waiting..."
  sleep 120
done
