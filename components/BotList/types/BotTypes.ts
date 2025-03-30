export interface Bot {
    name: string;
    description: string;
    tags: string[];
    votes: number;
    status: string;
    servers: number;
    isVerified: boolean;
  }