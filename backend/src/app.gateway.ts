import { Injectable, UseGuards, Req, OnModuleInit } from "@nestjs/common";
import { Request } from "express";
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { PrismaService } from "../prisma/prisma.service";

import * as Cookies from "cookie";
import * as cookiesParser from "cookie-parser";

@Injectable()
@WebSocketGateway({
  cors: {
    origin: `http://${process.env.NEXT_PUBLIC_HOST}:3000`,
    credentials: true,
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  public socketUser: Map<string, Socket>;

  constructor(private prisma: PrismaService) {
    this.socketUser = new Map();
  }

  async getIdFromCookie(client: Socket): Promise<string | null> {
    const clientSocket = this.server.sockets.sockets.get(client.id);
    const cookie = client.request.headers.cookie;

    if (!cookie) {
      return null;
    }
    const parse = Cookies.parse(cookie);
    const sid = cookiesParser.signedCookie(
      parse["connect.sid"],
      process.env.SESSION_SECRET
    );

    let sessionDb;
    try {
      sessionDb = await this.prisma.session.findUnique({
        where: {
          sid,
        },
      });
    } catch (err) {
      return null;
    }
    if (!sessionDb) {
      return null;
    }
    const db = JSON.parse(sessionDb.data).passport;
    if (!db || !db.user || !db.user.id) {
      return null;
    }
    return db.user.id;
  }

  async handleConnection(client: Socket, ...args: any[]) {


    const clientSocket = this.server.sockets.sockets.get(client.id);
    const id: string = await this.getIdFromCookie(client);
    if (!id) {
      clientSocket.disconnect();
      return;
    }

    this.socketUser.set(id, client);

	try {
		await this.prisma.user.update({
			where: {
				id
			},
			data: {
				is_active: "online"
			}
		});
	} catch (error) {
	}
	this.server.emit('stats');
  }

  async handleDisconnect(client: Socket) {
	try {
		await this.prisma.user.update({
			where: {
				id: await this.getIdFromCookie(client)
			},
			data: {
				is_active: "offline"
			}
		});
	} catch (error) {
	}
	this.server.emit('stats');
  }

  getKeyByValue(searchValue: string) {
    for (const [key, value] of this.socketUser.entries()) {
      if (value.id == searchValue) return key;
    }
  }

  findSocketMap(socketId: string): { key: string; value: Socket } {
    for (const [key, value] of this.socketUser.entries()) {
      if (value.id === socketId) return { key, value };
    }
    return null;
  }

  get_id_by_socketId(socketid: string) {
    return this.getKeyByValue(socketid);
  }

  get_socketID_by_id(userid: string) {
    return this.socketUser.get(userid).id;
  }
}
