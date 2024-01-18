import { Controller, Post, Headers, Get, Put, Delete, Body, UseGuards, Req, Session } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthenticatedGuard } from '../auth/guards';
import { SettingsDto } from './dto';

//upload
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';



import * as speakeasy from "speakeasy";
import * as qrcode from 'qrcode';


@Controller('settings')
@UseGuards(AuthenticatedGuard)

export class SettingsController {
  
  constructor(private SettingsService: SettingsService) {
    
  }

  @Get()
  getSettings(@Req() req: any) {
   
    return this.SettingsService.getSettingsData(req.user.id);
  }

 
  @Put('update_image')
  @UseInterceptors(FileInterceptor('file'))
  changeImageSettings(@UploadedFile() file: Express.Multer.File, @Req() req: any): Promise<{}>{
   
    return this.SettingsService.changeSettingsImage(file, req.user.id);
  }
  
  
  @Put('update_data')
  changeSettings(@Req() req: any, @Body() data: SettingsDto, @Session() session: any): any {
    
    if (!JSON.stringify(data) || JSON.stringify(data) === '{}')
      return data;
    return this.SettingsService.changeSettingsData(req.user.id, data, session);
  }

  @Delete('delete_image')
  deleteImage(@Req() req: any): Promise<any> {
    return this.SettingsService.deleteImageData(req.user.id);
  }

  @Delete()
  deleteAccount(@Req() req: any): Promise<any> {
    return this.SettingsService.deleteAccountData(req.user.id);
  }
}
