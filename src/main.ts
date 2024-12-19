import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Coolmate Clone API')
    .setDescription('Danh sách API về web coolmate')
    .setVersion('1.0')
    .addTag('Roles')
    .addTag('Auth')
    .addTag('Users')
    .addTag('Categories')
    .addTag('Sub-categories')
    .addTag('Collections')
    .addTag('Products')
    .addTag('Carts')
    .addTag('Addresses')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  app.use(
    session({
      secret: 'kjhkjasdfhquiewrykjadsfhsdakj',
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 60000,
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.enableCors({
    origin: ['http://localhost:5173'],
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization', // Các header được phép
    credentials: true, // Nếu cần gửi cookie
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
