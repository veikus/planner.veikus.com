// Pure helpers behind Route.jsx's leg-selection state. Kept out of the
// component so the "no valid connection" case can be unit tested without a
// DOM: filterConnectingOptions returning [] (not throwing) when the
// previous leg is unset is what stops a broken chain (leg1 -> no valid
// leg2 -> leg3 filter dereferencing undefined) from crashing the page.

export function filterConnectingOptions(options, previousLeg, minTransferHours) {
  if (!previousLeg) {
    return [];
  }

  const minTransferMs = minTransferHours * 60 * 60 * 1000;
  return options.filter(option => option.stdUTC >= previousLeg.staUTC + minTransferMs);
}

export function selectLeg(options, selectedId) {
  if (selectedId === undefined) {
    return options[0];
  }

  return options.find(option => option.id === selectedId) ?? options[0];
}

// Walks an N-leg route (legOptions[i] = every option available at leg
// position i) and derives, for each position, which options actually
// connect from whatever got selected one position back, and which of
// those is selected. A broken chain (filterConnectingOptions returns [])
// cascades forward: once one leg has no valid option, every leg after it
// does too, rather than any of them looking at an undefined predecessor.
// Route.jsx uses this both to render (selectedIds from state) and inside
// handleChange (selectedIds with the changed leg's tail cleared) so the
// two never risk drifting out of sync with each other.
export function deriveSelectedLegs(legOptions, selectedIds, minTransferHours) {
  const availableOptionsPerLeg = [];
  const selectedLegs = [];

  for (let i = 0; i < legOptions.length; i++) {
    const available = i === 0
      ? legOptions[0]
      : filterConnectingOptions(legOptions[i], selectedLegs[i - 1], minTransferHours);
    availableOptionsPerLeg.push(available);
    selectedLegs.push(selectLeg(available, selectedIds[i]));
  }

  return { availableOptionsPerLeg, selectedLegs };
}
