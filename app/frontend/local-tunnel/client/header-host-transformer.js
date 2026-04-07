/* eslint-disable no-underscore-dangle */
const { Transform } = require('stream');

class HeaderHostTransformer extends Transform {
  constructor(options = {}) {
    super(options);
    this.host = options.host || 'localhost';
    this.headersProcessed = false;
    this.bufferedChunks = [];
  }

  _transform(chunk, encoding, callback) {
    if (this.headersProcessed) {
      callback(null, chunk);
      return;
    }

    const nextChunk = Buffer.isBuffer(chunk)
      ? chunk
      : Buffer.from(chunk, encoding);

    this.bufferedChunks.push(nextChunk);

    const bufferedRequest = Buffer.concat(this.bufferedChunks);
    const headerDelimiterIndex = bufferedRequest.indexOf('\r\n\r\n');

    if (headerDelimiterIndex === -1) {
      callback();
      return;
    }

    const headerEndIndex = headerDelimiterIndex + 4;
    const headerBuffer = bufferedRequest.subarray(0, headerEndIndex);
    const bodyBuffer = bufferedRequest.subarray(headerEndIndex);

    const transformedHeaders = headerBuffer
      .toString('latin1')
      .replace(
        /(\r\n[Hh]ost:\s*)[^\r\n]+/,
        (match, hostPrefix) => hostPrefix + this.host
      );

    this.headersProcessed = true;
    this.bufferedChunks = [];

    const transformedHeaderBuffer = Buffer.from(transformedHeaders, 'latin1');
    const transformedChunk = bodyBuffer.length
      ? Buffer.concat([transformedHeaderBuffer, bodyBuffer])
      : transformedHeaderBuffer;

    callback(null, transformedChunk);
  }

  _flush(callback) {
    if (this.headersProcessed || this.bufferedChunks.length === 0) {
      callback();
      return;
    }

    const bufferedRequest = Buffer.concat(this.bufferedChunks);
    this.bufferedChunks = [];
    callback(null, bufferedRequest);
  }
}

module.exports = HeaderHostTransformer;
