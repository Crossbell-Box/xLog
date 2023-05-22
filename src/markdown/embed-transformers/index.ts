import type { Transformer } from "../rehype-embed"
import { BilibiliTransformer } from "./Bilibili"
import { CodeSandboxTransformer } from "./CodeSandBox"
import { GitHubRepoTransformer } from "./GitHub"
import { NetEaseMusicTransformer } from "./NetEaseMusic"
import { TweetTransformer } from "./Tweet"
import { YouTubeTransformer } from "./YouTube"

export const transformers: Transformer[] = [
  CodeSandboxTransformer,
  TweetTransformer,
  GitHubRepoTransformer,
  YouTubeTransformer,
  NetEaseMusicTransformer,
  BilibiliTransformer,
]
