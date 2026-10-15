// Identifies an apartment + flat, ignoring case, spaces and punctuation ("A-204" matches "a 204").
// Used as the openFlats/{key} document ID; firestore.rules computes the same key (flatKeyOf).
export function flatKey(apartment, flatNumber) {
  const clean = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${clean(apartment)}_${clean(flatNumber)}`;
}
