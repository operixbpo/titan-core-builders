export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID",
  "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO",
  "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA",
  "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
] as const;

export const SITE_KEY = "titan-core-builders";
export const CONSENT_VERSION = "2026-10";

/** Set PUBLIC_LEADS_URL to enable real Lead Gateway posts. Empty = mock submit. */
export function getLeadsEndpoint(): string {
  return import.meta.env.PUBLIC_LEADS_URL?.trim() || "";
}
