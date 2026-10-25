/**
 * DEMONSTRATION PRICES ONLY. Not actual ONE TRUE LOGISTICS tariffs.
 * Replace this array with the approved rates or an API response when available.
 * Monetary values are PHP. Storage is per container per billable day.
 */
const sample = {
  Domestic: {
    Empty: { '20ft': [1050, 950, 190], '40ft': [1600, 1450, 300] },
    Loaded: { '20ft': [1850, 1750, 340], '40ft': [2850, 2700, 530] }
  },
  International: {
    Empty: { '20ft': [1450, 1350, 250], '40ft': [2150, 2050, 390] },
    Loaded: { '20ft': [2450, 2350, 460], '40ft': [3650, 3500, 720] }
  }
};

export const rateSchedule = Object.entries(sample).flatMap(([trade, conditions]) =>
  Object.entries(conditions).flatMap(([load, sizes]) =>
    Object.entries(sizes).map(([size, [liftOn, liftOff, storage]]) => ({
      id: `${trade}-${load}-${size}`,
      trade,
      load,
      size,
      liftOn,
      liftOff,
      storage,
      currency: 'PHP',
      isSample: true
    }))
  )
);

export const formatPHP = (amount) =>
  typeof amount === 'number' && Number.isFinite(amount) && amount >= 0
    ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(amount)
    : 'Contact for rate';
