/* eslint-disable global-require */

describe('webserver/configure.js', () => {
  let mockSetHandlers;

  let mockLoginLimiter;

  let cacheMock;
  let mongoMock;
  let loggerMock;

  beforeEach(() => {
    jest.clearAllMocks().resetModules();

    mockSetHandlers = jest.fn().mockResolvedValue(true);

    mockLoginLimiter = jest.fn().mockReturnValue(true);

    jest.mock('../handlers', () => ({
      setHandlers: mockSetHandlers
    }));
  });

  describe('when jwt token is not cached', () => {
    describe('and token is not persisted', () => {
      beforeEach(async () => {
        const { logger, cache, mongo } = require('../../../helpers');

        loggerMock = logger;
        cacheMock = cache;
        mongoMock = mongo;
        cacheMock.get = jest.fn().mockReturnValue(null);
        cacheMock.set = jest.fn().mockReturnValue(true);
        mongoMock.findOne = jest.fn().mockResolvedValue(null);
        mongoMock.upsertOne = jest.fn().mockResolvedValue(true);

        const { configureWebServer } = require('../configure');
        await configureWebServer('app', loggerMock, {
          loginLimiter: mockLoginLimiter
        });
      });

      it('triggers cache.get', () => {
        expect(cacheMock.get).toHaveBeenCalledWith('auth-jwt-secret');
      });

      it('triggers mongo.findOne', () => {
        expect(mongoMock.findOne).toHaveBeenCalledWith(
          loggerMock,
          'trailing-trade-bot-configuration',
          { key: 'jwt-secret' }
        );
      });

      it('triggers mongo.upsertOne', () => {
        expect(mongoMock.upsertOne).toHaveBeenCalledWith(
          loggerMock,
          'trailing-trade-bot-configuration',
          { key: 'jwt-secret' },
          {
            key: 'jwt-secret',
            value: expect.any(String)
          }
        );
      });

      it('triggers cache.set', () => {
        expect(cacheMock.set).toHaveBeenCalledWith(
          'auth-jwt-secret',
          expect.any(String)
        );
      });

      it(`triggers setHandlers`, () => {
        expect(mockSetHandlers).toHaveBeenCalledWith(loggerMock, 'app', {
          loginLimiter: mockLoginLimiter
        });
      });
    });

    describe('and token is persisted', () => {
      beforeEach(async () => {
        const { logger, cache, mongo } = require('../../../helpers');

        loggerMock = logger;
        cacheMock = cache;
        mongoMock = mongo;
        cacheMock.get = jest.fn().mockReturnValue(null);
        cacheMock.set = jest.fn().mockReturnValue(true);
        mongoMock.findOne = jest.fn().mockResolvedValue({
          key: 'jwt-secret',
          value: 'persisted-jwt-secret'
        });
        mongoMock.upsertOne = jest.fn().mockResolvedValue(true);

        const { configureWebServer } = require('../configure');
        await configureWebServer('app', loggerMock, {
          loginLimiter: mockLoginLimiter
        });
      });

      it('triggers mongo.findOne', () => {
        expect(mongoMock.findOne).toHaveBeenCalledWith(
          loggerMock,
          'trailing-trade-bot-configuration',
          { key: 'jwt-secret' }
        );
      });

      it('does not trigger mongo.upsertOne', () => {
        expect(mongoMock.upsertOne).not.toHaveBeenCalled();
      });

      it('triggers cache.set with persisted secret', () => {
        expect(cacheMock.set).toHaveBeenCalledWith(
          'auth-jwt-secret',
          'persisted-jwt-secret'
        );
      });
    });

    describe('and token query returns undefined', () => {
      beforeEach(async () => {
        const { logger, cache, mongo } = require('../../../helpers');

        loggerMock = logger;
        cacheMock = cache;
        mongoMock = mongo;
        cacheMock.get = jest.fn().mockReturnValue(null);
        cacheMock.set = jest.fn().mockReturnValue(true);
        mongoMock.findOne = jest.fn().mockResolvedValue(undefined);
        mongoMock.upsertOne = jest.fn().mockResolvedValue(true);

        const { configureWebServer } = require('../configure');
        await configureWebServer('app', loggerMock, {
          loginLimiter: mockLoginLimiter
        });
      });

      it('triggers mongo.upsertOne', () => {
        expect(mongoMock.upsertOne).toHaveBeenCalledWith(
          loggerMock,
          'trailing-trade-bot-configuration',
          { key: 'jwt-secret' },
          {
            key: 'jwt-secret',
            value: expect.any(String)
          }
        );
      });

      it('triggers cache.set with generated token', () => {
        expect(cacheMock.set).toHaveBeenCalledWith(
          'auth-jwt-secret',
          expect.any(String)
        );
      });
    });
  });

  describe('when jwt token is cached', () => {
    beforeEach(async () => {
      const { logger, cache, mongo } = require('../../../helpers');

      loggerMock = logger;
      cacheMock = cache;
      mongoMock = mongo;
      cacheMock.get = jest.fn().mockReturnValue('uuid');
      cacheMock.set = jest.fn().mockReturnValue(true);
      mongoMock.findOne = jest.fn().mockResolvedValue(null);
      mongoMock.upsertOne = jest.fn().mockResolvedValue(true);

      const { configureWebServer } = require('../configure');
      await configureWebServer('app', loggerMock, {
        loginLimiter: mockLoginLimiter
      });
    });

    it('triggers cache.get', () => {
      expect(cacheMock.get).toHaveBeenCalledWith('auth-jwt-secret');
    });

    it('does not trigger cache.set', () => {
      expect(cacheMock.set).not.toHaveBeenCalled();
    });

    it('does not trigger mongo.findOne', () => {
      expect(mongoMock.findOne).not.toHaveBeenCalled();
    });

    it('does not trigger mongo.upsertOne', () => {
      expect(mongoMock.upsertOne).not.toHaveBeenCalled();
    });
  });
});
