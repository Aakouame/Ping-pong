import { useEffect, useState } from "react";

import FriendConversation from "./friendConversation";

import hic_avatar from "@/app/assets/svg/chat/hic_avatar.svg";
import mo_avatar from "@/app/assets/svg/chat/mo_avatar.svg";
import "../../(pages)/chat/chat.css";
import { friendSelected } from "@/app/utils/library/friendsSelected";
import { FriendsType } from "@/app/types/friendstype";
import Image from "next/image";
import { FriendsChatType } from "@/app/types/friendsChatType";
import { GetChatConverssationType } from "@/app/types/getChatConverssation";
import ProfileImg from "@/app/assets/svg/profileimg.svg";



export default function FriendsMessaged({
  onSelectFriend,
  online_rf,
  friends_rf,
  channel_rf,
  channelSelected_rf,
  members_rf,
  aboutMe_rf,
}: {
  onSelectFriend: (friendSelected: FriendsChatType) => void;
  online_rf: boolean;
  friends_rf: boolean;
  channel_rf: boolean;
  channelSelected_rf: boolean;
  members_rf: boolean;
  aboutMe_rf: boolean;
}) {
  const [friends, setFriends] = useState<FriendsChatType[]>([]);
  const [searching, setSearching] = useState("");

 
  const filterSearch = () => {
    if (!searching) {
      return friends;
    }
    return friends.filter((item) =>
      item.nickname.toLowerCase().includes(searching.toLowerCase())
    );
  };

  const filter_Search = filterSearch();
  
  useEffect(() => {
    async function fetcher() {
      const getFriends = await fetch(`http://${process.env.NEXT_PUBLIC_HOST}:3001/chat/conv`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!getFriends.ok) {
        throw new Error("Network response was not ok");
      }
      setFriends(await getFriends.json());
    }
    fetcher();
  }, []);

  return (
    <>
      <div className="friendsMessaged">
        <div className="searchBar ">
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => setSearching(e.target.value)}
            className="bg-[#383546] text-white w-[90%] h-[30px] rounded-md pl-2"
          />
        </div>
        <ul className="friendsscroll">
          {filterSearch().map((friend) => (
            <li className="friend" key={friend.nickname}>
              <button
                className="selectFriend w-[100%]"
                onClick={() => {
                 
                  onSelectFriend(friend);
                
                }}
              >
                <div className="listFriends">
                  <Image
                    src={
                      friend.photo === "default_img"
                        ? ProfileImg.src
                        : friend.photo
                    }
                    width={45}
                    height={45}
                    alt={friend.nickname}
                    className="rounded-full"
                  />
                  <h4 className="text-[14px] pl-2 pt-1">{friend.nickname}</h4>
                
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
