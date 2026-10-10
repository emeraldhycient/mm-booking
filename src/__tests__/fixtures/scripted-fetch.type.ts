export interface ScriptedFetch {
  calls: Array<[string, RequestInit]>;
  fetchImpl: typeof fetch;
}
