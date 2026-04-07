const HeaderHostTransformer = require('../header-host-transformer');

const collectStream = async transformer => {
  const chunks = [];

  return new Promise((resolve, reject) => {
    transformer.on('data', chunk => chunks.push(chunk));
    transformer.on('error', reject);
    transformer.on('end', () => resolve(Buffer.concat(chunks)));
  });
};

describe('header-host-transformer', () => {
  it('rewrites only the Host header and preserves a binary body in the same chunk', async () => {
    const transformer = new HeaderHostTransformer({ host: 'new-host.local' });
    const outputPromise = collectStream(transformer);
    const binaryBody = Buffer.from([0xff, 0x00, 0x41, 0x42]);
    const request = Buffer.concat([
      Buffer.from(
        'POST / HTTP/1.1\r\nHost: old-host.local\r\nContent-Length: 4\r\n\r\n',
        'latin1'
      ),
      binaryBody
    ]);

    transformer.end(request);

    const output = await outputPromise;
    const headerEndIndex = output.indexOf('\r\n\r\n');
    const headers = output.subarray(0, headerEndIndex + 4).toString('latin1');
    const body = output.subarray(headerEndIndex + 4);

    expect(headers).toContain('Host: new-host.local');
    expect(headers).not.toContain('Host: old-host.local');
    expect(body.equals(binaryBody)).toBe(true);
  });

  it('buffers partial headers until the request header block is complete', async () => {
    const transformer = new HeaderHostTransformer({ host: 'split-host.local' });
    const outputPromise = collectStream(transformer);

    transformer.write(
      Buffer.from('GET / HTTP/1.1\r\nHost: old-host.local\r\n')
    );
    transformer.end(Buffer.from('User-Agent: Jest\r\n\r\nbody', 'latin1'));

    const output = await outputPromise;
    const headerEndIndex = output.indexOf('\r\n\r\n');
    const headers = output.subarray(0, headerEndIndex + 4).toString('latin1');
    const body = output.subarray(headerEndIndex + 4).toString('latin1');

    expect(headers).toContain('Host: split-host.local');
    expect(body).toBe('body');
  });
});
