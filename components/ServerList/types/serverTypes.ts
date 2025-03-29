export interface Server {
    name: string;
    description: string;
    tags: string[];
    members: number;
    likes: number;
    rank: number;
    event?: {
      start: string;
      end: string;
      status: string;
      creator: string;
      reward: string;
    };
  }