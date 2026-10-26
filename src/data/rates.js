/** Currency formatting only. Live prices are always retrieved from /api/rates. */
export const formatPHP = (amount) =>
  typeof amount === 'number' && Number.isFinite(amount) && amount >= 0
    ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(amount)
    : 'Contact for rate';
