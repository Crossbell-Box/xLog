import type { Transformer } from "../rehype-embed"
import { CodeSandboxTransformer } from "./CodeSandBox"
import { GithubRepoTransformer } from "./Github"
import { MetingAudioTransformer } from "./MetingAudio"
import { TweetTransformer } from "./Tweet"
import { YoutubeTransformer } from "./Youtube"

export const transformers: Transformer[] = [
  CodeSandboxTransformer,
  TweetTransformer,
  GithubRepoTransformer,
  YoutubeTransformer,
  MetingAudioTransformer,
]
