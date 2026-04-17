const { EventEmitter } = require('events');

const mockGet = jest.fn();

jest.mock('https', () => ({
  get: (...args) => mockGet(...args)
}));

const mockTunnelClusterInstance = {
  once: jest.fn(),
  on: jest.fn(),
  open: jest.fn()
};

jest.mock('../tunnel-cluster', () =>
  jest.fn().mockImplementation(() => mockTunnelClusterInstance)
);

const Tunnel = require('../tunnel');

const openTunnel = tunnel =>
  new Promise((resolve, reject) => {
    tunnel.open(error => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

const mockSuccessfulGet = (body = {}) => {
  mockGet.mockImplementation((uri, callback) => {
    const request = new EventEmitter();
    const response = new EventEmitter();

    response.statusCode = 200;
    response.setEncoding = jest.fn();

    process.nextTick(() => {
      callback(response);
      response.emit('data', JSON.stringify(body));
      response.emit('end');
    });

    return request;
  });
};

describe('local-tunnel client tunnel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('open() – bootstrap failures', () => {
    it('propagates bootstrap request errors to the caller', async () => {
      mockGet.mockImplementation(() => {
        const request = new EventEmitter();

        process.nextTick(() => {
          request.emit('error', new Error('network down'));
        });

        return request;
      });

      const tunnel = new Tunnel({ port: 8080, subdomain: 'my-domain' });

      await expect(openTunnel(tunnel)).rejects.toThrow('network down');
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

      await expect(openTunnel(tunnel)).rejects.toThrow('temporary unavailable');
    });

    it('uses default error message when server returns non-200 with non-JSON body', async () => {
      mockGet.mockImplementation((uri, callback) => {
        const request = new EventEmitter();
        const response = new EventEmitter();

        response.statusCode = 500;
        response.setEncoding = jest.fn();

        process.nextTick(() => {
          callback(response);
          response.emit('data', 'Internal Server Error');
          response.emit('end');
        });

        return request;
      });

      const tunnel = new Tunnel({ port: 8080 });

      await expect(openTunnel(tunnel)).rejects.toThrow(
        'localtunnel server returned an error, please try again'
      );
    });

    it('propagates JSON parse error when response body is invalid JSON', async () => {
      mockGet.mockImplementation((uri, callback) => {
        const request = new EventEmitter();
        const response = new EventEmitter();

        response.statusCode = 200;
        response.setEncoding = jest.fn();

        process.nextTick(() => {
          callback(response);
          response.emit('data', '{invalid json}');
          response.emit('end');
        });

        return request;
      });

      const tunnel = new Tunnel({ port: 8080 });

      await expect(openTunnel(tunnel)).rejects.toThrow();
    });
  });

  describe('open() – successful bootstrap', () => {
    it('resolves without error and assigns clientId and url from server response', async () => {
      mockSuccessfulGet({
        id: 'test-id',
        url: 'https://test-id.loca.lt',
        ip: '1.2.3.4',
        port: 4000,
        max_conn_count: 2
      });

      const tunnel = new Tunnel({ port: 8080, subdomain: 'test-id' });

      await expect(openTunnel(tunnel)).resolves.toBeUndefined();
      expect(tunnel.clientId).toBe('test-id');
      expect(tunnel.url).toBe('https://test-id.loca.lt');
    });

    it('assigns cachedUrl when server returns cached_url', async () => {
      mockSuccessfulGet({
        id: 'cached-id',
        url: 'https://cached-id.loca.lt',
        cached_url: 'https://cached.loca.lt',
        ip: '1.2.3.4',
        port: 4000,
        max_conn_count: 1
      });

      const tunnel = new Tunnel({ port: 8080 });

      await openTunnel(tunnel);

      expect(tunnel.cachedUrl).toBe('https://cached.loca.lt');
    });

    it('opens max_conn_count connections via TunnelCluster', async () => {
      mockSuccessfulGet({
        id: 'conn-id',
        url: 'https://conn-id.loca.lt',
        ip: '1.2.3.4',
        port: 4000,
        max_conn_count: 3
      });

      const tunnel = new Tunnel({ port: 8080 });

      await openTunnel(tunnel);

      expect(mockTunnelClusterInstance.open).toHaveBeenCalledTimes(3);
    });

    it('uses ?new when no subdomain is provided', async () => {
      mockSuccessfulGet({
        id: 'random-id',
        url: 'https://random-id.loca.lt',
        ip: '1.2.3.4',
        port: 4000,
        max_conn_count: 1
      });

      const tunnel = new Tunnel({ port: 8080 });

      await openTunnel(tunnel);

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('?new'),
        expect.any(Function)
      );
    });
  });

  describe('close()', () => {
    it('sets closed flag and emits close event', async () => {
      mockSuccessfulGet({
        id: 'close-test',
        url: 'https://close-test.loca.lt',
        ip: '1.2.3.4',
        port: 4000,
        max_conn_count: 1
      });

      const tunnel = new Tunnel({ port: 8080 });
      const closeSpy = jest.fn();

      tunnel.on('close', closeSpy);
      await openTunnel(tunnel);
      tunnel.close();

      expect(tunnel.closed).toBe(true);
      expect(closeSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getInfo()', () => {
    it('maps server response fields to internal info object', () => {
      const tunnel = new Tunnel({
        port: 8080,
        host: 'https://localtunnel.me',
        local_host: '127.0.0.1',
        local_https: false
      });

      const info = tunnel.getInfo({
        id: 'info-id',
        ip: '5.6.7.8',
        port: 9999,
        url: 'https://info-id.loca.lt',
        cached_url: 'https://cached.loca.lt',
        max_conn_count: 5
      });

      expect(info).toMatchObject({
        name: 'info-id',
        url: 'https://info-id.loca.lt',
        cached_url: 'https://cached.loca.lt',
        max_conn: 5,
        remote_host: 'localtunnel.me',
        remote_ip: '5.6.7.8',
        remote_port: 9999,
        local_port: 8080,
        local_host: '127.0.0.1'
      });
    });

    it('defaults max_conn to 1 when max_conn_count is absent', () => {
      const tunnel = new Tunnel({ port: 8080 });
      const info = tunnel.getInfo({
        id: 'x',
        ip: '1.1.1.1',
        port: 1234,
        url: 'https://x.loca.lt'
      });

      expect(info.max_conn).toBe(1);
    });
  });
});
