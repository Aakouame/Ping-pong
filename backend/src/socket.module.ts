import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';

@Module({
  providers: [AppGateway],
  exports: [AppGateway], // Export the provider to be used in other modules
})
export class AppGatewayModule {}

