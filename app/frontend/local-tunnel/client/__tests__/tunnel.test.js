const { EventEmitter } = require('events');

const mockGet = jest.fn();

jest.mock('https', () => ({
  get: (...args) => mockGet(...args)
}));

jest.mock('../tunnel-cluster', () =>
  jest.fn().mockImplementation(() => ({
    once: jest.fn(),
    on: jest.fn(),
    open: jest.fn()
  }))
);

const Tunnel = require('../tunnel');

describe('local-tunnel client tunnel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('propagates bootstrap request errors to the caller', async () => {
    mockGet.mockImplementation(() => {
      const request = new EventEmitter();

      process.nextTick(() => {
        request.emit('error', new Error('network down'));
      });

      return request;
    });

    const tunnel = new Tunnel({ port: 8080, subdomain: 'my-domain' });

    await expect(
      new Promise((resolve, reject) => {
        tunnel.open(error => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      })
    ).rejects.toThrow('network down');
  });

  it('propagates non-200 bootstrap responses to the caller', async () => {
    mockGet.mockImplementation((uri, callback) => {
      const request = new EventEmitter();
      const response = new EventEmitter();

      response.statusCode = 503;
      response.setEncoding = jest.fn();

      process.nextTick(() => {
        callback(response);
        response.emit(
          'data',
          JSON.stringify({ message: 'temporary unavailable' })
        );
        response.emit('end');
      });

      return request;
    });

    const tunnel = new Tunnel({ port: 8080, subdomain: 'my-domain' });

    await expect(
      new Promise((resolve, reject) => {
        tunnel.open(error => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      })
    ).rejects.toThrow('temporary unavailable');
  });
});
