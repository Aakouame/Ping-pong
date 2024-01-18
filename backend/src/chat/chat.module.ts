import {Module} from '@nestjs/common'
import { chatGateway } from './chat.gateway';
import { chatService } from './chat.service';
import { ChatController } from './chat.controller';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { AppGatewayModule } from 'src/socket.module';


@Module({
	imports:[AppGatewayModule],
	controllers:[ChatController],
	providers:[chatGateway,chatService,CloudinaryService]
})
export class ChatModule{}

