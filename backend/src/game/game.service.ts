import { Injectable } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, OnGatewayConnection, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { AppGateway } from '../app.gateway';

//game
import { Ball } from './assets/Ball';
import { Paddle } from './assets/Paddle';

//cookies
import * as Cookies from 'cookie';
import * as cookiesParser from 'cookie-parser';

type PlayerData = Array<{socket: Socket, ball: Ball, paddle: Paddle, playerId: string, socketId: string, emit: boolean}>;

@Injectable()
@WebSocketGateway({
  cors: {
    origin: `http://${process.env.NEXT_PUBLIC_HOST}:3000`,
		credentials: true
  },
})
export class GameService implements OnGatewayConnection, OnGatewayDisconnect {
	private pendingPlayer: PlayerData;
	private gameRoom: Map<string, PlayerData>;

	constructor(private Gateway: AppGateway, private prisma: PrismaService) {
		this.pendingPlayer = new Array();
		this.gameRoom = new Map();
	}

	@WebSocketServer()
	ws: Server;


	async handleConnection(client: Socket, ...args: any[]) {
		const userId: string = await this.Gateway.getIdFromCookie(client);
		if (!userId)
			return ;


		this.gameRoom.forEach((value, key) => {
			if (key.search(userId) > 0) {

				const i: number = (value[0].playerId !== userId) ? 0 : 1;
				const j: number = (value[0].playerId === userId) ? 0 : 1;
	
				value[i].paddle.winTimes = 5;
				value[j].paddle.winTimes = 0;
				this.ws.to(client.id).emit("finishGame", client.id);

			}
		})
	}

	async handleDisconnect(client: Socket) {

		const userId: {key: string, value: Socket} = this.Gateway.findSocketMap(client.id);
		if (!userId)
			return ;

		for (let i: number = 0; i != this.pendingPlayer.length; i++) {
			if (this.pendingPlayer[i].socketId === client.id) {
				this.pendingPlayer.splice(i, 1);
				break ;
			}
		}

		this.gameRoom.forEach(async (value, key) => {
			if (key.search(userId.key) > 0) {
			
				const i: number = (value[0].playerId !== userId.key) ? 0 : 1;
				const j: number = (value[0].playerId === userId.key) ? 0 : 1;
				
				value[i].paddle.winTimes = 5;
				value[j].paddle.winTimes = 0;
				for (let i: number = 0; i != 2; i++) {
					//here if he was online
					//await this.switchPlayerStatus(thatRoomGame[i].playerId, "online");
					await this.switchPlayerStatus(value[i].playerId, "online");
					//thatRoomGame[i].socket.leave(room);
				}
				this.ws.to(value[i].socketId).emit("finishGame", value[i].socketId);

				
			}
		})
		
	}

	async getPlayerStatus(playerId: string): Promise<string> {
		try {
		const commingData = await this.prisma.user.findUnique({
			where: {
				id: playerId
			},
			select: {
				is_active: true
			}
		});
		return commingData.is_active;

		}
		catch (err) {
			return ;
		}
	}


	async getPlayerNickname(playerId: string) {
		try {
			const commingData = await this.prisma.user.findUnique({
				where: {
					id: playerId
				},
				select: {
					nickName: true
				}
			});
			return commingData.nickName;
		}
		catch (err) {
			return ;
		}
	}

	@SubscribeMessage('didNotAcceptInvite')
	didNotAcceptInvite(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
		const playerSocket: Socket = this.Gateway.socketUser.get(payload.playerId);
		this.ws.to(playerSocket.id).emit('cancelGameInvitation');
	}

	@SubscribeMessage('joinPlayerGameRoom')
	
	joinPlayerGameRoom(@ConnectedSocket() client: Socket,
		@MessageBody() payload: {playerNickname: string, playerId: string, opponentId: string}) {
		const playerSocket: Socket = this.Gateway.socketUser.get(payload.playerId);
		const opponentSocket: Socket = this.Gateway.socketUser.get(payload.opponentId);
		const roomName = this.generateNameGameRoom(payload.playerId, payload.opponentId);
		
		playerSocket.join(roomName);
		opponentSocket.join(roomName);
		

		let arr: PlayerData = new Array();
		arr.push({
			socket: playerSocket,
			ball: null,
			paddle: null,
			playerId: payload.playerId,
			socketId: playerSocket.id,
			emit: false
		});
		arr.push({
			socket: opponentSocket,
			ball: null,
			paddle: null,
			playerId: payload.opponentId,
			socketId: opponentSocket.id,
			emit: false
		});
		this.setDataToBothPlayer(arr);
		this.gameRoom.set(roomName, arr);
		
		this.ws.to(roomName).emit('playFriend', {room: roomName});
	}

