/* eslint-disable global-require */
describe('webserver/handlers/auth', () => {
  let config;
  let jwt;

  let cacheMock;
  let PubSubMock;
  let loggerMock;
  let slackMock;

  let mockRequestIpGetClientIp;

  let mockLoginLimiterDelete;
  let mockLoginLimiterConsume;
  let mockLoginLimiter;

  let resSendMock;

  const appMock = {
    route: null
  };

  let postReq;

  let mockGetGlobalConfiguration;

  beforeEach(async () => {
    jest.clearAllMocks().resetModules();

    config = require('config');
    jwt = require('jsonwebtoken');

    jest.mock('config');
    jest.mock('jsonwebtoken');

    jwt.sign = jest.fn().mockResolvedValue('authToken');

    resSendMock = jest.fn().mockResolvedValue(true);
    appMock.route = jest.fn(() => ({
      post: jest.fn().mockImplementation(func => {
        func(postReq, { send: resSendMock });
      })
    }));
    config.get = jest.fn(key => {
      switch (key) {
        case 'authentication.password':
          return '123456';
        default:
      }
      return null;
    });

    mockGetGlobalConfiguration = jest.fn().mockResolvedValue({
      botOptions: {
        authentication: {
          lockAfter: 120
        }
      }
    });

    mockRequestIpGetClientIp = jest.fn().mockReturnValue('127.0.0.1');
    jest.mock('request-ip', () => ({
      getClientIp: mockRequestIpGetClientIp
    }));

    mockLoginLimiterDelete = jest.fn().mockResolvedValue(true);
    mockLoginLimiterConsume = jest.fn().mockResolvedValue(true);
    mockLoginLimiter = {
      consume: mockLoginLimiterConsume,
      delete: mockLoginLimiterDelete
    };

    jest.mock('../../../../cronjob/trailingTradeHelper/configuration', () => ({
      getGlobalConfiguration: mockGetGlobalConfiguration
    }));
  });

  describe('when verification failed', () => {
    [
      {
        password: null
      },
      {
        password: undefined
      },
      {
        password: ''
      },
      {
        password: 'not-valid'
      },
      {
        password: 456789
      }
    ].forEach(t => {
      describe(`password: ${t.password}`, () => {
        beforeEach(async () => {
          const { logger, PubSub, cache, slack } = require('../../../../helpers');

          loggerMock = logger;

          PubSubMock = PubSub;
          PubSubMock.publish = jest.fn().mockResolvedValue(true);

          slackMock = slack;
          slackMock.sendMessage = jest.fn().mockResolvedValue(true);

          cacheMock = cache;
          cacheMock.get = jest.fn().mockResolvedValue('uuid');

          postReq = {
            body: {
              password: t.password
            }
          };
          const { handleAuth } = require('../auth');
          await handleAuth(loggerMock, appMock, {
            loginLimiter: mockLoginLimiter
          });
        });

        it('triggers PubSub.publish', () => {
          expect(PubSubMock.publish).toHaveBeenCalledWith(
            'frontend-notification',
            {
              type: 'error',
              title: 'Sorry, please enter correct password.'
            }
          );
        });

        it('triggers loginLimiter.consume', () => {
          expect(mockLoginLimiterConsume).toHaveBeenCalledWith('127.0.0.1');
        });

        it('does not trigger loginLimiter.delete', () => {
          expect(mockLoginLimiterDelete).not.toHaveBeenCalled();
        });

        it('return unauthorised', () => {
          expect(resSendMock).toHaveBeenCalledWith({
            success: false,
            status: 401,
            message: 'Unauthorized',
            data: {
              authToken: ''
            }
          });
        });

        it('does not include entered password in slack message', () => {
          const sentMessage = slackMock.sendMessage.mock.calls[0][0];

          expect(sentMessage).not.toContain('Entered password');
        });

        it('does not log entered password', () => {
          expect(loggerMock.info).toHaveBeenCalledWith(
            {
              inputProvided: !!t.password,
              success: false,
              clientIp: '127.0.0.1'
            },
            'handle authentication'
          );
        });
      });
    });
  });

  describe('when verification succeed', () => {
    beforeEach(async () => {
      const { logger, PubSub, cache, slack } = require('../../../../helpers');

      loggerMock = logger;

      PubSubMock = PubSub;
      PubSubMock.publish = jest.fn().mockResolvedValue(true);

      slackMock = slack;
      slackMock.sendMessage = jest.fn().mockResolvedValue(true);

      cacheMock = cache;
      cacheMock.get = jest.fn().mockResolvedValue('uuid');

      postReq = {
        body: {
          password: '123456'
        }
      };
      const { handleAuth } = require('../auth');
      await handleAuth(loggerMock, appMock, { loginLimiter: mockLoginLimiter });
    });

    it('triggers PubSub.publish', () => {
      expect(PubSubMock.publish).toHaveBeenCalledWith('frontend-notification', {
        type: 'success',
        title: 'You are authenticated.'
      });
    });

    it('does not trigger loginLimiter.consume', () => {
      expect(mockLoginLimiterConsume).not.toHaveBeenCalled();
    });

    it('triggers loginLimiter.delete', () => {
      expect(mockLoginLimiterDelete).toHaveBeenCalledWith('127.0.0.1');
    });

    it('return unauthorised', () => {
      expect(resSendMock).toHaveBeenCalledWith({
        success: true,
        status: 200,
        message: 'Authorized',
        data: {
          authToken: 'authToken'
        }
      });
    });

    it('logs whether password was provided', () => {
      expect(loggerMock.info).toHaveBeenCalledWith(
        {
          inputProvided: true,
          success: true,
          clientIp: '127.0.0.1'
        },
        'handle authentication'
      );
    });
  });

  describe('password hash caching', () => {
    it('hashes configured password once for multiple requests', async () => {
      const mockHashSync = jest.fn().mockReturnValue('hashed-password');
      const mockCompareSync = jest
        .fn()
        .mockImplementation((requestedPassword, hashedPassword) => {
          return requestedPassword === '123456' && hashedPassword === 'hashed-password';
        });

      jest.mock('bcryptjs', () => ({
        hashSync: mockHashSync,
        compareSync: mockCompareSync
      }));

      const { logger, PubSub, cache, slack } = require('../../../../helpers');

      loggerMock = logger;
      PubSubMock = PubSub;
      PubSubMock.publish = jest.fn().mockResolvedValue(true);
      cacheMock = cache;
      cacheMock.get = jest.fn().mockResolvedValue('uuid');
      slackMock = slack;
      slackMock.sendMessage = jest.fn().mockResolvedValue(true);

      postReq = {
        body: {
          password: '123456'
        }
      };

      const { handleAuth } = require('../auth');
      await handleAuth(loggerMock, appMock, {
        loginLimiter: mockLoginLimiter
      });

      postReq = {
        body: {
          password: '123456'
        }
      };

      await handleAuth(loggerMock, appMock, {
        loginLimiter: mockLoginLimiter
      });

      expect(mockHashSync).toHaveBeenCalledTimes(1);
      expect(mockCompareSync).toHaveBeenCalledTimes(2);
    });
  });
});
