import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB.host'),
        port: configService.get('DB.port'),
        username: configService.get('DB.username'),
        password: configService.get('DB.password'),
        database: configService.get('DB.database'),
        migrationsTableName: 'migration',
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        entities: [__dirname + '/pg-models/*.entity{.ts,.js}'],
        synchronize: true,
        logging: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DbPgModule {}
