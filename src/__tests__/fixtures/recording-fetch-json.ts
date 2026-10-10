import type { FetchJson } from '../../types/fetch-json.type.js';
import type { RecordingFetchJson } from './recording-fetch-json.type.js';

export function recordingFetchJson(reply: unknown): RecordingFetchJson {
  const calls: RecordingFetchJson['calls'] = [];
  const fetchJson: FetchJson = async (url, options) => {
    calls.push([url, options]);
    if (reply instanceof Error) throw reply;
    return reply;
  };
  return { calls, fetchJson };
}
