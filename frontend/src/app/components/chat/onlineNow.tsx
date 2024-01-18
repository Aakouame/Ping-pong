import { NeuePlakFont } from "@/app/utils/NeuePlakFont";
import { useEffect, useState } from "react";

import hic_avatar from "@/app/assets/svg/chat/hic_avatar.svg";
import mo_avatar from "@/app/assets/svg/chat/mo_avatar.svg";
import "../../(pages)/chat/chat.css";
import Image from "next/image";
import { isOnlineType } from "@/app/types/isOnlineType";
import ProfileImg from "@/app/assets/svg/profileimg.svg";


export default function OnlineNow({
  online_rf,
  friends_rf,
  channel_rf,
  channelSelected_rf,
  members_rf,
  aboutMe_rf,
}:
  {
    online_rf: boolean;
    friends_rf: boolean;
    channel_rf: boolean;
    channelSelected_rf: boolean;
    members_rf: boolean;
    aboutMe_rf: boolean;
  }) {
  const [friends, setFriends] = useState<isOnlineType[]>([]);

   useEffect( () => {
     	async function fetcher() {
     	  const getconv = await fetch(
     	    `http://${process.env.NEXT_PUBLIC_HOST}:3001/chat/friends_state/`,
     	    {
     	      method: "GET",
     	      headers: {
     	        "Content-Type": "application/json",
     	      },
     	      credentials: "include",
     	    }
     	  );
     	  if (!getconv.ok) {
     	  }
  	  const data = await getconv.json();

     	  setFriends(data);
     	}
     	fetcher();
   }, [online_rf]);

  const onlineFriends = (friends.filter(
    (friend) => friend.is_active !== "offline")
  );

  return (
    <div className="onlineNow">
      <h2>Online Friends</h2>
      <div className="onlineList">
        {onlineFriends.length > 0 ? (
          onlineFriends.map((friend) => (
            <button className="btnOnlineNow" key={friend.id}>
              <div
                className="onlineUser text-[10px] text-center p-1 "
                key={friend.id}
              >
                {friend.is_active === "online" && <span className="text-teal-500"> {friend.is_active} </span>}
                {friend.is_active === "at game" && <span className="text-teal-300"> {friend.is_active} </span>}
                {friend.photo_path !== "default_img" ? (
                  <Image
                    src={friend.photo_path}
                    alt={friend.nickName}
                    width={50}
                    height={50}
                    className="w-[50px] rounded-full"
                  />
                ) : (
                  <Image
                    src={ProfileImg.src}
                    alt={friend.nickName}
                    width={50}
                    height={50}
                    className="w-[50px] rounded-full"
                  />
                )}
                <span> {friend.nickName} </span>
              </div>
            </button>
          ))
        ) : (
          <div className="noOnlineFriends">No one is online !</div>
        )}
      </div>
    </div>
  );
}
