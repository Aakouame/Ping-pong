import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FT_Strategy } from './strategy';
import { SessionSerializer } from './utils/Serializer';
import { SettingsModule } from 'src/settings/settings.module';
import { AppGateway } from 'src/app.gateway';

@Module({
  imports: [SettingsModule],
  controllers: [AuthController],
  providers: [AuthService, FT_Strategy, SessionSerializer, AppGateway]
})
export class AuthModule {}
