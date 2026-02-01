import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadContractConfig } from './config/contractLoader';

async function bootstrap() {

  try {
    const config = await loadContractConfig();
    console.log('📝 Contract configuration loaded successfully');
    console.log(`   Address: ${config.contractAddress}`);
    console.log(`   RPC URL: ${config.blockchainRpcUrl}`);
  } catch (error) {
    console.error('❌ Failed to load contract configuration:', error);
    console.log('   Continuing with environment variables...');
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
}

bootstrap();
