/* eslint-disable global-require */
describe('server', () => {
  let mockMongo;
  let mockMongoConnect;
  let mockRunErrorHandler;
  let mockRunBinance;
  let mockRunCronJob;
  let mockRunFrontend;

  let mockLoggerChild;

  beforeEach(async () => {
    jest.clearAllMocks().resetModules();

    mockMongoConnect = jest.fn().mockResolvedValue(true);
    mockMongo = {
      connect: mockMongoConnect
    };

    mockRunErrorHandler = jest.fn().mockResolvedValue(true);
    mockRunBinance = jest.fn().mockResolvedValue(true);
    mockRunCronJob = jest.fn().mockResolvedValue(true);
    mockRunFrontend = jest.fn().mockResolvedValue(true);

    mockLoggerChild = jest.fn().mockResolvedValue({ child: 'logger' });
    jest.mock('../helpers', () => ({
      logger: { me: 'logger', child: mockLoggerChild },
      mongo: mockMongo
    }));

    jest.mock('../server-binance', () => ({ runBinance: mockRunBinance }));
    jest.mock('../server-cronjob', () => ({ runCronjob: mockRunCronJob }));
    jest.mock('../server-frontend', () => ({ runFrontend: mockRunFrontend }));
    jest.mock('../error-handler', () => ({
      runErrorHandler: mockRunErrorHandler
    }));

    require('../server');
  });

  it('triggers runErrorHandler', () => {
    expect(mockRunErrorHandler).toHaveBeenCalled();
  });

  it('triggers mongo.connect', () => {
    expect(mockMongoConnect).toHaveBeenCalled();
  });

  it('triggers runBinance', () => {
    expect(mockRunBinance).toHaveBeenCalled();
  });

  it('triggers runCronjob', () => {
    expect(mockRunCronJob).toHaveBeenCalled();
  });

  it('triggers runFrontend', () => {
    expect(mockRunFrontend).toHaveBeenCalled();
  });

  it('logs an error when a service fails to start', async () => {
    jest.resetModules();

    const serviceError = new Error('service down');
    const loggerErrorMock = jest.fn();

    const loggerMock = { error: loggerErrorMock };
    loggerMock.child = jest.fn().mockReturnValue(loggerMock);

    const failingRunBinance = jest.fn().mockRejectedValue(serviceError);
    const successfulRunCronjob = jest.fn().mockResolvedValue(true);
    const successfulRunFrontend = jest.fn().mockResolvedValue(true);

    jest.doMock('../helpers', () => ({
      logger: loggerMock,
      mongo: { connect: jest.fn().mockResolvedValue(true) }
    }));

    jest.doMock('../server-binance', () => ({ runBinance: failingRunBinance }));
    jest.doMock('../server-cronjob', () => ({
      runCronjob: successfulRunCronjob
    }));
    jest.doMock('../server-frontend', () => ({
      runFrontend: successfulRunFrontend
    }));
    jest.doMock('../error-handler', () => ({
      runErrorHandler: jest.fn().mockResolvedValue(true)
    }));

    require('../server');

    await new Promise(resolve => { setImmediate(resolve); });

    expect(loggerErrorMock).toHaveBeenCalledWith(
      { err: serviceError, serviceName: 'binance' },
      'binance failed to start'
    );
  });
});
