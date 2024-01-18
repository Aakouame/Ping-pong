import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { AppGatewayModule } from 'src/socket.module';

@Module({
	imports:[AppGatewayModule],
	controllers: [GameController],
	providers: [GameService],
})
export class GameModule {}