	@SubscribeMessage('playWithFriend')
	async playWithFriend(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
		
		const player: {key: string, value: Socket} = this.Gateway.findSocketMap(client.id);
		if (!player || player.key === payload.playerId)
			return ;
		
		const playerNickname: string = await this.getPlayerNickname(player.key);
		
		const opponentStatus: string = await this.getPlayerStatus(payload.playerId);
		if (opponentStatus !== 'online') {
	
			return ;
		}
		const playerSocket: Socket = this.Gateway.socketUser.get(payload.playerId);
		//emit an error
		if (!playerSocket)
			return ;
		//here make the room if didn't accept remove it
		this.ws.to(playerSocket.id).emit('inviteThePlayer',
						{playerNickname, playerId: player.key, opponentId: payload.playerId});
	}

	
	generateNameGameRoom(playerOne: string, playerTwo: string): string {
		
		return 'Room: ' + playerOne + ' | ' +  playerTwo;
	}

	getGameRoomData(): PlayerData {
		return this.pendingPlayer.splice(0, 2);
	}

	setDataToBothPlayer(players: PlayerData): void {
		let sight;
		for (let i: number = 0; i != 2; i++) {
			players[i].ball = new Ball();
			sight = (!i) ? players[i].ball.calculeBallSight() : sight;
			players[i].ball.setBallSight(sight);
			players[i].paddle = new Paddle((!i) ? false : true);
		}
	}

	async getPlayerPhoto(playerId: string): Promise<{photo_path: string, nickName: string}> {
		try {
			const user = await this.prisma.user.findUnique({
				where: {
					id: playerId,
				},
				select: {
					nickName: true
				}
			});
			const profile = await this.prisma.profile.findUnique({
				where: {
					userID: playerId,
				},
				select: {
					photo_path: true
				}
			});
			return { photo_path: profile.photo_path, nickName: user.nickName };
		}
		catch (err) {
			//return ;
			throw err;
		}
	}


	@SubscribeMessage('fireTheGameUp')
	async fireTheGameUP(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
		let thatRoomGame = this.gameRoom.get(payload.room);
		let userData: Array<{photo_path: string, nickName: string}> = [];
		try {
			for (let i = 0; i != 2; i++)
				userData.push(await this.getPlayerPhoto(thatRoomGame[i].playerId));
		}
		catch(err) {
			return ;
		}
		//await 'zizi ', photo_path);
		if (!thatRoomGame) {
			this.ws.to(client.id).emit("notInGame");
			return ;
		}
		let i = thatRoomGame[0].socketId === client.id ? 0 : 1;
		thatRoomGame[i].emit = true;
		if (thatRoomGame[0].emit && thatRoomGame[1].emit) {
			for (let i: number = 0; i != 2; i++) {
				await this.switchPlayerStatus(thatRoomGame[i].playerId, "at game");
				thatRoomGame[i].emit = false;
			}
			this.ws.to(payload.room).emit('playNow', 
			[
				{socket: thatRoomGame[0].socketId, photo_path: userData[0].photo_path, nickName: userData[0].nickName},
				{socket: thatRoomGame[1].socketId, photo_path: userData[1].photo_path, nickName: userData[1].nickName}
			]);
		}
	}

	@SubscribeMessage('joinToPlayWithRandom')
	joinToPlayWithRandom(@ConnectedSocket() client: Socket) {
	
		const player: {key: string, value: Socket} = this.Gateway.findSocketMap(client.id);
		if (!player)
			return ;
		
		for (let i = 0; i != this.pendingPlayer.length; i++) {
			if (this.pendingPlayer[i].playerId === player.key) {
				
				return ;
			}
		}
		this.pendingPlayer.push({
			socket: client,
			ball: null,
			paddle: null,
			playerId: player.key,
			socketId: player.value.id,
			emit: false
		});
		if (this.pendingPlayer.length >= 2) {
		
			
			const roomName: string = this.generateNameGameRoom(
				this.pendingPlayer[0].playerId, this.pendingPlayer[1].playerId);
			this.setDataToBothPlayer(this.pendingPlayer.slice(0, 2));
			this.pendingPlayer[0].socket.join(roomName);
			this.pendingPlayer[1].socket.join(roomName);
			this.gameRoom.set(roomName, this.getGameRoomData());
			
			this.ws.to(roomName).emit('redirectToGame', {room: roomName});
			
		}
	}

	
	//***************
	@SubscribeMessage('movePaddle')
	movePaddle(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
		
		let thatRoomGame = this.gameRoom.get(payload.room);
		let i = thatRoomGame[0].socketId === client.id ? 0 : 1;
		if (payload.move === "right" && !thatRoomGame[i].paddle.checkRightWall())
			thatRoomGame[i].paddle.movePaddle(payload.move);
		else if (payload.move === "left" && !thatRoomGame[i].paddle.checkLeftWall())
			thatRoomGame[i].paddle.movePaddle(payload.move);
	}

