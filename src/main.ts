import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /*
   * Not working need more time for research 
    const config = new DocumentBuilder()
      .setTitle('Sections API')
      .setDescription('API documentation for managing sections')
      .setVersion('1.0')
      .addTag('Sections')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  */

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors) => {
        return new Error(
          errors
            .map(
              (err) =>
                `${err.property}: ${Object.values(err.constraints).join(', ')}`,
            )
            .join('; '),
        );
      },
    }),
  );

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
