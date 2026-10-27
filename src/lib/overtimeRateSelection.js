/**
 * Client-facing tariff selection. Mirrors server billing precedence for Overtime:
 * more specifically scoped rates override universal ALL/BOTH rates. This is
 * display logic only; invoices are always priced by the server.
 */
export function resolveDisplayedRates(rates, { classification, category, load, size }) {
  const applies = (rate, point) => {
    if (rate.name === 'Overtime') return (rate.collectionPoint === point || rate.collectionPoint === 'BOTH')
      && (!rate.classification || rate.classification === 'ALL' || rate.classification === classification)
      && (!rate.containerCategory || rate.containerCategory === 'ALL' || rate.containerCategory === category)
      && (!rate.loadStatus || rate.loadStatus === 'ALL' || rate.loadStatus === load)
      && (!rate.containerSize || rate.containerSize === 'ALL' || rate.containerSize === size);
    return rate.collectionPoint === point && rate.classification === classification
      && (rate.containerCategory || 'STANDARD') === category && rate.loadStatus === load
      && ['ALL', size].includes(rate.containerSize);
  };
  const score = (rate, point) => {
    if (rate.name !== 'Overtime') return (rate.containerSize === size ? 2 : 0) + (rate.containerCategory === category ? 1 : 0);
    const specific = [rate.classification === classification,rate.containerCategory === category,rate.loadStatus === load,rate.containerSize === size];
    return specific.filter(Boolean).length * 100 + (rate.collectionPoint === point ? 16 : 0)
      + (specific[0] ? 8 : 0) + (specific[1] ? 4 : 0) + (specific[2] ? 2 : 0) + (specific[3] ? 1 : 0);
  };
  return ['GATE_IN', 'GATE_OUT'].flatMap(point => {
    const chosen = new Map();
    for (const rate of rates.filter(r => applies(r, point))) {
      const prior = chosen.get(rate.name);
      if (!prior || score(rate, point) > score(prior, point)) chosen.set(rate.name, rate);
    }
    return [...chosen.values()].map(rate => ({...rate, collectionPoint: point})).sort((a,b) => a.name.localeCompare(b.name));
  });
}
