import dynamic from "next/dynamic"
import Image from "next/image"
import type { TweetComponents } from "react-tweet"

const ReactTweet = dynamic(async () => (await import("react-tweet")).Tweet)

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
