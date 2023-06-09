import Image from "next/image"
import { Tweet as ReactTweet } from "react-tweet"
import type { TweetComponents } from "react-tweet"

const components: TweetComponents = {
  AvatarImg: (props) => <Image {...props} alt="avatar" />,
  MediaImg: (props) => <Image {...props} fill unoptimized alt="tweet-media" />,
}

export default function Tweet({ id }: { id: string }) {
  return (
    <div className="flex justify-center">
      <ReactTweet id={id} components={components} />
    </div>
  )
}