	resetGameData(thatRoomGame): void {
		const sight = thatRoomGame[0].ball.calculeBallSight();
		for (let i = 0; i != 2; i++) {
			thatRoomGame[i].ball.setBallSight(sight);
			thatRoomGame[i].ball.xpos = 50;
			thatRoomGame[i].ball.ypos = 50;
			thatRoomGame[i].paddle.pos = 50;
		}
	}

	
	async addGameHistory(players: [string, string], whoWin: number): Promise<void> {
		//xp add it in the level too
		try {
    const commingData = await this.prisma.games_history.createMany({
      data: [
        {
				player_id: players[0],
				opponent_id: players[1],
				xp_level: (!whoWin) ? 20 : 0,
				date: new Date(),
				result: (!whoWin) ? true : false
        },
        {
				player_id: players[1],
				opponent_id: players[0],
				xp_level: (whoWin) ? 20 : 0,
				date: new Date(),
				result: (whoWin) ? true : false
        }
      ]
    });

		}
		catch (err) {
			return ;
		}
	}

	async addPlayerLevelXp(playerId: string) {
		try {
		const profile = await this.prisma.profile.update({
			where: {
				userID: playerId,
			},
			data: {
				level: {
					increment: 0.20,
				}
			}
		});

		}
		catch (err) {
			return ;
		}
	}

	async switchPlayerStatus(playerId: string, status: string) {
		try {
		const profile = await this.prisma.user.update({
			where: {
				id: playerId
			},
			data: {
				is_active: status
			}
		});

		}
		catch (err) {
			return ;
		}
	}


	async changeUserData(players: [string, string], whoWin: number): Promise<void> {
		try {
		const fstPlayer = await this.prisma.user.update({
			where: {
				id: players[0]
			},
			data: {
				games: {
					increment: 1,
				},
				win: {
					increment: (!whoWin) ? 1 : 0,
				},
				lose: {
					increment: (!whoWin) ? 0 : 1,
				}
			}
		});
		const scndPlayer = await this.prisma.user.update({
			where: {
				id: players[1]
			},
			data: {
				games: {
					increment: 1,
				},
				win: {
					increment: (whoWin) ? 1 : 0,
				},
				lose: {
					increment: (whoWin) ? 0 : 1,
				}
			}
		});
		const fstPlayerLevel = await this.prisma.profile.findUnique({
			where: {
				userID: players[0]
			},
			select: {
				level: true
			}
		});

		const scndPlayerLevel = await this.prisma.profile.findUnique({
			where: {
				userID: players[1]
			},
			select: {
				level: true
			}
		});

		const achievementFstPlayer = await this.prisma.achievement.update({
			where: {
				user_id: players[0]
			},
			data: {
				first_game: fstPlayer.games ? true : false,
					
				level_1: (fstPlayerLevel.level >= 1) ? true : false,
				level_5: (fstPlayerLevel.level >= 5) ? true : false
			}
		});
		const achievementScndPlayer = await this.prisma.achievement.update({
			where: {
				user_id: players[1]
			},
			data: {
				first_game: scndPlayer.games ? true : false,
				level_1: (scndPlayerLevel.level >= 1) ? true : false,
				level_5: (scndPlayerLevel.level >= 5) ? true : false
			}
		});
	

		}
		catch (err) {
			return ;
		}
	}

	@SubscribeMessage('cleanRoomGame')
	
	async cleanRoomGame(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
		let thatRoomGame = this.gameRoom.get(payload.room);
		if (!thatRoomGame)
			return ;
		if (!this.gameRoom.has(payload.room))
			return ;

		let i = thatRoomGame[0].socketId === client.id ? 0 : 1;

			await this.addGameHistory([thatRoomGame[0].playerId, thatRoomGame[1].playerId],
				(thatRoomGame[0].paddle.winTimes > thatRoomGame[1].paddle.winTimes) ? 0 : 1);
			await this.addPlayerLevelXp((thatRoomGame[0].paddle.winTimes > thatRoomGame[1].paddle.winTimes)
				? thatRoomGame[0].playerId
				: thatRoomGame[1].playerId);
			await this.changeUserData([thatRoomGame[0].playerId, thatRoomGame[1].playerId],
				(thatRoomGame[0].paddle.winTimes > thatRoomGame[1].paddle.winTimes) ? 0 : 1);
			for (let i: number = 0; i != 2; i++) {
				//here if he was online
				await this.switchPlayerStatus(thatRoomGame[i].playerId, "online");
				thatRoomGame[i].socket.leave(payload.room);
			
			}
			
			this.gameRoom.delete(payload.room);
			
	}

