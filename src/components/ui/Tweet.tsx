import Image from "next/image"
import { Tweet as ReactTweet } from "react-tweet"
import type { TweetComponents } from "react-tweet"

const components: TweetComponents = {
  AvatarImg: (props) => <Image {...props} />,
  MediaImg: (props) => <Image {...props} fill unoptimized />,
}

export function Tweet({ id }: { id: string }) {
  return <ReactTweet id={id} components={components} />
}
