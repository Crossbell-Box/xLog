import { useTranslation } from "next-i18next"
import Head from "next/head"
import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import serialize from "serialize-javascript"

import EncryptPasswordPrompt from "~/components/common/EncryptPasswordPrompt"
import { getSiteLink } from "~/lib/helpers"
import { Note, Profile } from "~/lib/types"
import {
  Decrypt,
  XLOG_ENCRYPT_ATTRIBUTE_EncryptedData,
  XLOG_ENCRYPT_ATTRIBUTE_HmacSignature,
  XLOG_ENCRYPT_ATTRIBUTE_Version,
} from "~/lib/web-crypto"

import { PageContent } from "../common/PageContent"
import { PostFooter } from "./PostFooter"
import { PostMeta } from "./PostMeta"

export const SitePage: React.FC<{
  page?: Note | null
  site?: Profile | null
}> = ({ page, site }) => {
  // const author = useGetUserSites(page?.authors?.[0])
  const { t } = useTranslation("site")
  const { t: tCommon } = useTranslation("common")

  function addPageJsonLd() {
    return {
      __html: serialize({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: page?.title,
        ...(page?.cover && {
          image: [page?.cover],
        }),
        datePublished: page?.date_published,
        dateModified: page?.date_updated,
        author: [
          {
            "@type": "Person",
            name: site?.name,
            url: getSiteLink({
              subdomain: site?.username || "",
            }),
          },
        ],
      }),
    }
  }

  const [isPageEncrypted, setIsPageEncrypted] = useState(false)
  const [content, setContent] = useState<string | undefined>("")

  useEffect(() => {
    // Check if page has been encrypted
    if (page?.attributes) {
      const encryptAlgoVersion = page.attributes.find(
        (attribute) => attribute.trait_type === XLOG_ENCRYPT_ATTRIBUTE_Version,
      )?.value
      if (encryptAlgoVersion) {
        // Is encrypted
        setIsPageEncrypted(true)
      } else {
        // Not encrypted
        setContent(page?.body?.content)
        setIsPageEncrypted(false)
      }
    }
  }, [page])

  const tryUnlock = useCallback(
    async (password: string) => {
      if (!page?.attributes || page.attributes.length === 0) {
        toast.error(tCommon("Failed to detect note encrypt status."))
        return
      }

      // Get encrypted content & hmac signature
      const encryptedData = String(
        page.attributes.find(
          (attribute) =>
            attribute.trait_type === XLOG_ENCRYPT_ATTRIBUTE_EncryptedData,
        )?.value,
      )
      const hmacSignature = String(
        page.attributes.find(
          (attribute) =>
            attribute.trait_type === XLOG_ENCRYPT_ATTRIBUTE_HmacSignature,
        )?.value,
      )

      if (!encryptedData) {
        toast.error(tCommon("Failed to get note encrypted data"))
        return
      }

      // Try to decrypt
      try {
        const decryptResult = await Decrypt(
          password,
          encryptedData,
          hmacSignature,
        )

        if (!decryptResult.verified) {
          toast.error(tCommon("Decrypted successfully but signature mismatch."))
        } else {
          toast.success(tCommon("Decrypted successfully!"))
        }

        // Update page content
        setContent(decryptResult.originalData)
        setIsPageEncrypted(false)
      } catch (e) {
        toast.error(tCommon("Invalid password"))
      }
    },
    [page, tCommon],
  )

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={addPageJsonLd()}
        />
      </Head>
      {page?.preview && (
        <div className="fixed top-0 left-0 w-full text-center text-red-500 bg-gray-100 py-2 opacity-80 text-sm z-10">
          {t(
            "This address is in local editing preview mode and cannot be viewed by the public.",
          )}
        </div>
      )}
      <article>
        <div>
          {page?.tags?.includes("post") ? (
            <h2 className="xlog-post-title text-4xl font-bold">{page.title}</h2>
          ) : (
            <h2 className="xlog-post-title text-xl font-bold page-title">
              {page?.title}
            </h2>
          )}
          {page?.tags?.includes("post") && !page?.preview && (
            <PostMeta page={page} site={site} />
          )}
        </div>

        {/*Check if is encrypted*/}
        {isPageEncrypted ? (
          <div className="border border-dashed rounded-xl mt-4">
            <EncryptPasswordPrompt tryUnlock={tryUnlock} />
          </div>
        ) : (
          <PageContent className="mt-10" content={content} toc={true} />
        )}
      </article>
      {page?.metadata && <PostFooter page={page} site={site} />}
    </>
  )
}
