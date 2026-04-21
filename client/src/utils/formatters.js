// ── Formatters (Created ONCE, Reused Everywhere) ──────

// 1. Price Formatter
const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatPrice = (amount) => {
  if (amount == null || isNaN(amount)) return "₹0";
  return priceFormatter.format(amount);
};

// 2. Date Formatters 
const dateOnly = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateWithTime = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatDate = (dateString, withTime = false) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return withTime ? dateWithTime.format(date) : dateOnly.format(date);
};

// 3. ID Formatter 
export const formatId = (id) => {
  if (!id) return "";
  return `#${id.slice(-8).toUpperCase()}`;
};
