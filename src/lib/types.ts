import type { CharacterEntity, NoteEntity } from "crossbell"

export type Language = Readonly<"en" | "zh" | "zh-TW" | "ja">

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

export type PagesSortTypes = "latest" | "hottest" | "commented"

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

export type PortfolioStats = {
  videoViewsCount?: number
  audioListensCount?: number
  projectStarsCount?: number
  textViewsCount?: number
  commentsCount?: number
}

export type ExpandedNote = NoteEntity & {
  draftKey?: string
  metadata: {
    content: {
      summary?: string
      cover?: string
      images?: string[]
      imageDimensions?: Record<string, { width: number; height: number }>
      frontMatter?: Record<string, any>
      slug?: string
      audio?: string
      score?: {
        number?: number
        reason?: string
      }
      contentHTML?: string
      disableAISummary?: boolean
      readingTime?: number
      translatedFrom?: Language
      translatedTo?: Language
    }
  }
  stat?: {
    viewDetailCount?: number
    hotScore?: number
    portfolio?: PortfolioStats
    commentsCount?: number
    likesCount?: number
  }
  local?: boolean
}

export type ExpandedCharacter = CharacterEntity & {
  metadata: {
    content: {
      footer?: string
      navigation?: SiteNavigationItem[]
      css?: string
      ga?: string
      ua?: string
      uh?: string
      custom_domain?: string
      site_name?: string
    }
  }
}

export type ColorScheme = "dark" | "light"

export type NoteType = "post" | "page" | "portfolio" | "short"

export type EditorValues = {
  title?: string
  publishedAt?: string
  published?: boolean
  excerpt?: string
  slug?: string
  tags?: string
  content?: string
  cover?: {
    address?: string
    mime_type?: string
  }
  disableAISummary?: boolean
  externalUrl?: string
  images?: {
    address?: string
    mime_type?: string
  }[]
}
