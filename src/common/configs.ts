import { registerAs } from '@nestjs/config';

export enum ConfigKey {
  App = 'APP',
  Db = 'DB',
}

export enum Environment {
  Local = 'local',
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
  Testing = 'testing',
}

const APPConfig = registerAs(ConfigKey.App, () => ({
  env:
    Environment[process.env.NODE_ENV as keyof typeof Environment] ||
    Environment.Development,
  port: Number(process.env.APP_PORT) || 3000,
  seeds: process.env.RUN_SEED || true,
  appName: process.env.APP_NAME || 'school-backend',
}));

const host =
  process.env.NODE_ENV === Environment.Development
    ? '0.0.0.0'
    : process.env.DATABASE_HOST;
const DBConfig = registerAs(ConfigKey.Db, () => ({
  host,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
}));

export const configurations = [APPConfig, DBConfig];
