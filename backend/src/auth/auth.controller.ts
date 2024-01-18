import { Body, Controller, ForbiddenException, Get, Put, Post, Req, Res, Session, UseGuards, ConflictException } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedGuard, FT_GUARD } from './guards';
import { AuthService } from './auth.service';
import { _2fa, signup } from 'src/utils/types';
import { resolve } from 'path';
import { SettingsService } from 'src/settings/settings.service';
import { loginStatus } from './auth.enum';
import { AppGateway } from 'src/app.gateway';
import { PrismaService } from 'prisma/prisma.service';


@Controller('auth')
export class AuthController {
	constructor(private auth: AuthService, private settingService: SettingsService,private server: AppGateway,private db: PrismaService) {}

	// first path to log to intra  it redirect to 42 api
	@UseGuards(FT_GUARD)
	@Get('login')
	login() {
		//'login');
	  return ;
	}

	// 42 api redirect to this page and this page send a cookie
	@UseGuards(FT_GUARD)
	@Get('redirect')
	async redirect(@Req() req: any, @Session() session: any, @Res() res: any) {
		const checkFirstTime = await this.auth.checkFirstTime(req.user.id);
		const twoFacCheck = await this.auth.check2fa(req.user.id);
		const user = session.passport.user;
		if (checkFirstTime) {
			res.redirect(`http://${process.env.NEXT_PUBLIC_HOST}:3000/auth/goodlogin`);
			return ;
		}
			//throw new ForbiddenException({message: loginStatus.FirstTime});
		if (twoFacCheck && !user.hasOwnProperty('code')) {
			res.redirect(`http://${process.env.NEXT_PUBLIC_HOST}:3000/auth/twofactor`);
			return ;
		}
			//throw new ForbiddenException({message: loginStatus.TwoFactor});
		res.redirect(`http://${process.env.NEXT_PUBLIC_HOST}:3000/profile`);
		return ;
		//return {message: 'Good'};
	}

	//get data that needed in goodlogin
	@UseGuards(AuthenticatedGuard)
	@Get('goodlogin')
	getLoginData(@Req() req: any) {
		return this.auth.getLoginData(req.user.id);
	}

	@UseGuards(AuthenticatedGuard)
	@Get('checkUserStatus')
	async checkUserStatus(@Req() req: any, @Session() session: any) {
		//this code is going to guard
			//throw new ForbiddenException({message: loginStatus.FirstTime});
		//'checkuser');
		const checkFirstTime = await this.auth.checkFirstTime(req.user.id);
		const twoFacCheck = await this.auth.check2fa(req.user.id);
		const user = session.passport.user;
		if (checkFirstTime)
			throw new ForbiddenException({message: loginStatus.FirstTime});
		if (twoFacCheck && !user.hasOwnProperty('code'))
			throw new ForbiddenException({message: loginStatus.TwoFactor});
		return {message: 'Good'};
	}

	@UseGuards(AuthenticatedGuard)
	@Get('getUserStatus')
	async getUserStatus(@Req() req: any, @Session() session: any) {
		//this will get taken down and putting in guard
		const checkFirstTime = await this.auth.checkFirstTime(req.user.id);
		const twoFacCheck = await this.auth.check2fa(req.user.id);
		const user = session.passport.user;
		if (checkFirstTime)
			throw new ForbiddenException({message: loginStatus.FirstTime});
		//if (twoFacCheck)
		//	throw new ForbiddenException({message: loginStatus.TwoFactor});
		if (twoFacCheck && !user.hasOwnProperty('code'))
			throw new ForbiddenException({message: loginStatus.TwoFactor});
		////
		return this.auth.getUserStatus(req.user.id);
	}


	// this route get user info for the first time	
	//@Get('signup')
	//async signup(@Req() req: any, @Res() res: Response) {
	//@Get('signup')
	//async signup(@Req() req: any, @Body() body: signup, @Res() res: any) {
	//signup(@Req() req: any, @Body() body: signup, @Res() res: any) {
	//signup() {
	@UseGuards(AuthenticatedGuard)
	@Put('signup')
	async signup(@Req() req: any, @Body() body: signup) {
		//'cool');
		////return 'hey';
		//res.status(200).send('hey');
		//'cool ll');
		//return ;
		//here login of the guard
		//throw new ForbiddenException({message: loginStatus.NotLogged});

		//let redirectUrl = "http://${process.env.NEXT_PUBLIC_HOST}:3000/profile";
		//const twoFacCheck = await this.auth.check2fa(req.user.id);
		//here the user is logged and it's not his first time to log
		//await `hey fstTime ${checkFirstTime} facChk = ${twoFacCheck}`);
		
		const checkFirstTime = await this.auth.checkFirstTime(req.user.id);
			//this one should throw 403 to change to some page
		if (!checkFirstTime) {
			return {message: 'Good'};
		}
		if (!body || !body.full_name ||!body.nickname )
			return {error : "Body is wrong"};
	  return this.auth.signup(req.user, body);
	}

	
	@Get('logout')
	@UseGuards(AuthenticatedGuard)
	async logout(@Req() req: Request) {
		const id = req.session.id;
		req.session.destroy((err : any) => {
			if (err)
			{
				throw err;
			}
			resolve();
		});
		this.server.server.emit('stats');
		try {
			const user = await this.db.user.update({
				where:{
					id
				},
				data:{
					is_active: "offline"	
				}
			})
		} catch (error) {
			return {logout: "error"};
		}
	  return {logout: "seccussfuly"};
	}

	@UseGuards(AuthenticatedGuard)
	@Post('2fa')
	async _2fa(@Req() req: any, @Body() body: _2fa, @Session() session: any) {
		const checkFirstTime = await this.auth.checkFirstTime(req.user.id);
		const twoFacCheck = await this.auth.check2fa(req.user.id);
		const user = session.passport.user;
		if (checkFirstTime)
			throw new ForbiddenException({message: loginStatus.FirstTime});
		if (!twoFacCheck || (twoFacCheck && user.hasOwnProperty('code'))) {
			return {message: 'Good'};

		}
		
		const verify = await this.settingService.checkIfQrCodeIsRight(user.id, body.code);
		if (!verify)
			throw new ConflictException({message: "CodeNotValid"});
		session.passport.user['code'] = body.code;
		return {message: 'Good'};
	}
}
