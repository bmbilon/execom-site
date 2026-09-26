import business from "./business.json"

/** Seller details printed on the page and receipts. business.json is also read by scripts/rbe_stripe_setup.mjs. */
export const SELLER_NAME = business.legalName

/** CRA GST/HST registration, stored the way Stripe expects it (ca_gst_hst: 123456789RT0001). */
export const GST_HST = business.gstHst

/** Display form: 789103405 RT0001 */
export const GST_HST_DISPLAY = GST_HST.replace(/^(\d{9})(RT\d{4})$/, "$1 $2")
