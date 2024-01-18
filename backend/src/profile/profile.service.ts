import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getMainData(userId: string): Promise<{}> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        }
      });
      const profile = await this.prisma.profile.findUnique({
        where: {
          userID: userId,
        }
      });
      if (!user || !profile)
        return {};
      const data = await {
        id: user.id,
        full_name: user.full_name,
        nickName: user.nickName,
        is_active: user.is_active,
        last_activity: user.last_activity,
        photo_path: profile.photo_path,
        friend_number: profile.friend_number,
        level: profile.level,
      };
      return data;
    }
    catch (err) {
      return ;
    }
  }

  async getGameHistoryData(userId: string): Promise<any> {
    try {
      const game = await this.prisma.games_history.findMany({
        where: {
          player_id: userId,
        }
      });
      if (!game.length)
        return [];
      for (let i = 0; i < game.length; i++)
        game[i]['opponent_data'] = await this.getOtherUserData(game[i].opponent_id);
      return game;
    }
    catch (err) {
      return ;
    }
  }


  async getOtherUserData(userId: string): Promise<any> {
    try {
      const opponent = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          full_name: true,
          nickName: true,
          is_active: true,
        }
      });
      const profile = await this.prisma.profile.findUnique({
        where: {
          userID: userId,
        },
        select: {
          photo_path: true,
        }
      })
      if (!opponent || !profile)
        return [];
      const data = await {
        id: opponent.id,
        full_name: opponent.full_name,
        nickName: opponent.nickName,
        is_active: opponent.is_active,  
        photo_path: profile.photo_path,
      };
      return data;
    }
    catch (err) {
      return ;
    }
  }

  async getStatusGameData(userId: string): Promise<{}> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        }
      });
      if (!user)
        return {};
      const data = await {
        games: user.games,
        win: user.win,
        lose: user.lose
      };
      return data;
    }
    catch (err) {
      return ;
    }
  }

  async getAchievementData(userId: string): Promise<{}> {
    try {
      const commingData = await this.prisma.achievement.findUnique({
        where: {
          user_id: userId
        }
      });
      if (!commingData)
        return {};
      return commingData;
    }
    catch (err) {
      return ;
    }
  }

  async getFriendsData(userId: string): Promise<any> {
    try {
      const data = [];
      const commingData = await this.prisma.friendship.findMany({
        where: {
          userId,
        },
        select: {
          friendId: true,
        }
      });
      if (!commingData.length)
        return [];
      for (let i = 0; i < commingData.length; i++) {
        await data.push(await this.getOtherUserData(commingData[i].friendId));
      }
      return data;
    }
    catch (err) {
      return ;
    }
  }

  async getAllUsersData(userId: string): Promise<{}> {
    try {
      const img = await this.prisma.profile.findMany({
        select: {
          userID: true,
          photo_path: true,
        }
      });
      const commingData = await this.prisma.user.findMany({
        select: {
          id: true,
          full_name: true,
          nickName: true,
        }
      });
      if (!img.length || !commingData.length)
        return [];
      commingData.forEach((data) => {
        data['photo_path'] = img.find((elem) => (elem.userID === data.id)).photo_path;
      })
      return commingData;
    }
    catch (err) {
      return ;
    }
  }

  async addFriendData(idUserDb: string, idUserToAdd: string): Promise<{}> {
    try {
      if (idUserDb === idUserToAdd)
        throw new ConflictException('User can\'t be friend with it\'s self');
      const count = await this.prisma.friendship.count({
        where: {
          userId: idUserToAdd,
          friendId: idUserDb
        }
      });
      if (count)
        throw new ConflictException('Already friends');
      const commingData = await this.prisma.friendship.createMany({
        data: [
          {
            createdAt: new Date(),
            userId: idUserToAdd,
            friendId: idUserDb
          },
          {
            createdAt: new Date(),
            userId: idUserDb,
            friendId: idUserToAdd
          }
        ]
      });
      const userone = await this.prisma.profile.update({
        where: {
          userID: idUserDb
        },
        data: {
          friend_number: {
            increment: 1,
          }
        }
      });
      const usertwo = await this.prisma.profile.update({
        where: {
          userID: idUserToAdd
        },
        data: {
          friend_number: {
            increment: 1,
          }
        }
      });
      const achuserone = await this.prisma.achievement.update({
        where: {
          user_id: idUserDb
        },
        data: {
          social: userone.friend_number ? true : false,
        }
      });
      const achusertwo = await this.prisma.achievement.update({
        where: {
          user_id: idUserToAdd
        },
        data: {
          social: usertwo.friend_number ? true : false,
        }
      });
      return { status: "Success" };
    }
    catch (err) {
      return ;
    }
  }

  async removeFriendData(idUserDb: string, idUserToAdd: string): Promise<{}> {
    try {
      const search = await this.prisma.friendship.findMany();
      search.forEach( async (data) =>  {
        if (((data.userId === idUserDb) || (data.userId === idUserToAdd)) &&
           ((data.friendId === idUserDb) || (data.friendId === idUserToAdd))) {
          await this.prisma.friendship.delete({
            where: {
              id: data.id
            }
          });
          await this.prisma.profile.update({
            where: {
              userID: data.userId
            },
            data: {
              friend_number: {
                decrement: 1,
              }
            }
          });
        }
      });
    }
    catch (err) {
      return ;
    }
  
    return { status: 'Success' };
  }
}
