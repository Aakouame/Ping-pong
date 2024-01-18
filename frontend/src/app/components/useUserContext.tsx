"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

import { ioClient, SocketClient } from "@/app/api/instance";
import { type Socket, io } from "socket.io-client";
import { Manager } from "socket.io-client/debug";
import { useRouter } from "next/navigation";
import WithFriend from "@/app/assets/svg/game/withFriend.svg";

import Profilepic from "@/app/assets/svg/profile.svg";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
type userType = {
  id: string;
  full_name: string;
  nickName: string;
};

type UserContextType = {
  userData: userType;
  setUserData: React.Dispatch<React.SetStateAction<userType>>;
  fetcher: () => Promise<void>;
};

export const UserContext = createContext<UserContextType | null>(null);

export default function UserContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [userData, setUserData] = useState<userType>({
    id: "",
    full_name: "",
    nickName: "",
  });

  const router = useRouter();
  async function fetcher() {
    try {
      const response = await fetch(
        `http://${process.env.NEXT_PUBLIC_HOST}:3001/auth/getUserStatus`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (response.status === 403) throw new Error("nada");
      setUserData(await response.json());
    } catch (error) {
      console.clear();
    }
  }

  useEffect(() => {
    ioClient;
    const SocketClient = ioClient.getSocketClient();
    SocketClient.on(
      "inviteThePlayer",
      (data: {
        playerNickname: string;
        playerId: string;
        opponentId: string;
      }) => {
        Swal.fire({
          title: `${data.playerNickname} invite you to play with him`,
          text: "",
          imageUrl: `${WithFriend.src}`,
          imageWidth: 400,
          imageHeight: 200,
          imageAlt: "Custom image",
          allowOutsideClick: false,
          showCancelButton: true,
          confirmButtonText: "this confirm",
          cancelButtonText: "this cancel",
        }).then((res) => {
          if (res.hasOwnProperty("isConfirmed") && res.isConfirmed) {
            SocketClient.emit("joinPlayerGameRoom", data);
          } else if (res.hasOwnProperty("isConfirmed") && !res.isConfirmed) {
            SocketClient.emit("didNotAcceptInvite", data);
          }
        });
      }
    );

    SocketClient.on("cancelGameInvitation", () => {
      toast.error("Your invitation was declined");
    });

    SocketClient.on("playFriend", (data: { room: string }) => {
      ioClient.room = data.room;

      let color = "";
      let colorbg = "";
      color = "E95A3A";
      colorbg = "F07559";

      router.push(`/game/user?color=${color}&colorbg=${colorbg}`);
    });

    fetcher();
  }, []);

  return (
    <UserContext.Provider value={{ userData, setUserData, fetcher }}>
      <Toaster />
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("Error in UserContext provider");
  }
  return context;
}
