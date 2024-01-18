import { ForbiddenException, Injectable, ExecutionContext , CanActivate, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from 'prisma/prisma.service';
import { SettingsService } from 'src/settings/settings.service';
import { loginStatus } from '../auth.enum';

@Injectable()
export class FT_GUARD extends AuthGuard('42') {
  async canActivate(context: ExecutionContext)
  {
	  try {
      const activate = (await super.canActivate(context)) as boolean;
	  	const request = context.switchToHttp().getRequest();
	  	await super.logIn(request);
	  	return activate;
	  } catch (error) {
			const res = context.switchToHttp().getResponse();
			res.redirect(`http://${process.env.NEXT_PUBLIC_HOST}:3000/auth`);
	  }
  }
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
	  try {
    	const req = context.switchToHttp().getRequest();
			//just got added
			if (!req.isAuthenticated())
				throw loginStatus.NotLogged;
    	return req.isAuthenticated();
	  } catch (error) {
			if (error === loginStatus.NotLogged)
				throw new ForbiddenException({message: loginStatus.NotLogged});
			//this one will get taking down later
			throw new HttpException('invalid token',HttpStatus.BAD_REQUEST);
	  }
  }
}

@Injectable()
export class first_timeGuard implements CanActivate{
	constructor(private prisma: PrismaService, private qr: SettingsService) {}

	async canActivate(context: ExecutionContext): Promise<boolean>
	{
		const req = context.switchToHttp().getRequest();
		const res = context.switchToHttp().getResponse();
		if (!req.isAuthenticated()) {
			return req.isAuthenticated();
		}
			
		const user = await this.prisma.user.findUnique({
			where: {
				id: req.user.id
			},
			select: {
				first_time: true,
				fac_auth: true,
				full_name: true,
				nickName: true
			}
		})
		const profile = await this.prisma.profile.findUnique({
			where: {
				userID: req.user.id
			},
			select: {
				photo_path: true
			}
		});
		if (user.first_time) {
			res.redirect(`http://${process.env.NEXT_PUBLIC_HOST}:3000/auth/goodlogin`);
			return false;
		}
		if (user.fac_auth) // 2fa
		{
			const user = req.session.passport.user;
			if (!user.code)
			{
				// redirect to 2fa page
				res.redirect(`http://${process.env.NEXT_PUBLIC_HOST}:3000/auth/twofactor`);
				return false;
			}
		}
		return req.isAuthenticated();
	}
}
