const https = require('https');
const { URL } = require('url');
const { EventEmitter } = require('events');

const TunnelCluster = require('./tunnel-cluster');

const requestTunnelInfo = uri =>
  new Promise((resolve, reject) => {
    const request = https.get(uri, response => {
      let body = '';

      response.setEncoding('utf8');
      response.on('data', chunk => {
        body += chunk;
      });

      response.on('end', () => {
        if (response.statusCode !== 200) {
          let message =
            'localtunnel server returned an error, please try again';

          try {
            const parsedBody = JSON.parse(body);
            if (parsedBody && parsedBody.message) {
              message = parsedBody.message;
            }
          } catch (error) {
            // Ignore invalid JSON and use the default message.
          }

          reject(new Error(message));
          return;
        }

        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });

    request.on('error', reject);
  });

class Tunnel extends EventEmitter {
  constructor(options = {}) {
    super(options);
    this.options = { ...options };
    this.closed = false;

    if (!this.options.host) {
      this.options.host = 'https://localtunnel.me';
    }
  }

  getInfo(body) {
    const {
      id,
      ip,
      port,
      url,
      cached_url: cachedUrl,
      max_conn_count: maxConn
    } = body;
    const parsedHost = new URL(this.options.host);

    return {
      name: id,
      url,
      cached_url: cachedUrl,
      max_conn: maxConn || 1,
      remote_host: parsedHost.hostname,
      remote_ip: ip,
      remote_port: port,
      local_port: this.options.port,
      local_host: this.options.local_host,
      local_https: this.options.local_https,
      local_cert: this.options.local_cert,
      local_key: this.options.local_key,
      local_ca: this.options.local_ca,
      allow_invalid_cert: this.options.allow_invalid_cert
    };
  }

  init(callback) {
    const assignedDomain = this.options.subdomain;
    const uri = `${this.options.host}/${assignedDomain || '?new'}`;

    requestTunnelInfo(uri)
      .then(body => {
        callback(null, this.getInfo(body));
      })
      .catch(error => {
        callback(error);
      });
  }

  establishConnection(info) {
    this.setMaxListeners(
      info.max_conn + (EventEmitter.defaultMaxListeners || 10)
    );

    this.tunnelCluster = new TunnelCluster(info);

    this.tunnelCluster.once('open', () => {
      this.emit('url', info.url);
    });

    this.tunnelCluster.on('error', error => {
      this.emit('error', error);
    });

    this.tunnelCluster.on('open', tunnel => {
      const closeHandler = () => {
        tunnel.destroy();
      };

      if (this.closed) {
        closeHandler();
        return;
      }

      this.once('close', closeHandler);
      tunnel.once('close', () => {
        this.removeListener('close', closeHandler);
      });
    });

    this.tunnelCluster.on('dead', () => {
      if (this.closed) {
        return;
      }

      this.tunnelCluster.open();
    });

    this.tunnelCluster.on('request', request => {
      this.emit('request', request);
    });

    for (
      let connectionIndex = 0;
      connectionIndex < info.max_conn;
      connectionIndex += 1
    ) {
      this.tunnelCluster.open();
    }
  }

  open(callback) {
    this.init((error, info) => {
      if (error) {
        callback(error);
        return;
      }

      this.clientId = info.name;
      this.url = info.url;

      if (info.cached_url) {
        this.cachedUrl = info.cached_url;
      }

      this.establishConnection(info);
      callback();
    });
  }

  close() {
    this.closed = true;
    this.emit('close');
  }
}

module.exports = Tunnel;
