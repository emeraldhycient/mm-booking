import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { ERROR_CODE } from '../../constants/error.constant.js';
import { ApiError } from '../api-error.js';
import { handleError } from '../error-handler.js';

function appThrowing(error: unknown): express.Express {
  const app = express();
  app.post('/boom', express.json(), function throwIt() {
    throw error;
  });
  app.use(handleError);
  return app;
}

describe('the error handler', () => {
  it('sends an ApiError as its status with code, message and fields', async () => {
    const fields = [{ field: 'receiver_phone', message: 'Enter a Rwandan mobile number.' }];
    const app = appThrowing(new ApiError(ERROR_CODE.VALIDATION_FAILED, { fields }));

    const response = await request(app).post('/boom');

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      ok: false,
      error: { code: 'VALIDATION_FAILED', message: 'Some fields are missing or invalid.', fields },
    });
  });

  it('hides an unexpected error behind a generic 500 and logs it', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const app = appThrowing(new Error('database password is hunter2'));

    const response = await request(app).post('/boom');

    expect(response.status).toBe(500);
    expect(response.body.error).toEqual({ code: 'INTERNAL', message: 'Something went wrong on our side.' });
    expect(log).toHaveBeenCalledOnce();
  });

  it('turns a JSON parse failure into 400 INVALID_JSON', async () => {
    const app = appThrowing(new ApiError(ERROR_CODE.INTERNAL));

    const response = await request(app).post('/boom').set('content-type', 'application/json').send('{bad');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_JSON');
  });
});
