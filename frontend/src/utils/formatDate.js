export function formatDate(str) {
  if (!str) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return str;
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}
