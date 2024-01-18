import { useEffect, useState } from "react";

import FriendConversation from "./friendConversation";

import hic_avatar from "@/app/assets/svg/chat/hic_avatar.svg";
import mo_avatar from "@/app/assets/svg/chat/mo_avatar.svg";
import "../../(pages)/chat/chat.css";
import { friendSelected } from "@/app/utils/library/friendsSelected";
import { FriendsType } from "@/app/types/friendstype";
import Image from "next/image";
import { ChannelChatType } from "@/app/types/ChannelChatType";
import { GetChatConverssationType } from "@/app/types/getChatConverssation";
import lwaghch from "../../assets/svg/chat/lwaghch.svg";
import { ioClient } from "@/app/api/instance";
import Popup from "reactjs-popup";
import ProfileImg from "@/app/assets/svg/profileimg.svg";

import "reactjs-popup/dist/index.css";

import { HiOutlineExclamationCircle } from "react-icons/hi";
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
import { join_protected_channel } from "@/app/types/join_protected_channelType";
import { create_channel } from "@/app/types/createChannelType";
import toast, { Toaster } from "react-hot-toast";
import { on } from "events";
import { error } from "console";



export default function ChannelMessaged({
  onSelectChannel,
  online_rf,
  friends_rf,
  channel_rf,
  channelSelected_rf,
  members_rf,
  aboutMe_rf,
}: 
{
  onSelectChannel: (id: ChannelChatType) => void;
  online_rf: boolean;
  friends_rf: boolean;
  channel_rf: boolean;
  channelSelected_rf: boolean;
  members_rf: boolean;
  aboutMe_rf: boolean;
 
}) {
  const [channel, setChannel] = useState<ChannelChatType[]>([]);
  const [searching, setSearching] = useState("");
  const [openModalPublic, setOpenModalPublic] = useState(false);
  const [openModalProtected, setOpenModalProtected] = useState(false);
  const [openModalCreateChannel, setOpenModalCreacteChannel] = useState(false);
  const [channelSelected, setChannelSelected] = useState<ChannelChatType>();
  const [join_protected_channel, setJoin_protected_channel] =
    useState<join_protected_channel>();
  const [statuspwd, setStatuspwd] = useState<string>("");
  const [statusJoinChannel, setStatusJoinChannel] = useState<boolean>(false);

  const [statusCreateChannel, setStatusCreateChannel] =
    useState<boolean>(false);
  const [newChannel, setNewChannel] = useState<create_channel>({
    name: "",
    password: "",
    type: "",
  });
  const [new_nameChannel, setNew_nameChannel] = useState<string>("");
  const [new_passwordChannel, setNew_passwordChannel] = useState<string>("");
  const [new_typeChannel, setNew_typeChannel] = useState<string>("");
  
  const [selectedImage, setSelectedImage] = useState<File>();

  
  const filterSearch = () => {
    if (!searching) {
      return channel;
    }
    return channel.filter((item) =>
      item.nameOfChannel.toLowerCase().includes(searching.toLowerCase())
    );
  };

  useEffect(() => {}, ["mok protcd", openModalProtected]);

  const filter_Search = filterSearch();

  
  useEffect(() => {
    const client = ioClient.getSocketClient();
    async function fetcher() {
      const getChannel = await fetch(
        `http://${process.env.NEXT_PUBLIC_HOST}:3001/chat/list_channels`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (!getChannel.ok) {
        throw new Error("Network response was not ok");
      }
      const channels: ChannelChatType[] = await getChannel.json();
      channels.forEach((channel) => {
        if (channel.isJoined) client.emit("join", { channel_id: channel.id });
      });
      setChannel(channels);
    }
    fetcher();
  }, [channel_rf]);

  const joinPublicChannel = async (channel_id: string, name: string) => {
    
   
    const getChannel = await fetch(
      `http://${process.env.NEXT_PUBLIC_HOST}:3001/chat/join_public/${channel_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (!getChannel.ok) {
      setStatusJoinChannel(false);
    }
    if (getChannel.ok) {
     
    
      setStatusJoinChannel(true);
      setChannelSelected(undefined);
      setOpenModalPublic(false);
    }
    
  };

  const checkPassword = async (channel_protected: join_protected_channel) => {
    const getChannel = await fetch(
      `http://${process.env.NEXT_PUBLIC_HOST}:3001/chat/join_protected`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: channel_protected.id,
          password: channel_protected.password,
        }),
      }
    );
    if (!getChannel.ok) {
     
     
      setStatuspwd("false");
    }
    if (getChannel.ok) {
      setStatuspwd("true");
      setJoin_protected_channel({
        id: "",
        password: "",
      });
      setChannelSelected(undefined);
      setOpenModalProtected(false);
    }
  };

  const handleCreateChannel = async (newChannel: create_channel) => {
    const getChannel = await fetch(
      `http://${process.env.NEXT_PUBLIC_HOST}:3001/chat/create_channel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newChannel),
      }
    );
    if (!getChannel.ok) {
      setStatusCreateChannel(false);
    }
    if (getChannel.ok) {
      setNew_passwordChannel("");
      setNew_typeChannel("");
     
      setSelectedImage(undefined);
      setNew_nameChannel("");
      setNewChannel({ name: "", password: "", type: "" });
      setOpenModalCreacteChannel(false);
      setStatusCreateChannel(true);
    }
  };

  async function handlImageChange() {
    const formData = new FormData();
    let checkItem: string = "";
    formData.append("file", selectedImage ?? "https://placehold.co/400");
    formData.forEach((item) => (checkItem = item.toString()));
    if (selectedImage) {
      const toastId = toast.loading("Saving changes", {
        style: {
          backgroundColor: "#383546",
          color: "white",
        },
      });
      const putted = await PutImage(formData);
      toast.success("Saved", {
        id: toastId,
        style: {
          backgroundColor: "#383546",
          color: "white",
        },
      });
    }
  }

  async function PutImage(formData: FormData) {
    const response = await fetch(
      `http://${process.env.NEXT_PUBLIC_HOST}:3001/chat/channel_photo/${new_nameChannel}`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );
    if (!response.ok) {
    } else {
    }
  }

  const handleNewChannel = (newchnl: create_channel) => {
    setNewChannel(newchnl);
  };

 

  return (
    <>
      <div className="channelMessaged">
        <div className="searchBar ">
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => setSearching(e.target.value)}
            className="bg-[#383546] text-white w-[90%] h-[30px] rounded-md pl-2"
          />
        </div>
        <ul className="friendsscroll">
          {filterSearch().map((channel) => (
            <li className="friend" key={channel.nameOfChannel}>
              <div
                className="selectFriend w-[100%]"
                onClick={() => {
                 
                  if (channel.isJoined) onSelectChannel(channel);
                 
               
                }}
              >
                <div className="listFriends">
                  <Image
                    src={
                      channel.photo === "default_img"
                        ? ProfileImg.src
                        : channel.photo
                    }
                    width={45}
                    height={45}
                    alt={channel.nameOfChannel}
                    className="rounded-full"
                  />
                  <h4 className="text-[14px] pl-2 pt-1">
                    {channel.nameOfChannel}
                  </h4>
                 
                  {channel.isJoined === false ? (
                    <>
                     
                      <button
                        className="isJoined"
                        onClick={() => {
                          
                          {
                            if (channel.type === "PUBLIC") {
                              setChannelSelected(channel);
                              setOpenModalPublic(true);
                            } else if (channel.type === "PROTECTED") {
                              setChannelSelected(channel);
                              setOpenModalProtected(true);
                            }
                          }
                         
                        }}
                      >
                        Join
                      </button>
                      {channel && channel.type === "PUBLIC" && (
                        <Modal
                          show={openModalPublic}
                          size="md"
                          onClose={() => {
                            setOpenModalPublic(false);
                            // setStatusJoinChannel(false);
                            setChannelSelected(undefined);
                          }}
                          popup
                        >
                          <Modal.Header />
                          <Modal.Body>
                            <div className="text-center">
                             
                              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                {`You want to join `}
                                <span className="text-[#E95A3A]">
                                  {channelSelected &&
                                    channelSelected.nameOfChannel}
                                </span>
                                {` channel?`}
                              </h3>
                              <div className="flex justify-center gap-10 mt-5">
                                <Button
                                  className="bg-[#E95A3A] w-[100px] h-[40px]"
                                  onClick={() => {
                                    if (channelSelected)
                                      joinPublicChannel(
                                        channelSelected.id,
                                        channelSelected.nameOfChannel
                                      );
                                  }}
                                >
                                  {"Yes"}
                                </Button>
                                <Button
                                  className="bg-gray-500 w-[100px] h-[40px]"
                                  onClick={() => {
                                    setOpenModalPublic(false);
                                    setStatusJoinChannel(false);
                                    setChannelSelected(undefined);
                                  }}
                                >
                                  {"No,cancel"}
                                </Button>
                              </div>
                            </div>
                          </Modal.Body>
                        </Modal>
                      )}
                     
                      {channel && channel.type === "PROTECTED" && (
                        <Modal
                          show={openModalProtected}
                          size="md"
                          onClose={() => {
                            setOpenModalProtected(false);
                            setStatuspwd("");
                            setChannelSelected(undefined);
                          }}
                          popup
                        >
                          <Modal.Header />
                          <Modal.Body>
                            <div className="text-center">
                              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                This channel is protected, please enter the
                                password
                              </h3>
                           
                              <div>
                                <div className="mb-2 block">
                                  <Label
                                    htmlFor="password"
                                    color={
                                      statuspwd === "true"
                                        ? "success"
                                        : statuspwd === "false"
                                        ? "failure"
                                        : "info"
                                    }
                                    value={
                                      statuspwd === "true"
                                        ? "Correct password"
                                        : statuspwd === "false"
                                        ? "Wrong password"
                                        : "Enter password"
                                    }
                                  />
                                </div>
                                <TextInput
                                  id="password"
                                  placeholder="password"
                                  required
                                  className="text-[#000]"
                                  onChange={(event) =>
                                    channelSelected &&
                                    setJoin_protected_channel({
                                      id: channelSelected.id,
                                      password: event.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <div className="checkPwd">
                                  <Button
                                   
                                    className="bg-[#E95A3A] mr-4"
                                    onClick={() => {
                                      join_protected_channel &&
                                        checkPassword(join_protected_channel);
                                      if (statuspwd === "true") {
                                        setOpenModalProtected(false);
                                        setStatuspwd("");
                                        setChannelSelected(undefined);
                                      }
                                    }}
                                  >
                                    {"Validate"}
                                  </Button>
                                  <Button
                                    color="gray"
                                    className="ml-4"
                                    onClick={() => {
                                      setOpenModalProtected(false);
                                      setStatuspwd("");
                                      setChannelSelected(undefined);
                                    }}
                                  >
                                    cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Modal.Body>
                        </Modal>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="createChannel">
        <Button
          onClick={() => setOpenModalCreacteChannel(true)}
          className="bg-[#E95A3A]"
        >
          Create a channel
        </Button>
        <Modal
          show={openModalCreateChannel}
          size="4xl"
          onClose={() => {
            setOpenModalCreacteChannel(false);
            setNew_passwordChannel("");
            setNew_typeChannel("");
            setSelectedImage(undefined);
            setNew_nameChannel("");
            setNewChannel({ name: "", password: "", type: "" });
            
          }}
          popup
        >
          <Modal.Header />
          <Modal.Body>
            <div className="text-center">
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                Complete the form to create your channel
              </h3>
              <div className="grid grid-flow-col justify-stretch space-x-4">
                <FloatingLabel
                  variant="outlined"
                  label="Name of channel"
                  color="default"
                  onChange={(event) => {
                    setNew_nameChannel(event.target.value);
                    handleNewChannel({
                      name: new_nameChannel,
                      password: new_passwordChannel,
                      type: new_typeChannel,
                    });
                  }}
                />

                <div>
                  <FileInput
                    accept="image/png, image/jpeg, image/jpg"
                    id="profile-img"
                    onChange={(e) => {
                      e.preventDefault();
                      if (e.target.files) {
                        const file = e.target.files[0];
                        if (e.target.files.length > 0) {
                          setSelectedImage(file);
                        }
                      }
                    }}
                  />
                </div>
              </div>
              <div className="max-w-md lastInput ">
               
                <Dropdown
                  className=""
                  label={`Type of Channel: ${new_typeChannel}`}
                  dismissOnClick={false}
                >
                  <Dropdown.Item
                    className="typeChannelSelect"
                    onClick={() => {
                      setNew_typeChannel("PUBLIC");
                      handleNewChannel({
                        name: new_nameChannel,
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
                      setNew_typeChannel("PRIVATE");
                      handleNewChannel({
                        name: new_nameChannel,
                        password: new_passwordChannel,
                        type: "PRIVATE",
                      });
                    }}
                  >
                    Private
                  </Dropdown.Item>
                  <Dropdown.Item
                    className="typeChannelSelect"
                    onClick={() => {
                      setNew_typeChannel("PROTECTED");
                      handleNewChannel({
                        name: new_nameChannel,
                        password: new_passwordChannel,
                        type: "PROTECTED",
                      });
                    }}
                  >
                    Protected
                  </Dropdown.Item>
                </Dropdown>
                {new_typeChannel && new_typeChannel === "PROTECTED" && (
                  <div className="mb-2 mt-2">
                    <FloatingLabel
                      className="pswdInput"
                      variant="outlined"
                      label="Password"
                      color="default"
                      onChange={(pwd) => {
                        setNew_passwordChannel(pwd.target.value);
                        handleNewChannel({
                          name: new_nameChannel,
                          password: new_passwordChannel,
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
                   

                    handleCreateChannel({
                      name: new_nameChannel,
                      password: new_passwordChannel,
                      type: new_typeChannel,
                    });
                    handlImageChange();
                  }}
                >
                  {"Create"}
                </Button>
                <Button
                  color="gray"
                  onClick={() => {
                    setOpenModalCreacteChannel(false);
                    setNew_passwordChannel("");
                    setNew_typeChannel("");
                  
                    setSelectedImage(undefined);
                    setNewChannel({ name: "", password: "", type: "" });
                    setNew_nameChannel("");
                  }}
                >
                  No, cancel
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
}
