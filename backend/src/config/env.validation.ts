export function validateEnv(): void {
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 64) {
    throw new Error(
      'JWT_SECRET must be at least 64 characters long for production security. ' +
      'Generate a secure secret using: openssl rand -base64 64'
    );
  }
}