	async cleanTheGame(room: string) {
		let thatRoomGame = this.gameRoom.get(room);
		
		if (!thatRoomGame)
			return ;
		await this.addGameHistory([thatRoomGame[0].playerId, thatRoomGame[1].playerId],
			(thatRoomGame[0].paddle.winTimes > thatRoomGame[1].paddle.winTimes) ? 0 : 1);
		await this.addPlayerLevelXp((thatRoomGame[0].paddle.winTimes > thatRoomGame[1].paddle.winTimes)
			? thatRoomGame[0].playerId
			: thatRoomGame[1].playerId);
		await this.changeUserData([thatRoomGame[0].playerId, thatRoomGame[1].playerId],
			(thatRoomGame[0].paddle.winTimes > thatRoomGame[1].paddle.winTimes) ? 0 : 1);
		for (let i: number = 0; i != 2; i++) {
			//here if he was online
			await this.switchPlayerStatus(thatRoomGame[i].playerId, "online");
			thatRoomGame[i].socket.leave(room);
		}
	}

	@SubscribeMessage('moveBall')
	moveBall(@ConnectedSocket() client: Socket, @MessageBody() payload: { delta: number, room: string, firstTime: boolean}) {
		
		if (!payload) {
			
			return ;
		}
		let thatRoomGame = this.gameRoom.get(payload.room);
	
		if (!thatRoomGame)
			return ;
		let i = thatRoomGame[0].socketId === client.id ? 0 : 1;

		const data = {
			upPos:
				(thatRoomGame[0].paddle.sight === "TOP") ? thatRoomGame[0].paddle.pos : thatRoomGame[1].paddle.pos,
			downPos:
				(thatRoomGame[0].paddle.sight === "BOTTOM") ? thatRoomGame[0].paddle.pos : thatRoomGame[1].paddle.pos
		};
		
		if ((!thatRoomGame[0].paddle.win && !thatRoomGame[1].paddle.win) &&
				!thatRoomGame[i].ball.updateBall(payload.delta, data)) {
			const upPos = (thatRoomGame[0].paddle.sight === "TOP") ? thatRoomGame[0] : thatRoomGame[1];
			const downPos = (thatRoomGame[0].paddle.sight === "BOTTOM") ? thatRoomGame[0] : thatRoomGame[1];
			if (thatRoomGame[i].ball.ypos < 5) {
				downPos.paddle.win = true;
				downPos.paddle.winTimes++;
			}
			else if (thatRoomGame[i].ball.ypos > 95) {
				upPos.paddle.win = true;
				upPos.paddle.winTimes++;
			}
		}
	
		thatRoomGame[i].emit = true;
		if (thatRoomGame[0].emit && thatRoomGame[1].emit) {

			if (thatRoomGame[0].paddle.win || thatRoomGame[1].paddle.win) {
				
				if ((thatRoomGame[0].paddle.winTimes + thatRoomGame[1].paddle.winTimes) === 5) {
					
					for (let i: number = 0; i != 2; i++) {
						thatRoomGame[i].emit = false;
						thatRoomGame[i].paddle.win = false;
					}

	
					this.ws.to(payload.room).emit("incrementScore",
						[
							thatRoomGame[0].paddle.getData(thatRoomGame[0].socketId),
							thatRoomGame[1].paddle.getData(thatRoomGame[1].socketId)
						]
					);
					this.cleanTheGame(payload.room);

		
					return ;

					
				}
				this.resetGameData(thatRoomGame);
			}
			for (let i: number = 0; i != 2; i++)
				thatRoomGame[i].emit = false;
	
			this.ws.to(payload.room).emit("drawGameAssets",
				[
					thatRoomGame[0].ball.getData(thatRoomGame[0].socketId),
					thatRoomGame[1].ball.getData(thatRoomGame[1].socketId)
				],
				[
					thatRoomGame[0].paddle.getData(thatRoomGame[0].socketId),
					thatRoomGame[1].paddle.getData(thatRoomGame[1].socketId)
				],
			);
	
			for (let i: number = 0; i != 2; i++) {
			
				thatRoomGame[i].paddle.win = false;
			}
		}
	}
}
