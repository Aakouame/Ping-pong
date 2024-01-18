import { type Socket, io } from "socket.io-client";
import { Manager } from "socket.io-client/debug";

interface ClientToServerEvents {
  newMessage: (msg: string) => void;
}

interface InterServerEvents {
  subscribe: (uid: string, user: string) => void;
  newMessage: (conversationUid: string, userUid: string, msg: string) => void;
}

import { useRouter } from "next/router";

export class SocketClient {
  private ioClient: Socket;
  private gameRoom!: string;

  constructor() {
    this.ioClient = new Manager(`http://${process.env.NEXT_PUBLIC_HOST}:3001`, {
      autoConnect: true,
      withCredentials: true,
    }).socket("/") as unknown as Socket<
      ClientToServerEvents,
      InterServerEvents
    >;

    this.ioClient.on("connect", () => {});

    this.ioClient.on("disconnect", () => {});
  }

  playRandom() {
    this.ioClient.emit("joinToPlayWithRandom");
  }

  getSocketClient() {
    return this.ioClient;
  }

  get room() {
    return this.gameRoom;
  }

  set room(value: string) {
    this.gameRoom = value;
  }
}

export const ioClient = new SocketClient();
