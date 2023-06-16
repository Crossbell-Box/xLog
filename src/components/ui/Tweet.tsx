import Image from "next/image"
import type { TweetComponents } from "react-tweet"

const components: TweetComponents = {
  AvatarImg: (props) => <Image {...props} alt="avatar" />,
  MediaImg: (props) => <Image {...props} fill unoptimized alt="tweet-media" />,
}

export default async function Tweet({ id }: { id: string }) {
  const { Tweet: ReactTweet } = await import("react-tweet")

  return (
    <div className="flex justify-center">
      <ReactTweet id={id} components={components} />
    </div>
  )
}
