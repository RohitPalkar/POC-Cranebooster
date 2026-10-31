const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
const aed = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

/** INR with Indian digit grouping, for example ₹4,85,000. */
export function formatINR(n: number) {
  return `₹${inr.format(n)}`
}

export function formatAED(n: number) {
  return `AED ${aed.format(n)}`
}

export function formatMoney(n: number, currency: 'INR' | 'AED' = 'INR') {
  return currency === 'AED' ? formatAED(n) : formatINR(n)
}

export function formatNumber(n: number) {
  return inr.format(n)
}
