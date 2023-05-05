import { Tweet as ReactTweet } from "react-tweet"

export function Tweet({ id }: { id: string }) {
  return <ReactTweet id={id} />
}
