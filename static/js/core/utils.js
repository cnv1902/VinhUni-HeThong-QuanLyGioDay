function esc(v) {
  return String(v === undefined || v === null ? "" : v).replace(
    /[&<>"']/g,
    (s) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        s
      ],
  );
}
function parseNum(v, fallback) {
  const n = parseFloat(v);
  return isNaN(n) ? fallback : n;
}
