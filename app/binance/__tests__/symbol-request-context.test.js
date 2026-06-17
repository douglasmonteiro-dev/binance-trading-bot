const { getSymbolRequestContext } = require('../symbol-request-context');

describe('symbol-request-context.js', () => {
  it('retains all non-empty values', () => {
    expect(
      getSymbolRequestContext(
        {
          tenantId: 'tenant-123',
          userId: 'user-123',
          botId: 'bot-123',
          exchangeAccountId: 'exchange-account-123'
        },
        'corr-123'
      )
    ).toStrictEqual({
      tenantId: 'tenant-123',
      userId: 'user-123',
      botId: 'bot-123',
      exchangeAccountId: 'exchange-account-123',
      correlationId: 'corr-123'
    });
  });

  it('filters null, undefined and empty string values', () => {
    expect(
      getSymbolRequestContext(
        {
          tenantId: 'tenant-123',
          userId: null,
          botId: undefined,
          exchangeAccountId: ''
        },
        'corr-123'
      )
    ).toStrictEqual({
      tenantId: 'tenant-123',
      correlationId: 'corr-123'
    });
  });
});