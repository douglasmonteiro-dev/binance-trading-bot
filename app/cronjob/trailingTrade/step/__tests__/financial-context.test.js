const { getFinancialContext } = require('../financial-context');

describe('financial-context.js', () => {
  it('returns top-level financial context when provided', () => {
    expect(
      getFinancialContext({
        tenantId: 'tenant-1',
        userId: 'user-1',
        botId: 'bot-1',
        exchangeAccountId: 'acc-1',
        correlationId: 'corr-1',
        idempotencyKey: 'idem-1',
        symbolConfiguration: {
          tenantId: 'tenant-2',
          exchangeAccountId: 'acc-2'
        }
      })
    ).toStrictEqual({
      tenantId: 'tenant-1',
      userId: 'user-1',
      botId: 'bot-1',
      exchangeAccountId: 'acc-1',
      correlationId: 'corr-1',
      idempotencyKey: 'idem-1'
    });
  });

  it('falls back to symbol configuration financial context', () => {
    expect(
      getFinancialContext({
        correlationId: 'corr-1',
        symbolConfiguration: {
          tenantId: 'tenant-1',
          userId: 'user-1',
          botId: 'bot-1',
          exchangeAccountId: 'acc-1'
        }
      })
    ).toStrictEqual({
      tenantId: 'tenant-1',
      userId: 'user-1',
      botId: 'bot-1',
      exchangeAccountId: 'acc-1',
      correlationId: 'corr-1'
    });
  });

  it('omits empty values from both sources', () => {
    expect(
      getFinancialContext({
        tenantId: '',
        symbolConfiguration: {
          exchangeAccountId: null,
          botId: 'bot-1'
        }
      })
    ).toStrictEqual({
      botId: 'bot-1'
    });
  });
});
