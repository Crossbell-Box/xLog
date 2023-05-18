import type { Transformer } from "../rehype-embed"
import { CodeSandboxTransformer } from "./CodeSandBox"
import { GithubRepoTransformer } from "./Github"
import { MetingMusicTransformer } from "./MetingMusic"
import { TweetTransformer } from "./Tweet"
import { YoutubeTransformer } from "./Youtube"

export const transformers: Transformer[] = [
  CodeSandboxTransformer,
  TweetTransformer,
  GithubRepoTransformer,
  YoutubeTransformer,
  MetingMusicTransformer,
]
