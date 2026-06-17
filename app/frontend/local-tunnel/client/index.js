const Tunnel = require('./tunnel');

module.exports = function localTunnel(arg1, arg2, arg3) {
  const options = typeof arg1 === 'object' ? arg1 : { ...arg2, port: arg1 };
  const callback = typeof arg1 === 'object' ? arg2 : arg3;
  const client = new Tunnel(options);

  if (callback) {
    client.open(error => (error ? callback(error) : callback(null, client)));
    return client;
  }

  return new Promise((resolve, reject) => {
    client.open(error => (error ? reject(error) : resolve(client)));
  });
};
