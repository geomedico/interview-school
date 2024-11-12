import { NestFactory } from '@nestjs/core';
import * as commandLineArgs from 'command-line-args';
import * as commandLineUsage from 'command-line-usage';

import { AppModule } from '../../app.module';
import { SeederService } from './seeder.service';

const optionDefinitions = [
  { name: 'limit', alias: 'l', type: Number, defaultValue: 10 },
  { name: 'help', alias: 'h', type: Boolean },
];

const usage = commandLineUsage([
  {
    header: 'Seeder',
    content: 'Seeds the database with test data.',
  },
  {
    header: 'Options',
    optionList: [
      {
        name: 'limit',
        typeLabel: '{underline number}',
        description: 'Limit the number of records to seed.',
      },
      {
        name: 'help',
        description: 'Display this usage guide.',
      },
    ],
  },
]);

async function bootstrap() {
  const options = commandLineArgs(optionDefinitions);

  if (options.help) {
    console.log(usage);
    return;
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  const seederService = app.get(SeederService);

  await seederService.seed();

  await app.close();
}

bootstrap();
