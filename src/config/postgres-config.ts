import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function initPostgresConfig(
  entities: EntityClassOrSchema[],
): TypeOrmModuleOptions {
  const conf: TypeOrmModuleOptions = {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database:
      process.env.NODE_ENV === 'test'
        ? process.env.POSTGRES_DATABASE_TEST
        : process.env.POSTGRES_DATABASE,
    entities: entities,
    synchronize: true,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  };

  return conf;
}
