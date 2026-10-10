import type { HTTP_METHOD } from '../constants/http.constant.js';

export type HttpMethod = (typeof HTTP_METHOD)[keyof typeof HTTP_METHOD];
