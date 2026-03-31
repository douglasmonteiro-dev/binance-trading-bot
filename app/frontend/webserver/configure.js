const { v4: uuidv4 } = require('uuid');

const { cache, mongo } = require('../../helpers');

const { setHandlers } = require('./handlers');

const configureJWTToken = async funcLogger => {
  let jwtSecret = await cache.get('auth-jwt-secret');

  if (jwtSecret === null) {
    // Try to restore from persistent storage before generating a new secret.
    // This ensures sessions survive a Redis restart.
    const persistedSecret = await mongo.findOne(
      funcLogger,
      'trailing-trade-bot-configuration',
      { key: 'jwt-secret' }
    );

    if (persistedSecret && persistedSecret.value) {
      jwtSecret = persistedSecret.value;
    } else {
      jwtSecret = uuidv4();
      await mongo.upsertOne(
        funcLogger,
        'trailing-trade-bot-configuration',
        { key: 'jwt-secret' },
        { key: 'jwt-secret', value: jwtSecret }
      );
    }

    await cache.set('auth-jwt-secret', jwtSecret);
  }

  return jwtSecret;
};

const configureWebServer = async (app, funcLogger, { loginLimiter }) => {
  const logger = funcLogger.child({ server: 'webserver' });

  // Firstly get(or set) JWT secret
  await configureJWTToken(logger);

  await setHandlers(logger, app, { loginLimiter });
};

module.exports = { configureWebServer };
