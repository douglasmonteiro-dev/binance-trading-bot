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
  describe('Host header rewriting', () => {
    it('rewrites only the Host header and preserves a binary body in the same chunk', async () => {
      const transformer = new HeaderHostTransformer({
        host: 'new-host.local'
      });
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

    it('rewrites a case-insensitive HOST header', async () => {
      const transformer = new HeaderHostTransformer({ host: 'target.local' });
      const outputPromise = collectStream(transformer);

      transformer.end(
        Buffer.from('GET / HTTP/1.1\r\nHOST: original.local\r\n\r\n', 'latin1')
      );

      const output = await outputPromise;
      const headers = output.toString('latin1');

      expect(headers).toContain('HOST: target.local');
      expect(headers).not.toContain('original.local');
    });

    it('defaults the host to localhost when no host option is given', async () => {
      const transformer = new HeaderHostTransformer();
      const outputPromise = collectStream(transformer);

      transformer.end(
        Buffer.from('GET / HTTP/1.1\r\nHost: old.local\r\n\r\n', 'latin1')
      );

      const output = await outputPromise;

      expect(output.toString('latin1')).toContain('Host: localhost');
    });
  });

  describe('chunked / split input', () => {
    it('buffers partial headers until the request header block is complete', async () => {
      const transformer = new HeaderHostTransformer({
        host: 'split-host.local'
      });
      const outputPromise = collectStream(transformer);

      transformer.write(
        Buffer.from('GET / HTTP/1.1\r\nHost: old-host.local\r\n')
      );
      transformer.end(Buffer.from('User-Agent: Jest\r\n\r\nbody', 'latin1'));

      const output = await outputPromise;
      const headerEndIndex = output.indexOf('\r\n\r\n');
      const headers = output
        .subarray(0, headerEndIndex + 4)
        .toString('latin1');
      const body = output.subarray(headerEndIndex + 4).toString('latin1');

      expect(headers).toContain('Host: split-host.local');
      expect(body).toBe('body');
    });

    it('passes body-only chunks through unchanged after headers are processed', async () => {
      const transformer = new HeaderHostTransformer({ host: 'h.local' });
      const outputPromise = collectStream(transformer);
      const bodyPart1 = Buffer.from([0x01, 0x02]);
      const bodyPart2 = Buffer.from([0x03, 0x04]);

      transformer.write(
        Buffer.from('GET / HTTP/1.1\r\nHost: old\r\n\r\n', 'latin1')
      );
      transformer.write(bodyPart1);
      transformer.end(bodyPart2);

      const output = await outputPromise;
      const headerEndIndex = output.indexOf('\r\n\r\n');
      const body = output.subarray(headerEndIndex + 4);

      expect(body.equals(Buffer.concat([bodyPart1, bodyPart2]))).toBe(true);
    });
  });

  describe('_flush – incomplete header block', () => {
    it('flushes buffered data as-is when no header delimiter arrives', async () => {
      const transformer = new HeaderHostTransformer({ host: 'x.local' });
      const outputPromise = collectStream(transformer);
      const raw = Buffer.from('GET / HTTP/1.1\r\nHost: old', 'latin1');

      transformer.end(raw);

      const output = await outputPromise;

      expect(output.equals(raw)).toBe(true);
    });

    it('emits nothing on flush when buffer is empty and headers already processed', async () => {
      const transformer = new HeaderHostTransformer({ host: 'y.local' });
      const outputPromise = collectStream(transformer);

      transformer.end(
        Buffer.from('GET / HTTP/1.1\r\nHost: old\r\n\r\n', 'latin1')
      );

      const output = await outputPromise;

      expect(output.toString('latin1')).toContain('Host: y.local');
    });
  });
});
