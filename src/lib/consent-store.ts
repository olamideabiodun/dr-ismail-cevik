/**
 * External store for the results-gallery consent flag.
 *
 * sessionStorage is exactly the kind of external system `useSyncExternalStore`
 * exists for. Reading it in an effect and calling setState would be a cascading
 * render (and React's set-state-in-effect rule rejects it); reading it in a lazy
 * useState initialiser would break SSR, because the server has no such storage.
 *
 * `getServerSnapshot` returns false so the server always renders the gallery
 * gated. If the visitor has already consented this session, the client swaps to
 * the real value on hydration.
 *
 * sessionStorage rather than localStorage is deliberate: consent to view
 * clinical before/after imagery should last the visit and no longer.
 */

const CONSENT_KEY = "results-consent";

type Listener = () => void;

const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeToConsent(listener: Listener): () => void {
  listeners.add(listener);
  // Keeps duplicate tabs of the gallery in agreement.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function getConsentSnapshot(): boolean {
  try {
    return sessionStorage.getItem(CONSENT_KEY) === "true";
  } catch {
    // Private browsing modes can throw on storage access; stay gated.
    return false;
  }
}

export function getConsentServerSnapshot(): boolean {
  return false;
}

export function setConsent(next: boolean): void {
  try {
    if (next) sessionStorage.setItem(CONSENT_KEY, "true");
    else sessionStorage.removeItem(CONSENT_KEY);
  } catch {
    // Non-fatal: the in-memory notification below still updates this tab.
  }
  emit();
}
