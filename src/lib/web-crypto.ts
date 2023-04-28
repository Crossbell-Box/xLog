// Encrypt & decrypt core for xLog private posts
// Credit to https://github.com/D0n9X1n/hexo-blog-encrypt under MIT license

// Algorithm identify version
export const EncryptAlgorithmVersion = 1

/***********************************************
 *                                             *
 *               Helper Function               *
 *                                             *
 ***********************************************/
const textToArray = (s: string) => {
  let n = 0
  const bufferArray = []

  for (let i = 0; i < s.length; ) {
    const c = s.codePointAt(i)
    if (!c) {
      // Something is wrong
      break
    }
    if (c < 128) {
      bufferArray[n++] = c
      i++
    } else if (c > 127 && c < 2048) {
      bufferArray[n++] = (c >> 6) | 192
      bufferArray[n++] = (c & 63) | 128
      i++
    } else if (c > 2047 && c < 65536) {
      bufferArray[n++] = (c >> 12) | 224
      bufferArray[n++] = ((c >> 6) & 63) | 128
      bufferArray[n++] = (c & 63) | 128
      i++
    } else {
      bufferArray[n++] = (c >> 18) | 240
      bufferArray[n++] = ((c >> 12) & 63) | 128
      bufferArray[n++] = ((c >> 6) & 63) | 128
      bufferArray[n++] = (c & 63) | 128
      i += 2
    }
  }
  return new Uint8Array(bufferArray)
}

const hexToArray = (s: string) =>
  new Uint8Array(s.match(/[\da-f]{2}/gi)?.map((h) => parseInt(h, 16)) || [])

const arrayBufferToHex = (arrayBuffer: ArrayBuffer | any) => {
  // Should be ArrayBuffer, but js could be anything
  if (
    typeof arrayBuffer !== "object" ||
    arrayBuffer === null ||
    typeof arrayBuffer.byteLength !== "number"
  ) {
    throw new TypeError("Expected input to be an ArrayBuffer")
  }

  const view = new Uint8Array(arrayBuffer)
  let result = ""

  for (let i = 0; i < view.length; i++) {
    const value = view[i].toString(16)
    result += value.length === 1 ? "0" + value : value
  }

  return result
}

/***********************************************
 *                                             *
 *               Configurations                *
 *                                             *
 ***********************************************/

const keySalt = textToArray("Welcome to xLog 🎉")
const ivSalt = textToArray("Enjoy your new experience 🥰")

/***********************************************
 *                                             *
 *            Key Handle Function              *
 *                                             *
 ***********************************************/

const getKeyMaterial = (password: string) => {
  let encoder = new TextEncoder()
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    {
      name: "PBKDF2",
    },
    false,
    ["deriveKey", "deriveBits"],
  )
}

const getHmacKey = (keyMaterial: CryptoKey) => {
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: keySalt.buffer,
      iterations: 1024,
    },
    keyMaterial,
    {
      name: "HMAC",
      hash: "SHA-256",
      length: 256,
    },
    true,
    ["sign", "verify"],
  )
}

const getAESKey = (keyMaterial: CryptoKey) => {
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: keySalt.buffer,
      iterations: 1024,
    },
    keyMaterial,
    {
      name: "AES-CBC",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  )
}

const getIv = (keyMaterial: CryptoKey) => {
  return crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: ivSalt.buffer,
      iterations: 512,
    },
    keyMaterial,
    16 * 8,
  )
}

/***********************************************
 *                                             *
 *           Encrypt & Decrypt Core            *
 *                                             *
 ***********************************************/

export interface EncryptResult {
  encryptedData: string
  hmacSignature: string
}
export const Encrypt = async (
  password: string,
  originalData: string,
): Promise<EncryptResult> => {
  const encoder = new TextEncoder()

  const km = await getKeyMaterial(password)

  const originalEncoded = encoder.encode(originalData)

  // Encrypt with AES
  const encryptResult = await crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv: await getIv(km),
    },
    await getAESKey(km),
    originalEncoded,
  )

  // Calculate HMAC
  const hmacSignature = await crypto.subtle.sign(
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    await getHmacKey(km),
    originalEncoded,
  )

  return {
    encryptedData: arrayBufferToHex(encryptResult),
    hmacSignature: arrayBufferToHex(hmacSignature),
  }
}

const verifyContent = async (
  key: CryptoKey,
  content: ArrayBuffer,
  hmacSignature: string,
) => {
  const hmacSignatureEncoded = hexToArray(hmacSignature)

  const result = await crypto.subtle.verify(
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    key,
    hmacSignatureEncoded,
    content,
  )
  if (!result) {
    console.warn(`Got signature `, hmacSignature, ` but proved wrong.`)
  }
  return result
}

export interface DecryptResult {
  verified: boolean
  originalData: string
}
export const Decrypt = async (
  password: string,
  encryptedData: string,
  hmacSignature: string,
): Promise<DecryptResult> => {
  const decoder = new TextDecoder()

  const km = await getKeyMaterial(password)
  const encryptedDataEncoded = hexToArray(encryptedData)

  let decryptResult: ArrayBuffer
  try {
    decryptResult = await crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: await getIv(km),
      },
      await getAESKey(km),
      encryptedDataEncoded,
    )
  } catch (e) {
    // Password is wrong
    console.error(e)
    throw new Error("Failed to decrypt with wrong password")
  }

  const decryptDecoded = decoder.decode(decryptResult)

  return {
    verified: await verifyContent(
      await getHmacKey(km),
      decryptResult,
      hmacSignature,
    ),
    originalData: decryptDecoded, // Remove verify prefix
  }
}

/***********************************************
 *                                             *
 *         Attribute related constants         *
 *                                             *
 ***********************************************/

export const XLOG_ENCRYPT_ATTRIBUTE_IsEnabled = "xlog_encrypt_isEnabled"
export const XLOG_ENCRYPT_ATTRIBUTE_Version = "xlog_encrypt_version" // Would be helpful if we'd like to update our algorithm later
export const XLOG_ENCRYPT_ATTRIBUTE_EncryptedData = "xlog_encrypt_encryptedData"
export const XLOG_ENCRYPT_ATTRIBUTE_HmacSignature = "xlog_encrypt_hmacSignature"
