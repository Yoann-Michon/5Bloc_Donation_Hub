import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // CORS configuration
    app.enableCors({
        origin: configService.get('CORS_ORIGIN') || 'http://localhost:5173',
        credentials: true,
    });

    // API prefix
    app.setGlobalPrefix(configService.get('API_PREFIX') || 'api/v1');

    // Swagger documentation
    const config = new DocumentBuilder()
        .setTitle('Community Donation Hub API')
        .setDescription('Backend API for Community Donation Hub DApp')
        .setVersion('1.0')
        .addTag('projects', 'Project management endpoints')
        .addTag('donations', 'Donation tracking endpoints')
        .addTag('tokens', 'NFT badge endpoints')
        .addTag('users', 'User profile endpoints')
        .addTag('stats', 'Statistics endpoints')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = configService.get('PORT') || 3000;
    await app.listen(port);

    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
