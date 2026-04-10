const axios = require('axios');
const config = require('config');
const { v4: uuidv4 } = require('uuid');

const { client } = require('./binance');
const logger = require('./logger');

const getProvider = () => config.get('financial.provider');

const getCoreBaseUrl = () => config.get('financial.core.url');

const getCoreTimeout = () => config.get('financial.core.timeout');

const getCoreMaxRetries = () => config.get('financial.core.maxRetries');

const getCoreRetryDelay = () => config.get('financial.core.retryDelay');

const getCoreHeaders = () => {
  const apiKey = config.get('financial.core.apiKey');

  return {
    'x-bot-source': 'binance-trading-bot',
    ...(apiKey
      ? {
          Authorization: `Bearer ${apiKey}`
        }
      : {})
  };
};

const getContextHeaders = context => ({
  ...(context.tenantId ? { 'x-tenant-id': context.tenantId } : {}),
  ...(context.userId ? { 'x-user-id': context.userId } : {}),
  ...(context.botId ? { 'x-bot-id': context.botId } : {}),
  ...(context.exchangeAccountId
    ? { 'x-exchange-account-id': context.exchangeAccountId }
    : {})
});

const buildRequestMetadata = request => ({
  correlationId: request.context?.correlationId || uuidv4(),
  ...(request.writeOperation === true
    ? {
        idempotencyKey:
          request.context?.idempotencyKey ||
          request.context?.correlationId ||
          uuidv4()
      }
    : {})
});

const getMetadataHeaders = metadata => ({
  'x-correlation-id': metadata.correlationId,
  ...(metadata.idempotencyKey
    ? { 'x-idempotency-key': metadata.idempotencyKey }
    : {})
});

const validateRemoteWriteContext = request => {
  if (request.writeOperation !== true) {
    return;
  }

  if (request.context?.exchangeAccountId) {
    return;
  }

  const validationError = new Error(
    `Financial Core write request requires exchangeAccountId for ${request.method.toUpperCase()} ${
      request.path
    }`
  );

  validationError.name = 'FinancialContextError';
  validationError.path = request.path;
  validationError.method = request.method;
  validationError.context = request.context || {};

  throw validationError;
};

const sleep = async delay =>
  new Promise(resolve => {
    setTimeout(resolve, delay);
  });

const normaliseFinancialCoreError = (error, request) => {
  const wrappedError = new Error(
    `Financial Core request failed for ${request.method.toUpperCase()} ${
      request.path
    }`
  );

  wrappedError.name = 'FinancialCoreRequestError';
  wrappedError.status = error.response?.status;
  wrappedError.code = error.code;
  wrappedError.data = error.response?.data;
  wrappedError.path = request.path;
  wrappedError.method = request.method;
  wrappedError.retriable =
    error.code === 'ECONNABORTED' ||
    error.code === 'ENOTFOUND' ||
    error.code === 'ECONNRESET' ||
    error.code === 'ETIMEDOUT' ||
    error.response?.status === 429 ||
    error.response?.status >= 500;
  wrappedError.cause = error;

  return wrappedError;
};

const shouldRetryRequest = (error, request, attempt) => {
  if (request.retryable !== true) {
    return false;
  }

  if (attempt >= getCoreMaxRetries()) {
    return false;
  }

  return error.retriable === true;
};

const buildAxiosRequest = request => {
  validateRemoteWriteContext(request);

  const metadata = buildRequestMetadata(request);

  return {
    metadata,
    method: request.method,
    url: `${getCoreBaseUrl()}${request.path}`,
    timeout: getCoreTimeout(),
    headers: {
      ...getCoreHeaders(),
      ...getContextHeaders(request.context || {}),
      ...getMetadataHeaders(metadata)
    },
    ...(request.data ? { data: request.data } : {}),
    ...(request.params ? { params: request.params } : {})
  };
};

const callFinancialCore = async request => {
  const axiosRequest = buildAxiosRequest(request);

  const executeRequest = async attempt => {
    try {
      const response = await axios(axiosRequest);

      return response.data;
    } catch (error) {
      const wrappedError = normaliseFinancialCoreError(error, request);

      if (shouldRetryRequest(wrappedError, request, attempt)) {
        const retryAttempt = attempt + 1;

        logger.warn(
          {
            tag: 'financial-core-request-retry',
            path: request.path,
            method: request.method,
            retryAttempt,
            maxRetries: getCoreMaxRetries(),
            status: wrappedError.status,
            code: wrappedError.code,
            retriable: wrappedError.retriable,
            correlationId: axiosRequest.metadata.correlationId,
            idempotencyKey: axiosRequest.metadata.idempotencyKey
          },
          'Retrying Financial Core request.'
        );

        await sleep(getCoreRetryDelay());
        return executeRequest(retryAttempt);
      }

      logger.error(
        {
          tag: 'financial-core-request-failed',
          path: request.path,
          method: request.method,
          status: wrappedError.status,
          code: wrappedError.code,
          retriable: wrappedError.retriable,
          data: wrappedError.data,
          correlationId: axiosRequest.metadata.correlationId,
          idempotencyKey: axiosRequest.metadata.idempotencyKey,
          context: request.context || {}
        },
        'Financial Core request failed.'
      );

      throw wrappedError;
    }
  };

  return executeRequest(0);
};

const localClient = {
  placeOrder: async orderParams => client.order(orderParams),
  cancelOrder: async orderParams => client.cancelOrder(orderParams),
  getAccountInfo: async () => client.accountInfo(),
  getOpenOrders: async orderParams => client.openOrders(orderParams)
};

const remoteClient = {
  placeOrder: async (orderParams, context = {}) =>
    callFinancialCore({
      method: 'post',
      path: '/internal/financial/orders',
      data: orderParams,
      context,
      writeOperation: true,
      retryable: false
    }),
  cancelOrder: async (orderParams, context = {}) =>
    callFinancialCore({
      method: 'post',
      path: '/internal/financial/orders/cancel',
      data: orderParams,
      context,
      writeOperation: true,
      retryable: false
    }),
  getAccountInfo: async (params, context = {}) =>
    callFinancialCore({
      method: 'get',
      path: '/internal/financial/account',
      params,
      context,
      retryable: true
    }),
  getOpenOrders: async (params, context = {}) =>
    callFinancialCore({
      method: 'get',
      path: '/internal/financial/orders/open',
      params,
      context,
      retryable: true
    })
};

const getClient = () =>
  getProvider() === 'financial-core' ? remoteClient : localClient;

const placeOrder = async (orderParams, context = {}) =>
  getClient().placeOrder(orderParams, context);

const cancelOrder = async (orderParams, context = {}) =>
  getClient().cancelOrder(orderParams, context);

const getAccountInfo = async (params, context = {}) =>
  getClient().getAccountInfo(params, context);

const getOpenOrders = async (params, context = {}) =>
  getClient().getOpenOrders(params, context);

module.exports = {
  placeOrder,
  cancelOrder,
  getAccountInfo,
  getOpenOrders
};
