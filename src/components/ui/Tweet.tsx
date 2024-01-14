import dynamic from "next/dynamic"
import Image from "next/image"
import type { TwitterComponents } from "react-tweet"

import { SITE_URL } from "~/lib/env"

const ReactTweet = dynamic(async () => (await import("react-tweet")).Tweet)

const components: TwitterComponents = {
  AvatarImg: (props) => <Image {...props} alt="avatar" />,
  MediaImg: (props) => <Image {...props} fill unoptimized alt="tweet-media" />,
}

export default function Tweet({ id }: { id: string }) {
  return (
    <div className="flex justify-center">
      <ReactTweet
        id={id}
        components={components}
        apiUrl={`${SITE_URL}/api/tweet?id=${id}`}
      />
    </div>
  )
}
