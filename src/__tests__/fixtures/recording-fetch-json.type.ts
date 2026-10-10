import type { FetchJson } from '../../types/fetch-json.type.js';
import type { FetchJsonOptions } from '../../types/fetch-json-options.type.js';

export interface RecordingFetchJson {
  calls: Array<[string, FetchJsonOptions]>;
  fetchJson: FetchJson;
}
