"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import { useState } from "react";
import { Header, SideBar, ModalGameComponent } from "@/app/components";
import WithRandom from "@/app/assets/svg/game/withRandom.svg";
import { useRef } from "react";
import Ball from "./botcode/Ball";
import Paddle from "./botcode/Paddle";
import { NeuePlakFont, NeuePlakFontBold } from "@/app/utils/NeuePlakFont";
import ProfileImg from "@/app/assets/svg/game/withBot.svg";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { SettingsType } from "@/app/types/settingsType";
import getSettings from "@/app/api/Settings/getSettings";
import Swal from "sweetalert2";
import "./styles.css";
import Defaultimg from "@/app/assets/svg/profileimg.svg";

//import socket
import { ioClient, SocketClient } from "@/app/api/instance";
import { Socket, io } from "socket.io-client";
import { Manager } from "socket.io-client/debug";

type Player = {
  photo_path: string;
  nickName: string;
};

export default function RandomMatch() {
  const [dataSettings, setDataSettings] = useState<SettingsType>({
    id: "",
    full_name: "",
    nickName: "",
    fac_auth: false,
    photo_path: `${ProfileImg.src}`,
  });
  const [isHumburgClicked, setisHumburgClicked] = useState(false);
  const marginbody = isHumburgClicked ? "ml-6" : "";
  const [openModal, setOpenMoadl] = useState(true);
  const [dataPlayer, setDataPlayer] = useState<Player>({
    photo_path: `${Defaultimg.src}`,
    nickName: "player",
  });
  const [opponentPlayer, setOpponentPlayer] = useState<Player>({
    photo_path: `${Defaultimg.src}`,
    nickName: "player",
  });
  const searchParams = useSearchParams();

  let color = searchParams.get("color") ? searchParams.get("color") : "#E95A3A";
  let colorbg = searchParams.get("colorbg")
    ? searchParams.get("colorbg")
    : "#F07559";

  const router = useRouter();
  //////
  const ImagePlayerRef = useRef<HTMLImageElement>(null);
  const ImageOpponnentRef = useRef<HTMLImageElement>(null);
  ///////
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<HTMLParagraphElement>(null);
  const oponnentRef = useRef<HTMLParagraphElement>(null);
  const unmounted = useRef(false);
  const animationFrameRef = useRef(-1);
  const [visited, setVisited] = useState("");
  useEffect(() => {
    let ballObj: Ball;
    let paddlePlayer: Paddle;
    let paddleOpponent: Paddle;
    //give this one a type to work with
    const SocketClient = ioClient.getSocketClient();

    const ballElem = document.getElementById("ball");
    const paddleTop = document.getElementById("paddle-top");
    const paddleBottom = document.getElementById("paddle-bottom");
    SocketClient.emit("fireTheGameUp", { room: ioClient.room });
    let chk = true;
    let playerScore = 0;
    let opponentScore = 0;
    let i = 0;
    SocketClient.on("notInGame", () => {
      window.location.href = `http://${process.env.NEXT_PUBLIC_HOST}:3000/game`;
      return;
    });
    SocketClient.on(
      "playNow",
      (
        data: [
          { socket: string; photo_path: string; nickName: string },
          { socket: string; photo_path: string; nickName: string }
        ]
      ) => {
        let cli = data[0].socket === SocketClient.id ? 0 : 1;
        let opp = data[0].socket !== SocketClient.id ? 0 : 1;
        setDataPlayer({
          photo_path: data[cli].photo_path,
          nickName: data[cli].nickName,
        });
        setOpponentPlayer({
          photo_path: data[opp].photo_path,
          nickName: data[opp].nickName,
        });
        let lastTime: number;
        let firstTime: boolean = true;
        SocketClient.on(
          "drawGameAssets",
          (
            ball: [
              { socket: string; xpos: number; ypos: number; radius: number },
              { socket: string; xpos: number; ypos: number; radius: number }
            ],
            paddle: [
              {
                socket: string;
                pos: number;
                sight: string;
                speed: number;
                win: boolean;
              },
              {
                socket: string;
                pos: number;
                sight: string;
                speed: number;
                win: boolean;
              }
            ],
            win: {
              socket: string;
              win: boolean;
            }
          ) => {
            let i = ball[0].socket === SocketClient.id ? 0 : 1;
            ballElem?.style.setProperty("--y", ball[i].ypos.toString());
            ballElem?.style.setProperty("--x", ball[i].xpos.toString());
            if (paddle[i].sight === "BOTTOM") {
              const j = paddle[0].socket !== SocketClient.id ? 0 : 1;
              paddleBottom?.style.setProperty(
                "--position",
                paddle[i].pos.toString()
              );
              paddleTop?.style.setProperty(
                "--position",
                paddle[j].pos.toString()
              );
            } else {
              if (chk) {
                const table = document.getElementById("game");
                table?.classList.add("rotate-180");
                table?.classList.add("-scale-x-100");
                chk = false;
              }
              const j = paddle[0].socket !== SocketClient.id ? 0 : 1;
              paddleTop?.style.setProperty(
                "--position",
                paddle[i].pos.toString()
              );
              paddleBottom?.style.setProperty(
                "--position",
                paddle[j].pos.toString()
              );
            }

            if (playerRef.current || oponnentRef.current) {
              i = paddle[0].socket === SocketClient.id ? 0 : 1;
              if (paddle[0].win) {
                i === 0
                  ? (playerRef.current!.innerHTML = (++playerScore).toString())
                  : (oponnentRef.current!.innerHTML =
                      (++opponentScore).toString());
              } else if (paddle[1].win) {
                i === 1
                  ? (playerRef.current!.innerHTML = (++playerScore).toString())
                  : (oponnentRef.current!.innerHTML =
                      (++opponentScore).toString());
              }
            }
          }
        );

        SocketClient.on("finishGame", (socketid: string) => {
          window.location.href = `http://${process.env.NEXT_PUBLIC_HOST}:3000/game`;
          return;
        });

        SocketClient.on(
          "incrementScore",
          (
            paddle: [
              {
                socket: string;
                pos: number;
                sight: string;
                speed: number;
                win: boolean;
              },
              {
                socket: string;
                pos: number;
                sight: string;
                speed: number;
                win: boolean;
              }
            ]
          ) => {
            let i = paddle[0].socket === SocketClient.id ? 0 : 1;
            if (paddle[0].win) {
              i === 0
                ? (playerRef.current!.innerHTML = (++playerScore).toString())
                : (oponnentRef.current!.innerHTML =
                    (++opponentScore).toString());
            } else if (paddle[1].win) {
              i === 1
                ? (playerRef.current!.innerHTML = (++playerScore).toString())
                : (oponnentRef.current!.innerHTML =
                    (++opponentScore).toString());
            }
          }
        );

        let disconnect: boolean = false;
        function update(time: number) {
          if (lastTime) {
            const delta = time - lastTime;
            if (playerScore + opponentScore < 5) {
              SocketClient.emit("moveBall", {
                delta,
                room: ioClient.room,
                firstTime,
              });

              if (firstTime) firstTime = false;
              //i++;
            } else if (playerScore + opponentScore >= 5) {
              window.cancelAnimationFrame(animationFrameRef.current);
              document.removeEventListener("keydown", handlKeyDown);

              SocketClient.off("movePaddle");
              SocketClient.off("moveBall");
              Swal.fire({
                title:
                  playerScore > opponentScore ? "You've Won" : "You've Lost",
                text: playerScore > opponentScore ? "+20xp" : "0xp",

                imageUrl: `${WithRandom.src}`,

                imageWidth: 400,
                imageHeight: 200,
                imageAlt: "Custom image",
                allowOutsideClick: false,
              }).then((res) => {
                if (!res.isDismissed) {
                  window.location.href = `http://${process.env.NEXT_PUBLIC_HOST}:3000/game`;
                }
              });
              return;
            }
          }
          lastTime = time;
          if (!unmounted.current) {
            animationFrameRef.current = window.requestAnimationFrame(update);
          }
        }

        animationFrameRef.current = window.requestAnimationFrame(update);
      }
    );
    function handlKeyDown(e: KeyboardEvent) {
      switch (e.code) {
        case "ArrowRight":
          SocketClient.emit("movePaddle", {
            room: ioClient.room,
            move: "right",
          });
          break;
        case "ArrowLeft":
          SocketClient.emit("movePaddle", {
            room: ioClient.room,
            move: "left",
          });
          break;
      }
    }
    document.addEventListener("keydown", handlKeyDown);
    window.addEventListener("beforeunload", (event) => {
      window.location.href = `http://${process.env.NEXT_PUBLIC_HOST}:3000/game`;
    });

    return () => {
      //hado 5erjhom
      document.removeEventListener("keydown", handlKeyDown);
      window.cancelAnimationFrame(animationFrameRef.current);

      SocketClient.off("movePaddle");
      SocketClient.off("moveBall");
    };
  }, []);

  useEffect(() => {
    async function fetcher() {
      setDataSettings(await getSettings());
    }
    fetcher();
  }, []);
  return (
    <main className="h-screen bg-[#0B0813] relative w-full max-w-[5120px] flex">
      <div className="h-[80px] w-[80px] sm:w-28 sm:h-28 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-[480px] xl:h-[480px] 2xl:w-[550px] 2xl:h-[550px] rounded-full fixed -top-5 sm:-top-10 md:-top-32 lg:-top-40 xl:-top-64 right-0 opacity-70 sm:opacity-60 md:opacity-30 lg:opacity-25 xl:opacity-20 2xl:opacity-[0.19] bg-gradient-to-b from-[#323138] via-[#E95A3A] to-[#60C58D] blur-3xl "></div>
      <Header
        isHumburgClicked={isHumburgClicked}
        setisHumburgClicked={setisHumburgClicked}
      />
      <SideBar isHumburgClicked={isHumburgClicked} />
      <div
        className={`grow overflow-y-auto mt-[41px] sm:mt-11 md:mt-14 lg:mt-[72px] xl:mt-[96px] 2xl:mt-[128px] ${marginbody} //flex justify-center items-center//`}
      >
        <div
          className={`text-white ml-[10px] text-[20px] md:text-[30px] lg:text-[38px] xl:text-[44px] 2xl:text-[60px] ${NeuePlakFontBold.className} `}
        >
          Game
        </div>
        <div className="flex flex-col items-center w-full h-full gap-2 mt-20">
          <div className="w-[200px] h-12 sm:w-[300px] sm:h-14 md:w-[400px] md:h-16 lg:w-[500px] lg:h-[70px] xl:w-[600px] xl:h-[75px] 2xl:w-[700px] 2xl:h-[100px] p-2 flex justify-between">
            <div className="flex justify-center">
              <div className="flex flex-col justify-center items-center">
                <Image
                  ref={ImagePlayerRef}
                  draggable={false}
                  className="sm:w-[25px] sm:h-[25px] md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 2xl:w-16 2xl:h-16 rounded-full"
                  src={
                    dataPlayer.photo_path === "default_img"
                      ? `${Defaultimg.src}`
                      : dataPlayer.photo_path
                  }
                  width={20}
                  height={20}
                  alt="profile pic"
                />
                <p
                  className={`${NeuePlakFont.className} text-white text-[12px] sm:text-[14px] md:text-[18px] lg:text-[22px] xl:text-[28px] 2xl:text-[35px]`}
                >
                  {dataPlayer.nickName}
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <p
                ref={playerRef}
                className={`${NeuePlakFont.className} text-white sm:text-[18px] md:text-[22px] lg:text-[30px] xl:text-[38px] 2xl:text-[45px]`}
              >
                0
              </p>
              <p
                className={`${NeuePlakFont.className} text-white sm:text-[18px] md:text-[22px] lg:text-[30px] xl:text-[38px] 2xl:text-[45px]`}
              >
                :
              </p>
              <p
                ref={oponnentRef}
                className={`${NeuePlakFont.className} text-white sm:text-[18px] md:text-[22px] lg:text-[30px] xl:text-[38px] 2xl:text-[45px]`}
              >
                0
              </p>
            </div>
            <div className="flex justify-center">
              <div className="flex flex-col justify-center items-center">
                <Image
                  ref={ImageOpponnentRef}
                  draggable={false}
                  className="sm:w-[25px] sm:h-[25px] md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 2xl:w-16 2xl:h-16 rounded-full"
                  src={
                    opponentPlayer.photo_path === "default_img"
                      ? `${Defaultimg.src}`
                      : opponentPlayer.photo_path
                  }
                  width={20}
                  height={20}
                  alt="profile pic"
                />
                <p
                  className={`${NeuePlakFont.className} text-white text-[12px] sm:text-[14px] md:text-[18px] lg:text-[22px] xl:text-[28px] 2xl:text-[35px]`}
                >
                  {opponentPlayer.nickName}
                </p>
              </div>
            </div>
          </div>
          <div
            className="relative w-[200px] h-[400px] sm:w-[300px] sm:h-[500px] md:w-[400px] md:h-[600px] lg:w-[500px] lg:h-[700px] xl:w-[600px] xl:h-[800px] 2xl:w-[700px] 2xl:h-[900px] bg-[#E95A3A] rounded-[8px] md:rounded-[12px] lg:rounded-[18px] xl:rounded-[25px] 2xl:rounded-[28px]"
            style={{
              background: `linear-gradient( to bottom, #${color} 0%,#${color} 50%, #${colorbg} 50%, #${colorbg} 100%)`,
            }}
            id="table"
          >
            <div className="h-full w-full" id="game">
              <div className="ball" id="ball"></div>
              <div className="paddle top" id="paddle-top"></div>
              <div className="paddle bottom" id="paddle-bottom"></div>
              <div className="middle-line"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
