export interface ServerType {
  id: string
  name: string
  description: string
  tags: string[]
  members: number
  online?: number
  upvotes: number
  icon?: string
  banner?: string
  featured: boolean
  createdAt: string
  owner?: string
  website?: string
  inviteUrl?: string
  longDescription?: string
  rules?: string[]
  features?: string[]
  screenshots?: string[]
}

export interface CategoryType {
  id: string
  name: string
  color: string
  selected: boolean
}

export interface BotType {
  id: string
  name: string
  description: string
  tags: string[]
  servers: number
  users: number
  upvotes: number
  icon?: string
  banner?: string
  featured: boolean
  createdAt: string
  prefix?: string
  developer?: string
  website?: string
  inviteUrl?: string
  supportServer?: string
  verified: boolean
  longDescription?: string
  commands?: BotCommand[]
  features?: string[]
  screenshots?: string[]
}

export interface BotCommand {
  name: string
  description: string
  usage: string
  category?: string
}

export interface UserType {
  id: string
  username: string
  email: string
  avatar?: string
  banner?: string
  bio?: string
  joinedAt: string
  servers: ServerType[]
  bots: BotType[]
  favorites: {
    servers: string[]
    bots: string[]
  }
  social: {
    discord?: string
    twitter?: string
    github?: string
    website?: string
  }
}

