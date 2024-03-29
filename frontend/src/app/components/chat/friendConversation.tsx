import "../../(pages)/chat/chat.css";

import { useEffect, useState, useRef, use } from "react";
import { friendSelected } from "@/app/utils/library/friendsSelected";

import "remixicon/fonts/remixicon.css";
import pointsOption from "@/app/assets/svg/chat/pointsOption.svg";
import { text } from "stream/consumers";
import submitBtn from "@/app/assets/svg/chat/submitBtn.svg";
import { GetChatConverssationType } from "@/app/types/getChatConverssation";
import { FriendsChatType } from "@/app/types/friendsChatType";
import Image from "next/image";

import moment from "moment";
import tilijo from "../../assets/svg/chat/tilijo.svg";
import { Dropdown } from "flowbite-react";
import { ioClient } from "@/app/api/instance";
import { useRouter } from "next/navigation";
import ProfileImg from "@/app/assets/svg/profileimg.svg";



export default function FriendConversation({
  friendSelected,
  setFriendSelected,
  online_rf,
  friends_rf,
  channel_rf,
  channelSelected_rf,
  members_rf,
  aboutMe_rf,
}: {
  friendSelected: FriendsChatType;
  setFriendSelected: () => void;
  online_rf:	boolean;
  friends_rf:	boolean;
  channel_rf:	boolean;
  channelSelected_rf: boolean;
  members_rf: boolean;
  aboutMe_rf: boolean;
}) {
  
  const router = useRouter();
  const [dataConversation, setDataConversation] = useState<
    GetChatConverssationType[]
  >([]);
  const [isBlocked, setIsBlocked] = useState<boolean>(
    friendSelected.isBlocked || false
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // const handleTextareaChange = () => {
  //   if (textareaRef.current) {
  //     textareaRef.current.style.height = "auto";
  //     const newHeight = `${textareaRef.current.scrollHeight}px`;
  //     textareaRef.current.style.height = newHeight;
  //   }
  // };

  const handleClickBtnBack = () => {
    
  };

  
  const handleSendMessage = () => {
   
    const client = ioClient.getSocketClient();
    client.emit("dm", {
      recieverId: friendSelected.id,
      message: textareaRef.current?.value,
    });
    textareaRef.current!.value = "";
  };

  const sendToProfile = () => {
    
    router.push(`/profile/${friendSelected.nickname}`);
  };

  const handleBlock = () => {
    async function block() {
      const response = await fetch(
        `http://${process.env.NEXT_PUBLIC_HOST}:3001/chat/block/${friendSelected.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (response.ok) {
        setIsBlocked(true);
      }
    }
    block();
    
  };

  const handleUnblock = () => {
    async function block() {
      const response = await fetch(
        `http://${process.env.NEXT_PUBLIC_HOST}:3001/chat/unblock/${friendSelected.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (response.ok) {
        setIsBlocked(false);
      }
    }
    block();
  };

  useEffect(() => {}, [friendSelected.isBlocked]);

  const sendChallenge = (id: string) => {
    const client = ioClient.getSocketClient();
    client.emit("playWithFriend", { playerId: id, nickName: null });
  };

  
  useEffect(() => {
    async function handlShowFriendConversation() {
      if (!friendSelected) {
        return;
      }
      const response = await fetch(
        `http://${process.env.NEXT_PUBLIC_HOST}:3001/chat/history/${friendSelected.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (!response.ok) {
      }
      setDataConversation(await response.json());
      setIsBlocked(friendSelected.isBlocked);
    }
    handlShowFriendConversation();
  }, [friendSelected]);

  useEffect(() => {
    const historychatdiv = document.getElementById("scroll");
    if (historychatdiv) {
      historychatdiv.scrollTop = historychatdiv.scrollHeight;
    }
  }, [dataConversation]);

  useEffect(() => {
    const client = ioClient.getSocketClient();

    client.on("chat", (data) => {
     
      if (!friendSelected) {
        return;
      }
      setDataConversation((dataConversation) => [...dataConversation, data]);
      setIsBlocked(friendSelected.isBlocked);
    });

    return () => {
      client.off("chat");
    };
  }, [friendSelected]);


  return (
    <>
      {friendSelected && (
        <div className="friendConv">
          <div className="barInfo">
            <button className="btn-back" onClick={setFriendSelected}>
              <i className="ri-arrow-left-line"></i>
            </button>
            <div className="UserInfo">
              <Image
                src={
                  friendSelected.photo === "default_img"
                    ? ProfileImg.src
                    : friendSelected.photo
                }
                alt=""
                className="pictureUser"
                width={50}
                height={50}
              />
              <div className="UserStatus">
                <span className="nameUser">
                  {friendSelected && friendSelected.nickname}
                </span>
                {/* here we gonna do a condition if the user is online or ingame or offline */}
                {/* <span className="statusUser text-teal-400">Online</span> */}
              </div>
            </div>
           
            <div className="optionUserDiv">
              <Dropdown label="Options" dismissOnClick={false} color="">
                <Dropdown.Item onClick={sendToProfile}>Profile</Dropdown.Item>
                {isBlocked === false ? (
                  <Dropdown.Item onClick={handleBlock}>Block</Dropdown.Item>
                ) : (
                  <Dropdown.Item onClick={handleUnblock}>Unblock</Dropdown.Item>
                )}
                <Dropdown.Item onClick={() => sendChallenge(friendSelected.id)}>Challenge</Dropdown.Item>
              </Dropdown>
            </div>
            
          </div>

          <div className="historyChat" id="scroll">
            {dataConversation.length > 0 &&
              dataConversation.map((message, index) => (
                <div className="message" key={index}>
                  <div className="message-content">
                    {message.mine === true ? (
                      <div className="send-msg">
                        <div className="message-details ">
                          <span className="infoTime">
                            {moment(message.sended_at).format("lll")}
                          </span>
                          <span className="infoName pl-4">You</span>
                        </div>
                        <div className="message-text-sender">
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      <div className="recieve-msg">
                        <div className="message-details ">
                          <span className="infoName pr-4">{message.name}</span>
                          <span className="infoTime">
                            {moment(message.sended_at).format("lll")}
                          </span>
                        </div>
                        <div className="message-text-recieve">
                          {message.content}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
          <div className="sendYourMsg">
            <div className="textAreaDiv">
              <textarea
                className="textArea"
                placeholder="Type here..."
                required
                ref={textareaRef}
                maxLength={250}
              ></textarea>
            </div>
            <button
              type="button"
              className=" submitMsg"
              onClick={
                handleSendMessage
              }
            >
              <Image
                src={submitBtn.src}
                alt="submit"
                className="submitBtn"
                width={60}
                height={60}
              />
            </button>
          </div>
        </div>
      )}
      {!friendSelected && (
        <div className="noConversation">Welcome to the friends chat</div>
      )}
    </>
  );
}
