/* eslint-disable global-require */
describe('manual-trade.js', () => {
  let mockWebSocketServer;
  let mockWebSocketServerWebSocketSend;

  let loggerMock;

  let mockSaveOverrideAction;
  let mockExecute;

  beforeEach(() => {
    jest.clearAllMocks().resetModules();

    mockWebSocketServerWebSocketSend = jest.fn().mockResolvedValue(true);

    mockWebSocketServer = {
      send: mockWebSocketServerWebSocketSend
    };

    mockSaveOverrideAction = jest.fn().mockResolvedValue(true);

    jest.mock('../../../../cronjob/trailingTradeHelper/common', () => ({
      saveOverrideAction: mockSaveOverrideAction
    }));

    mockExecute = jest.fn((funcLogger, symbol, jobPayload) => {
      if (!funcLogger || !symbol || !jobPayload) return false;
      return jobPayload.preprocessFn();
    });

    jest.mock('../../../../cronjob/trailingTradeHelper/queue', () => ({
      execute: mockExecute
    }));
  });

  beforeEach(async () => {
    const { logger } = require('../../../../helpers');

    loggerMock = logger;
    loggerMock.fields = { correlationId: 'correlationId' };

    const { handleManualTrade } = require('../manual-trade');
    await handleManualTrade(loggerMock, mockWebSocketServer, {
      data: {
        symbol: 'BTCUSDT',
        botId: 'bot-1',
        exchangeAccountId: 'acc-1',
        idempotencyKey: 'idem-1',
        order: {
          some: 'value'
        }
      }
    });
  });

  it('triggers saveOverrideAction', () => {
    expect(mockSaveOverrideAction).toHaveBeenCalledWith(
      loggerMock,
      'BTCUSDT',
      {
        action: 'manual-trade',
        order: {
          some: 'value'
        },
        actionAt: expect.any(String),
        triggeredBy: 'user'
      },
      'The manual order received by the bot. Wait for placing the order.'
    );
  });

  it('triggers queue.execute', () => {
    expect(mockExecute).toHaveBeenCalledWith(loggerMock, 'BTCUSDT', {
      correlationId: 'correlationId',
      requestContext: {
        botId: 'bot-1',
        exchangeAccountId: 'acc-1',
        correlationId: 'correlationId',
        idempotencyKey: 'idem-1'
      },
      preprocessFn: expect.any(Function),
      processFn: expect.any(Function)
    });
  });

  it('triggers ws.send', () => {
    expect(mockWebSocketServerWebSocketSend).toHaveBeenCalledWith(
      JSON.stringify({
        result: true,
        type: 'manual-trade-result',
        message: 'The order has been received.'
      })
    );
  });

  describe('when exchangeAccountId is missing', () => {
    beforeEach(async () => {
      jest.clearAllMocks();

      const { handleManualTrade } = require('../manual-trade');
      await handleManualTrade(loggerMock, mockWebSocketServer, {
        data: {
          symbol: 'BTCUSDT',
          order: {
            some: 'value'
          }
        }
      });
    });

    it('does not trigger saveOverrideAction', () => {
      expect(mockSaveOverrideAction).not.toHaveBeenCalled();
    });

    it('does not trigger queue.execute', () => {
      expect(mockExecute).not.toHaveBeenCalled();
    });

    it('returns validation error', () => {
      expect(mockWebSocketServerWebSocketSend).toHaveBeenCalledWith(
        JSON.stringify({
          result: false,
          type: 'manual-trade-result',
          message: 'exchangeAccountId is required to place a manual order.'
        })
      );
    });
  });
});
