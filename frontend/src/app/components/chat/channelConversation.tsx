import "../../(pages)/chat/chat.css";

import { useEffect, useState, useRef, use } from "react";

import "remixicon/fonts/remixicon.css";
import pointsOption from "@/app/assets/svg/chat/pointsOption.svg";
import { text } from "stream/consumers";
import submitBtn from "@/app/assets/svg/chat/submitBtn.svg";
import { GetChatConverssationType } from "@/app/types/getChatConverssation";
import { ChannelChatType } from "@/app/types/ChannelChatType";
import Image from "next/image";

import moment from "moment";
import tilijo from "../../assets/svg/chat/tilijo.svg";
import { DataChannelConversationType } from "@/app/types/dataChannelConversationType";
import lwaghch from "../../assets/svg/chat/lwaghch.svg";
import { MemberListChannel, aboutMe } from "../../types/memberListChannel";
import { ioClient } from "@/app/api/instance";
import ProfileImg from "@/app/assets/svg/profileimg.svg";

import {
  Button,
  Modal,
  Label,
  TextInput,
  Spinner,
  FloatingLabel,
  FileInput,
  Select,
  Dropdown,
} from "flowbite-react";
import { UpdateChannelType } from "@/app/types/updateChannelType";

export default function ChannelConversation({
  onSelectChannel,
  blan,
  channelSelected,
  online_rf,
  friends_rf,
  channel_rf,
  channelSelected_rf,
  members_rf,
  aboutMe_rf,
}: {
  onSelectChannel: (test: ChannelChatType) => void;
  blan: () => void;
  channelSelected: ChannelChatType;
  online_rf: boolean;
  friends_rf: boolean;
  channel_rf: boolean;
  channelSelected_rf: boolean;
  members_rf: boolean;
  aboutMe_rf: boolean;
}) {
  const [dataConversation, setDataConversation] = useState<
    DataChannelConversationType[]
  >([]);
  const [members_ref, setmembers_ref] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [memberList, setMemberList] = useState<MemberListChannel[]>([]);

  const [aboutMe, setAboutMe] = useState<aboutMe>();
  const [openModalEditChannel, setOpenModalEditChannel] = useState(false);
  const [openModalInvite, setOpenModalInvite] = useState(false);
  const [UpdateChannelType, setUpdateChannelType] = useState<UpdateChannelType>(
    {
      password: "",
      type: channelSelected.type,
      channel_id: channelSelected.id,
    }
  );
  const [new_passwordChannel, setNew_passwordChannel] = useState<string>("");
  const [new_typeChannel, setNew_typeChannel] = useState<string>("");
  const [nameFriendInvited, setNameFriendInvited] = useState<string>("");
  const [statusFriendInvited, setStatusFriendInvited] = useState<string>("");

  const handleTextareaChange = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.style.height = newHeight;
    }
  };

  const handleClickBtnBack = () => {
    let data: ChannelChatType = {
      id: "",
      nameOfChannel: "",
      isJoined: false,
      photo: "",
      type: "",
    };
    onSelectChannel(data);
  };

  const handleSendMessage = () => {
    const client = ioClient.getSocketClient();
    client.emit("room", {
      channel_id: channelSelected.id,
      content: textareaRef.current?.value,
    });
    textareaRef.current!.value = "";
  };

  const handleChallenge = (id: string, name:string) => {
    console.log("challenge: name", name);
    const client = ioClient.getSocketClient();
    client.emit("playWithFriend", { playerId: id, nickName: null });
  };

  const handleBan = (idMember: string) => {
    const banMember = async () => {
      const response = await fetch(
        `http://${process.env.NEXT_PUBLIC_HOST}:3001/chat/ban`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channel_id: channelSelected.id,
            member_id: idMember,
          }),
          credentials: "include",
        }
      );
      if (!response.ok) {
      } else {
      }
      const data = await response.json();
    };
    banMember();
  };

  const handleKick = (idMember: string) => {
    const kickMember = async () => {
      const response = await fetch(
        `http://${process.env.NEXT_PUBLIC_HOST}:3001/chat/kick`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channel_id: channelSelected.id,
            member_id: idMember,
          }),
          credentials: "include",
        }
      );
      if (!response.ok) {
      } else {
      }
      const data = await response.json();
    };
    kickMember();
  };

  const handleMute = (idMember: string) => {
    const muteMember = async () => {
      const response = await fetch(
        `http://${process.env.NEXT_PUBLIC_HOST}:3001/chat/mute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channel_id: channelSelected.id,
            member_id: idMember,
          }),
          credentials: "include",
        }
      );
      if (!response.ok) {
      } else {
      }
      const data = await response.json();
    };
    muteMember();
  };

  const handleSettingAdmin = (idMember: string) => {
    const setAdminMember = async () => {
      const response = await fetch(
        `http://${process.env.NEXT_PUBLIC_HOST}:3001/chat/add_admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channel_id: channelSelected.id,
            member_id: idMember,
          }),
          credentials: "include",
        }
      );
      if (!response.ok) {
      } else {
      }
      const data = await response.json();
    };
    setAdminMember();
  };

  const handleEditChannel = (newChannel: UpdateChannelType) => {
    const editChannel = async () => {
      const response = await fetch(
        `http://${process.env.NEXT_PUBLIC_HOST}:3001/chat/channel_password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newChannel),
          credentials: "include",
        }
      );
      if (!response.ok) {
      } else {
        setOpenModalEditChannel(false);
        setNew_passwordChannel("");
        setNew_typeChannel("");
      }
      const data = await response.json();
    };
    editChannel();
  };

  const handleLeaveChannel = () => {
    const leaveChannel = async () => {
      const response = await fetch(
        `http://${process.env.NEXT_PUBLIC_HOST}:3001/chat/leave`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channel: channelSelected.id,
          }),

          credentials: "include",
        }
      );
      if (!response.ok) {
      } else {
      }
      const data = await response.json();
    };
    leaveChannel();
  };

  const handleAddFriend = (nickName: string) => {
    const addFriend = async () => {
      const response = await fetch(
        `http://${process.env.NEXT_PUBLIC_HOST}:3001/chat/add_member`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channel_id: channelSelected.id,
            name: nickName,
          }),
          credentials: "include",
        }
      );
      if (!response.ok) {
        setStatusFriendInvited("the invitation has not been sent");
      } else {
        setNameFriendInvited("");
        setStatusFriendInvited("the invitation has been sent");
      }
      const data = await response.json();
    };
    addFriend();
  };

  useEffect(() => {
    const historychatdiv = document.getElementById("scroll");
    if (historychatdiv) {
      historychatdiv.scrollTop = historychatdiv.scrollHeight;
    }
  }, [dataConversation]);

  useEffect(() => {
    const client = ioClient.getSocketClient();
    if (!channelSelected) return;
    client.on(channelSelected.id, (data) => {
      setDataConversation((dataConversation) => [...dataConversation, data]);
    });
    return () => {
      client.off(channelSelected.id);
    };
  }, [channelSelected]);

  useEffect(() => {
    async function fetcher() {
      if (channelSelected.isJoined) {
        const getconv = await fetch(
          `http://${process.env.NEXT_PUBLIC_HOST}:3001/chat/list_room_messsages/${channelSelected.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (!getconv.ok) {
          // throw new Error("Network response was not ok");
        }
        const conv = await getconv.json();
        setDataConversation(conv);
      }
    }
    fetcher();
  }, [channelSelected]);

  useEffect(() => {
    async function fetcher() {
      if (channelSelected.isJoined) {
        const getconv = await fetch(
          `http://${process.env.NEXT_PUBLIC_HOST}:3001/chat/members/${channelSelected.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (!getconv.ok) {
          // throw new Error("Network response was not ok");
        }
        console.log("fetching members was done");
        setMemberList(await getconv.json());
      }
    }
    fetcher();
  }, [channelSelected, members_rf]);

  useEffect(() => {
    async function fetcher() {
      if (channelSelected.isJoined) {
        const getconv = await fetch(
          `http://${process.env.NEXT_PUBLIC_HOST}:3001/chat/role/${channelSelected.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (getconv.ok) {
          setAboutMe(await getconv.json());
        }
      }
    }
    fetcher();
  }, [channelSelected, members_ref]);

  return (
    <>
      {channelSelected.isJoined ? (
        <>
          <div className="channelConv">
            <div className="barInfo">
              <button className="btn-back" onClick={handleClickBtnBack}>
                <i className="ri-arrow-left-line"></i>
              </button>
              <div className="UserInfo">
                <Image
                  src={
                    channelSelected.photo === "default_img"
                      ? ProfileImg.src
                      : channelSelected.photo
                  }
                  alt=""
                  className="pictureUser"
                  width={50}
                  height={50}
                />
                <div className="UserStatus">
                  <span className="nameUser">
                    {channelSelected && channelSelected.nameOfChannel}
                  </span>
                </div>
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
                              {moment(message.sended_at).calendar()}
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
                            <span className="infoName pr-4">
                              {message.name}
                            </span>
                            <span className="infoTime">
                              {moment(message.sended_at).calendar()}
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
                  onKeyUp={handleTextareaChange}
                  maxLength={300}
                ></textarea>
              </div>
              <button
                type="button"
                className=" submitMsg"
                onClick={handleSendMessage}
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
          {/* right side of channel */}
          <div className="infoChannel">
            <div className="topSideOfChannel">
              <h2>Channel</h2>
              <Image
                src={
                  channelSelected.photo === "default_img"
                    ? ProfileImg.src
                    : channelSelected.photo
                }
                alt="Channel overview"
                className="channelOverview"
                width={140}
                height={140}
              />
              <p className="channelName">{channelSelected.nameOfChannel}</p>

              <p className="channelType">Channel {channelSelected.type}</p>
              {aboutMe && aboutMe.role === "owner" && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setOpenModalEditChannel(true)}
                    className="bg-[#E95A3A] mt-2"
                  >
                    Edit channel
                  </Button>
                  <Modal
                    show={openModalEditChannel}
                    size="2xl"
                    onClose={() => setOpenModalEditChannel(false)}
                    popup
                  >
                    <Modal.Header />
                    <Modal.Body>
                      <div className="text-center">
                        <h3 className="mb-5 text-lg font-normal text-[#E95A3A] dark:text-gray-400 ">
                          Edit your channel!
                        </h3>
                        <div className="max-w-md lastInput ">
                          <Dropdown
                            className=""
                            label={`Type of Channel: ${new_typeChannel}`}
                            dismissOnClick={true}
                          >
                            <Dropdown.Item
                              className="typeChannelSelect"
                              onClick={() => {
                                setNew_typeChannel("PUBLIC");
                                setUpdateChannelType({
                                  channel_id: channelSelected.id,
                                  password: new_passwordChannel,
                                  type: "PUBLIC",
                                });
                              }}
                            >
                              Public
                            </Dropdown.Item>
                            <Dropdown.Item
                              className="typeChannelSelect"
                              onClick={() => {
                                setNew_typeChannel("PROTECTED");
                                setUpdateChannelType({
                                  channel_id: channelSelected.id,
                                  password: new_passwordChannel,
                                  type: "PROTECTED",
                                });
                              }}
                            >
                              Protected
                            </Dropdown.Item>
                          </Dropdown>
                          {new_typeChannel &&
                            new_typeChannel === "PROTECTED" && (
                              <div className="mb-2 mt-2">
                                <FloatingLabel
                                  className="pswdInput"
                                  variant="outlined"
                                  label="Set or change password"
                                  color="default"
                                  onChange={(pwd) => {
                                    setNew_passwordChannel(pwd.target.value);
                                    setUpdateChannelType({
                                      channel_id: channelSelected.id,
                                      password: pwd.target.value,
                                      type: new_typeChannel,
                                    });
                                  }}
                                />
                              </div>
                            )}
                        </div>
                        <div className="flex justify-center gap-10 mt-5">
                          <Button
                            className="bg-[#E95A3A]"
                            onClick={() => {
                              setUpdateChannelType({
                                channel_id: channelSelected.id,
                                password: new_passwordChannel,
                                type: new_typeChannel,
                              });
                              if (new_typeChannel)
                                handleEditChannel(UpdateChannelType);
                              setNew_passwordChannel("");
                              setNew_typeChannel("");
                              setUpdateChannelType({
                                channel_id: "",
                                password: "",
                                type: "",
                              });
                            }}
                          >
                            {"Save"}
                          </Button>
                          <Button
                            color="gray"
                            onClick={() => {
                              setOpenModalEditChannel(false);
                            }}
                          >
                            No, cancel
                          </Button>
                        </div>
                      </div>
                    </Modal.Body>
                  </Modal>
                  {channelSelected.type === "PRIVATE" && (
                    <>
                      <Button
                        className="bg-[#383546] mt-2"
                        onClick={() => setOpenModalInvite(true)}
                      >
                        Invite friend
                      </Button>
                      <Modal
                        show={openModalInvite}
                        size="md"
                        onClose={() => setOpenModalInvite(false)}
                        popup
                      >
                        <Modal.Header />
                        <Modal.Body>
                          <div className="text-center">
                            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                              Add your friend!
                            </h3>
                            <div className="grid grid-flow-col justify-stretch space-x-4">
                              <FloatingLabel
                                variant="filled"
                                label="Nickname"
                                onChange={(e) => {
                                  setNameFriendInvited(e.target.value);
                                }}
                              />
                            </div>

                            <div className="flex justify-center gap-4">
                              <Button
                                className="bg-[#E95A3A] mt-2"
                                onClick={() => {
                                  handleAddFriend(nameFriendInvited);
                                  if (
                                    statusFriendInvited ===
                                    "the invitation has been sent"
                                  ) {
                                    setOpenModalInvite(false);
                                    setNameFriendInvited("");
                                    setStatusFriendInvited("");
                                  }
                                }}
                              >
                                {"Add friend"}
                              </Button>
                              <Button
                                color="gray"
                                className="mt-2"
                                onClick={() => {
                                  setOpenModalInvite(false);
                                  setNameFriendInvited("");
                                  setStatusFriendInvited("");
                                }}
                              >
                                No, cancel
                              </Button>
                            </div>
                          </div>
                        </Modal.Body>
                      </Modal>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="infoMembersOfChannel">
              <h3 className="role">Owner</h3>

              <div className="ownerBox">
                {memberList.map((member, index) => (
                  <div className="" key={index}>
                    {member.role === "owner" && (
                      <div className="boxMember" key={index}>
                        <Image
                          src={
                            member.photo === "default_img"
                              ? ProfileImg.src
                              : member.photo
                          }
                          alt="member"
                          className="memberPhoto"
                          width={35}
                          height={35}
                        />
                        <p className="memberName">{member.nickname}</p>

                        {aboutMe &&
                          aboutMe.role === "member" &&
                          aboutMe.nickname !== member.nickname && (
                            <div className="memberSee">
                              <button
                                className="Challenge-btn"
                                onClick={() => handleChallenge(member.id, member.nickname)}
                              >
                                <i className="ri-ping-pong-line"> Challenge</i>
                              </button>
                            </div>
                          )}

                        {aboutMe &&
                          aboutMe.role === "admin" &&
                          aboutMe.nickname !== member.nickname && (
                            <div className="memberSee">
                              <button
                                className="Challenge-btn"
                                onClick={() => handleChallenge(member.id, member.nickname)}
                              >
                                <i className="ri-ping-pong-line"> Challenge</i>
                              </button>
                            </div>
                          )}

                        {aboutMe &&
                          aboutMe.role === "owner" &&
                          aboutMe.nickname !== member.nickname && (
                            <div className="memberSee">
                              <div className="selectOwnerOptions">
                                <select name="" id="">
                                  mok
                                </select>
                              </div>
                              <button
                                className="Challenge-btn"
                                onClick={() => handleChallenge(member.id, member.nickname)}
                              >
                                <i className="ri-ping-pong-line"> Challenge</i>
                              </button>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <h3 className="role">Admins</h3>

              <div className="listMembersOfChannel">
                {memberList.map((member, index) => (
                  <div className="" key={index}>
                    {member.role === "admin" && (
                      <div className="boxMember" key={index}>
                        <Image
                          src={
                            member.photo === "default_img"
                              ? ProfileImg.src
                              : member.photo
                          }
                          alt="member"
                          className="memberPhoto"
                          width={35}
                          height={35}
                        />
                        <p className="memberName">{member.nickname}</p>

                        {aboutMe &&
                          aboutMe.role === "member" &&
                          aboutMe.nickname !== member.nickname && (
                            <div className="memberSee">
                              <button className="Challenge-btn">
                                <i className="ri-ping-pong-line"> Challenge</i>
                              </button>
                            </div>
                          )}

                        {aboutMe &&
                          aboutMe.role === "admin" &&
                          aboutMe.nickname !== member.nickname && (
                            <div className="memberSee">
                              <button className="Challenge-btn">
                                <i className="ri-ping-pong-line">Challenge</i>
                              </button>
                            </div>
                          )}

                        {aboutMe &&
                          aboutMe.role === "owner" &&
                          aboutMe.nickname !== member.nickname && (
                            <div className="memberSee">
                              <Dropdown label="Dropdown" inline>
                                <Dropdown.Item
                                  className="text-[12px]"
                                  onClick={() => handleChallenge(member.id, member.nickname)}
                                >
                                  Challenge
                                </Dropdown.Item>
                                <Dropdown.Item
                                  className="text-[12px]"
                                  onClick={() => handleMute(member.id)}
                                >
                                  Mute
                                </Dropdown.Item>
                                <Dropdown.Item
                                  className="text-[12px]"
                                  onClick={() => handleKick(member.id)}
                                >
                                  Kick
                                </Dropdown.Item>
                                <Dropdown.Item
                                  className="text-[12px]"
                                  onClick={() => handleBan(member.id)}
                                >
                                  Ban
                                </Dropdown.Item>
                              </Dropdown>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <h3 className="role">Members</h3>

              <div className="listMembersOfChannel">
                {memberList.map((member, index) => (
                  <div className="" key={index}>
                    {member.role === "member" && (
                      <div className="boxMember" key={index}>
                        <Image
                          src={
                            member.photo === "default_img"
                              ? ProfileImg.src
                              : member.photo
                          }
                          alt="member"
                          className="memberPhoto"
                          width={35}
                          height={35}
                        />
                        <p className="memberName">{member.nickname}</p>

                        {aboutMe &&
                          aboutMe.role === "member" &&
                          aboutMe.nickname !== member.nickname && (
                            <div className="memberSee">
                              <button className="Challenge-btn">
                                <i className="ri-ping-pong-line"> Challenge</i>
                              </button>
                            </div>
                          )}

                        {aboutMe &&
                          aboutMe.role === "admin" &&
                          aboutMe.nickname !== member.nickname && (
                            <div className="memberSee">
                              <Dropdown label="Dropdown" inline>
                                <Dropdown.Item
                                  className="text-[12px]"
                                  onClick={() => handleChallenge(member.id, member.nickname)}
                                >
                                  Challenge
                                </Dropdown.Item>
                                <Dropdown.Item
                                  className="text-[12px]"
                                  onClick={() => handleMute(member.id)}
                                >
                                  Mute
                                </Dropdown.Item>
                                <Dropdown.Item
                                  className="text-[12px]"
                                  onClick={() => handleKick(member.id)}
                                >
                                  Kick
                                </Dropdown.Item>
                                <Dropdown.Item
                                  className="text-[12px]"
                                  onClick={() => handleBan(member.id)}
                                >
                                  Ban
                                </Dropdown.Item>
                              </Dropdown>
                            </div>
                          )}

                        {aboutMe &&
                          aboutMe.role === "owner" &&
                          aboutMe.nickname !== member.nickname && (
                            <div className="memberSee">
                              <Dropdown label="Dropdown" inline>
                                <Dropdown.Item
                                  className="text-[12px]"
                                  onClick={() => handleChallenge(member.id, member.nickname)}
                                >
                                  Challenge
                                </Dropdown.Item>
                                <Dropdown.Item
                                  className="text-[12px]"
                                  onClick={() => handleSettingAdmin(member.id)}
                                >
                                  Set Admin
                                </Dropdown.Item>
                                <Dropdown.Item
                                  className="text-[12px]"
                                  onClick={() => handleMute(member.id)}
                                >
                                  Mute
                                </Dropdown.Item>
                                <Dropdown.Item
                                  className="text-[12px]"
                                  onClick={() => handleKick(member.id)}
                                >
                                  Kick
                                </Dropdown.Item>
                                <Dropdown.Item
                                  className="text-[12px]"
                                  onClick={() => handleBan(member.id)}
                                >
                                  Ban
                                </Dropdown.Item>
                              </Dropdown>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="leave-btn">
              <button className="leaveChannel" onClick={handleLeaveChannel}>
                Leave Channel
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="noConversation">Join Your Channel</div>
      )}
    </>
  );
}
