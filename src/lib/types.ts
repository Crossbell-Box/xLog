import type { Note as UniNote, Profile as UniProfile } from "unidata.js"

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

export type Note = UniNote & {
  slug?: string
  character?: Profile
}

export type Notes = {
  total: number
  list: Note[]
}

export type Profile = UniProfile & {
  navigation?: SiteNavigationItem[]
  css?: string
  ga?: string
  custom_domain?: string
}

export type Profiles = {
  total: number
  list: Note[]
}
