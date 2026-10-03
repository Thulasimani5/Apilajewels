const validateEnv = () => {
  const requiredVars = ['JWT_SECRET'];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    if (process.env.NODE_ENV === 'production' || process.env.STRICT_ENV === 'true') {
      console.error(`FATAL: Missing mandatory environment variables: ${missing.join(', ')}`);
      process.exit(1);
    } else {
      console.warn(`WARNING: Missing environment variables: ${missing.join(', ')}. Setting default fallback for development.`);
      if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'apila_dev_jwt_secret_key_2026';
    }
  }
};

module.exports = validateEnv;
