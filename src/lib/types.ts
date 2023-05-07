import type { CharacterEntity, NoteEntity } from "crossbell.js"

export type Site = {
  id: string
  name: string
  subdomain: string
  icon?: string | null
}

export type SiteSubscription = {
  email?: boolean
}

export type Viewer = {
  id: string
  name: string
  username: string
  email: string
  avatar?: string | null
}

export enum PageVisibilityEnum {
  All = "all",
  Published = "published",
  Scheduled = "scheduled",
  Draft = "draft",
  Modified = "published and local modified",
}

export type PostOnSiteHome = {
  id: string
  title: string
  excerpt?: string | null
  autoExcerpt?: string | null
  slug: string
  publishedAt: string | Date
}

export type Paginated<T> = {
  nodes: T[]
  total: number
  hasMore: boolean
}

export type Page = {
  id: string
  title: string
  excerpt: string
  permalink: string
  publishedAt: Date
  published: boolean
}

export type PostOnArchivesPage = {
  id: string
  title: string
  slug: string
  publishedAt: string | Date
}

/**
 * The subscribe form data to store in loginToken
 */
export type SubscribeFormData = {
  email?: boolean
  siteId: string
}

export type SiteNavigationItem = {
  id: string
  label: string
  url: string
}

export type ExpandedNote = NoteEntity & {
  draftKey?: string
  metadata: {
    content: {
      summary?: string
      cover?: string
      frontMatter?: Record<string, any>
      slug?: string
      views?: number
      audio?: string
      score?: {
        number?: number
        reason?: string
      }
    }
  }
  stat?: {
    viewDetailCount: number
    hotScore?: number
  }
  local?: boolean
}

export type ExpandedCharacter = CharacterEntity & {
  metadata: {
    content: {
      navigation?: SiteNavigationItem[]
      css?: string
      ga?: string
      ua?: string
      custom_domain?: string
    }
  }
}
