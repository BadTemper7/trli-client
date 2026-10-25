import { clientApi } from '../api/client';
const norm = value => String(value ?? '').toLowerCase().trim();
export async function loadRates(trade) {
  const payload = await clientApi.rates();
  const items = payload?.rates;
  if (!Array.isArray(items)) throw new Error('Invalid rates response from server.');
  const category = trade === 'International' ? 'international' : 'local';
  const rates = items.filter(r => norm(r.rateType) === category);
  const rows = [];
  for (const load of ['Empty', 'Loaded']) for (const size of ['20ft', '40ft']) {
    const matches = rates.filter(r => ['all',load === 'Loaded' ? 'laden' : 'empty'].includes(norm(r.loadStatus)) && ['all',size.replace('ft','')].includes(norm(r.containerSize)));
    const amounts = {};
    for (const charge of ['lift_on','lift_off','storage']) {
      const options = matches.filter(r => norm(r.chargeType) === charge);
      const chosen = options.sort((a,b) => (norm(b.loadStatus) === norm(load === 'Loaded' ? 'laden' : 'empty') ? 2 : 0) - (norm(a.loadStatus) === norm(load === 'Loaded' ? 'laden' : 'empty') ? 2 : 0))[0];
      amounts[charge === 'lift_on' ? 'liftOn' : charge === 'lift_off' ? 'liftOff' : 'storage'] = chosen ? Number(chosen.rateAmount) : null;
    }
    if (Object.values(amounts).some(v=>v !== null && Number.isFinite(v))) rows.push({trade,load,size,...amounts});
  }
  return {source:'api',rates:rows};
}
