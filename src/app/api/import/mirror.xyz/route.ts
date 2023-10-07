import { getDefaultSlug } from "~/lib/default-slug"
import { getQuery, NextServerResponse } from "~/lib/server-helper"

export async function GET(req: Request) {
  const { address } = getQuery(req)

  const result = await (
    await fetch("https://mirror.xyz/api/graphql", {
      headers: {
        "content-type": "application/json",
        Referer: `https://mirror.xyz/${address}/`,
        origin: "https://mirror.xyz",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      },
      body: `{"operationName":"ProjectPage","variables":{"projectAddress":"${address}","limit":1000},"query":"query ProjectPage($projectAddress: String\u0021, $limit: Int, $cursor: Int) {\\n  projectFeed(projectAddress: $projectAddress, limit: $limit, cursor: $cursor) {\\n    _id\\n    domain\\n    ens\\n    theme {\\n      accent\\n      colorMode\\n      __typename\\n    }\\n    displayName\\n    ens\\n    address\\n    ...projectPage\\n    ...publicationLayoutProject\\n    __typename\\n  }\\n}\\n\\nfragment projectPage on ProjectType {\\n  _id\\n  address\\n  avatarURL\\n  description\\n  displayName\\n  domain\\n  ens\\n  theme {\\n    accent\\n    colorMode\\n    __typename\\n  }\\n  headerImage {\\n    id\\n    url\\n    __typename\\n  }\\n  posts {\\n    ... on crowdfund {\\n      _id\\n      id\\n      __typename\\n    }\\n    ... on entry {\\n      _id\\n      id\\n      body\\n      digest\\n      title\\n      publishedAtTimestamp\\n      writingNFT {\\n        _id\\n        optimisticNumSold\\n        proxyAddress\\n        purchases {\\n          numSold\\n          __typename\\n        }\\n        __typename\\n      }\\n      featuredImage {\\n        mimetype\\n        url\\n        __typename\\n      }\\n      publisher {\\n        ...publisherDetails\\n        __typename\\n      }\\n      settings {\\n        ...entrySettingsDetails\\n        __typename\\n      }\\n      __typename\\n    }\\n    ... on SubscriberEditionType {\\n      _id\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment publisherDetails on PublisherType {\\n  project {\\n    ...projectDetails\\n    __typename\\n  }\\n  member {\\n    ...projectDetails\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment projectDetails on ProjectType {\\n  _id\\n  address\\n  avatarURL\\n  description\\n  displayName\\n  domain\\n  ens\\n  gaTrackingID\\n  mailingListURL\\n  headerImage {\\n    ...mediaAsset\\n    __typename\\n  }\\n  theme {\\n    ...themeDetails\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment mediaAsset on MediaAssetType {\\n  id\\n  cid\\n  mimetype\\n  sizes {\\n    ...mediaAssetSizes\\n    __typename\\n  }\\n  url\\n  __typename\\n}\\n\\nfragment mediaAssetSizes on MediaAssetSizesType {\\n  og {\\n    ...mediaAssetSize\\n    __typename\\n  }\\n  lg {\\n    ...mediaAssetSize\\n    __typename\\n  }\\n  md {\\n    ...mediaAssetSize\\n    __typename\\n  }\\n  sm {\\n    ...mediaAssetSize\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment mediaAssetSize on MediaAssetSizeType {\\n  src\\n  height\\n  width\\n  __typename\\n}\\n\\nfragment themeDetails on UserProfileThemeType {\\n  accent\\n  colorMode\\n  __typename\\n}\\n\\nfragment entrySettingsDetails on EntrySettingsType {\\n  description\\n  metaImage {\\n    ...mediaAsset\\n    __typename\\n  }\\n  title\\n  __typename\\n}\\n\\nfragment publicationLayoutProject on ProjectType {\\n  _id\\n  avatarURL\\n  displayName\\n  domain\\n  address\\n  ens\\n  gaTrackingID\\n  mailingListURL\\n  description\\n  __typename\\n}\\n"}`,
      method: "POST",
    })
  ).json()

  if (result.data?.projectFeed?.posts?.length) {
    result.data.projectFeed.posts = result.data.projectFeed.posts.map(
      (post: any) => {
        return {
          title: post.title,
          date_published: new Date(
            post.publishedAtTimestamp * 1000,
          ).toISOString(),
          slug: getDefaultSlug(post.title, post.digest),
          tags: ["Mirror.xyz"],
          content: post.body,
          external_urls: [`https://mirror.xyz/${address}/${post.digest}`],
        }
      },
    )
  }

  return new NextServerResponse().status(200).json(result)
}
