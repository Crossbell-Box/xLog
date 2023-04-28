// Encrypt & decrypt core for xLog private posts
// Credit to https://github.com/D0n9X1n/hexo-blog-encrypt under MIT license

/***********************************************
 *                                             *
 *         Algorithm identify version          *
 *                                             *
 ***********************************************/

export const EncryptAlgorithmVersion = 1

/***********************************************
 *                                             *
 *         Attribute related constants         *
 *                                             *
 ***********************************************/

export const XLOG_ENCRYPT_ATTRIBUTE_Version = "xlog_encrypt_version" // Would be helpful if we'd like to update our algorithm later
export const XLOG_ENCRYPT_ATTRIBUTE_EncryptedData = "xlog_encrypt_encryptedData"
export const XLOG_ENCRYPT_ATTRIBUTE_HmacSignature = "xlog_encrypt_hmacSignature"

/***********************************************
 *                                             *
 *               Global Helpers                *
 *                                             *
 ***********************************************/

const encoder = new TextEncoder()
const decoder = new TextDecoder()

/***********************************************
 *                                             *
 *               Configurations                *
 *                                             *
 ***********************************************/

const keySalt = encoder.encode("Welcome to xLog 🎉")
const ivSalt = encoder.encode("Enjoy your new experience 🥰")

/***********************************************
 *                                             *
 *               Helper Function               *
 *                                             *
 ***********************************************/

const base64ToUint8Array = (base64: string) =>
  new Uint8Array(
    window
      .atob(base64)
      .split("")
      .map((c) => c.charCodeAt(0)),
  )
const arrayBufferToBase64 = (arrayBuffer: ArrayBuffer) =>
  window.btoa(
    String.fromCharCode.apply(null, Array.from(new Uint8Array(arrayBuffer))),
  )

/***********************************************
 *                                             *
 *            Key Handle Function              *
 *                                             *
 ***********************************************/

const getKeyMaterial = (password: string) => {
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
    encryptedData: arrayBufferToBase64(encryptResult),
    hmacSignature: arrayBufferToBase64(hmacSignature),
  }
}

const verifyContent = async (
  key: CryptoKey,
  content: ArrayBuffer,
  hmacSignature: string,
) => {
  let hmacSignatureEncoded
  try {
    hmacSignatureEncoded = base64ToUint8Array(hmacSignature)
  } catch (e) {
    throw new Error("Invalid HMAC signature, decode failed")
  }

  return await crypto.subtle.verify(
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    key,
    hmacSignatureEncoded,
    content,
  )
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
  const km = await getKeyMaterial(password)

  let encryptedDataEncoded
  try {
    encryptedDataEncoded = base64ToUint8Array(encryptedData)
  } catch (e) {
    throw new Error("Invalid encrypted data, decode failed")
  }

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
    throw new Error("Failed to decrypt with wrong password")
  }

  const decryptDecoded = decoder.decode(decryptResult)
  let verified = false
  try {
    verified = await verifyContent(
      await getHmacKey(km),
      decryptResult,
      hmacSignature,
    )
  } catch (e) {
    // Failed to verify HMAC signature
    throw new Error("Failed to verify HMAC signature")
  }

  return {
    verified,
    originalData: decryptDecoded, // Remove verify prefix
  }
}
