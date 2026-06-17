const fs = require('fs');
const net = require('net');
const tls = require('tls');
const { EventEmitter } = require('events');

const HeaderHostTransformer = require('./header-host-transformer');

class TunnelCluster extends EventEmitter {
  constructor(options = {}) {
    super(options);
    this.options = options;
  }

  open() {
    const remoteHostOrIp = this.options.remote_ip || this.options.remote_host;
    const remotePort = this.options.remote_port;
    const localHost = this.options.local_host || 'localhost';
    const localPort = this.options.local_port;
    const allowInvalidCert = this.options.allow_invalid_cert;

    const remote = net.connect({
      host: remoteHostOrIp,
      port: remotePort
    });

    remote.setKeepAlive(true);

    remote.on('error', error => {
      if (error.code === 'ECONNREFUSED') {
        this.emit(
          'error',
          new Error(
            `connection refused: ${remoteHostOrIp}:${remotePort} (check your firewall settings)`
          )
        );
      }

      remote.end();
    });

    const connectLocal = () => {
      if (remote.destroyed) {
        this.emit('dead');
        return;
      }

      remote.pause();

      const localConnectionOptions = allowInvalidCert
        ? { host: localHost, port: localPort, rejectUnauthorized: false }
        : {
            host: localHost,
            port: localPort,
            cert: this.options.local_cert
              ? fs.readFileSync(this.options.local_cert)
              : undefined,
            key: this.options.local_key
              ? fs.readFileSync(this.options.local_key)
              : undefined,
            ca: this.options.local_ca
              ? [fs.readFileSync(this.options.local_ca)]
              : undefined
          };

      const local = this.options.local_https
        ? tls.connect(localConnectionOptions)
        : net.connect({ host: localHost, port: localPort });

      const remoteCloseHandler = () => {
        this.emit('dead');
        local.end();
      };

      remote.once('close', remoteCloseHandler);

      local.once('error', error => {
        local.end();
        remote.removeListener('close', remoteCloseHandler);

        if (error.code !== 'ECONNREFUSED') {
          remote.end();
          return;
        }

        setTimeout(connectLocal, 1000);
      });

      local.once('connect', () => {
        remote.resume();

        let stream = remote;

        if (this.options.local_host) {
          stream = remote.pipe(
            new HeaderHostTransformer({ host: this.options.local_host })
          );
        }

        stream.pipe(local).pipe(remote);
      });
    };

    remote.on('data', chunk => {
      const match = chunk.toString().match(/^(\w+) (\S+)/);

      if (match) {
        this.emit('request', {
          method: match[1],
          path: match[2]
        });
      }
    });

    remote.once('connect', () => {
      this.emit('open', remote);
      connectLocal();
    });
  }
}

module.exports = TunnelCluster;
