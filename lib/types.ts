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
}

export interface CategoryType {
  id: string
  name: string
  color: string
  selected: boolean
}

