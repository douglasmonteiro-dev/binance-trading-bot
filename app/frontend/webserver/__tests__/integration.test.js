/* eslint-disable global-require */
/**
 * Integration tests for the webserver HTTP handlers.
 * Uses a real Express app + supertest — no listen() call.
 */

const express = require('express');
const supertest = require('supertest');

// ---------- mutable mock references (re-assigned by jest.mock factories) ----------

let mockGetGlobalConfiguration;
let mockVerifyAuthenticated;
let mockCacheGet;
let mockLoginLimiter;

// ---------- module mocks ----------

jest.mock('config', () => ({
  get: jest.fn(key => {
    switch (key) {
      case 'authentication.password':
        return 'secret';
      default:
        return null;
    }
  })
}));

jest.mock('request-ip', () => ({
  getClientIp: jest.fn().mockReturnValue('127.0.0.1')
}));

jest.mock('../../../helpers', () => {
  mockCacheGet = jest.fn().mockResolvedValue(null);

  return {
    cache: {
      get: (...args) => mockCacheGet(...args),
      set: jest.fn().mockResolvedValue(true),
      hgetall: jest.fn().mockResolvedValue({}),
      hdel: jest.fn().mockResolvedValue(true)
    },
    mongo: {
      findOne: jest.fn().mockResolvedValue(null),
      upsertOne: jest.fn().mockResolvedValue(true),
      find: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0)
    },
    PubSub: { publish: jest.fn() },
    slack: { sendMessage: jest.fn() },
    logger: {
      child: jest.fn().mockReturnThis(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    }
  };
});

jest.mock('../../../cronjob/trailingTradeHelper/common', () => {
  mockVerifyAuthenticated = jest.fn().mockResolvedValue(false);
  return { verifyAuthenticated: (...args) => mockVerifyAuthenticated(...args) };
});

jest.mock('../../../cronjob/trailingTradeHelper/configuration', () => {
  mockGetGlobalConfiguration = jest.fn().mockResolvedValue({
    botOptions: { authentication: { lockAfter: 120 } }
  });
  return {
    getGlobalConfiguration: (...args) => mockGetGlobalConfiguration(...args)
  };
});

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ authenticatedAt: new Date() })
}));

// ---------- singleton test app (built once for all suites) ----------

let app;

beforeAll(async () => {
  mockLoginLimiter = {
    consume: jest.fn().mockResolvedValue(true),
    delete: jest.fn().mockResolvedValue(true),
    get: jest.fn().mockResolvedValue({ remainingPoints: 5 })
  };

  const logger = {
    child: jest.fn().mockReturnThis(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };

  app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Require handlers first — triggers the jest.mock factory for helpers,
  // which reassigns mockCacheGet to a fresh jest.fn().mockResolvedValue(null).
  const { setHandlers } = require('../handlers');

  // Now that the factory has run, reassign mockCacheGet to the intended
  // implementation. The `cache.get` closure will pick up the new reference.
  mockCacheGet = jest.fn().mockImplementation(key => {
    if (key === 'auth-jwt-secret') return Promise.resolve('test-secret');
    return Promise.resolve(null);
  });

  await setHandlers(logger, app, { loginLimiter: mockLoginLimiter });
});

// ---------- test suites ----------

describe('GET /status', () => {
  it('returns 200 with correct payload', async () => {
    const res = await supertest(app).get('/status');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      status: 200,
      message: 'OK',
      data: {}
    });
  });
});

describe('GET /nonexistent (404 handler)', () => {
  it('returns 404 JSON payload', async () => {
    const res = await supertest(app).get('/this-does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      status: 404,
      message: 'Route not found.'
    });
  });
});

describe('POST /auth', () => {
  describe('when password is incorrect', () => {
    it('returns success:false', async () => {
      const res = await supertest(app)
        .post('/auth')
        .send({ password: 'wrong' });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ success: false });
    });
  });

  describe('when password is correct', () => {
    it('returns success:true with token', async () => {
      const res = await supertest(app)
        .post('/auth')
        .send({ password: 'secret' });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ success: true });
    });
  });
});

describe('DELETE /symbol/:symbol', () => {
  it('returns 403 when verifyAuthenticated returns false', async () => {
    mockVerifyAuthenticated.mockResolvedValue(false);
    const res = await supertest(app)
      .delete('/symbol/BTCUSDT')
      .send({ authToken: 'bad-token' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: false, status: 403 });
  });
});

describe('POST /grid-trade-archive-get', () => {
  it('returns 403 when not authenticated', async () => {
    mockVerifyAuthenticated.mockResolvedValue(false);
    const res = await supertest(app)
      .post('/grid-trade-archive-get')
      .send({ authToken: 'bad' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: false, status: 403 });
  });
});
