export function formatINR(value) {
  const n = Number(value) || 0;
  return `₹ ${n.toLocaleString('en-IN')}`;
}

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  }).replace(/ (\d{2})$/, " '$1"); // 05 Mar '26
}
