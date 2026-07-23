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
