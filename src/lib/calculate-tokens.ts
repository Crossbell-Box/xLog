import { encode } from "gpt-tokenizer"

export type ModelTypes =
  | "gpt-3.5-turbo"
  | "gpt-3.5-turbo-0613"
  | "gpt-3.5-turbo-16k"
  | "gpt-3.5-turbo-16k-0613"
  | "gpt-3.5-turbo-0301"
  | "gpt-4"
  | "gpt-4-0314"
  | "gpt-4-32k-0314"
  | "gpt-4-0613"
  | "gpt-4-32k-0613"

export function calculateTokens(
  messages: string,
  model: ModelTypes = "gpt-3.5-turbo-0613",
) {
  let tokens_per_message = 0
  let tokens_per_name = 0
  if (
    [
      "gpt-3.5-turbo-0613",
      "gpt-3.5-turbo-16k-0613",
      "gpt-4-0314",
      "gpt-4-32k-0314",
      "gpt-4-0613",
      "gpt-4-32k-0613",
    ].includes(model)
  ) {
    tokens_per_message = 3
    tokens_per_name = 1
  } else if (model == "gpt-3.5-turbo-0301") {
    tokens_per_message = 4
    tokens_per_name = -1
  } else if (model.includes("gpt-3.5-turbo")) {
    console.log(
      "Warning: gpt-3.5-turbo may update over time. Returning num tokens assuming gpt-3.5-turbo-0613.",
    )
    return calculateTokens(messages, "gpt-3.5-turbo-0613")
  } else if (model.includes("gpt-4")) {
    console.log(
      "Warning: gpt-4 may update over time. Returning num tokens assuming gpt-4-0613.",
    )
    return calculateTokens(messages, "gpt-4-0613")
  } else {
    throw new Error(
      `num_tokens_from_messages() is not implemented for model ${model}. See https://github.com/openai/openai-python/blob/main/chatml.md for information on how messages are converted to tokens.`,
    )
  }
  let num_tokens = 0
  for (let i = 0; i < messages.length; i++) {
    let message = messages[i]
    num_tokens += tokens_per_message
    // @ts-ignore
    for (let key in message) {
      let value = message[key]
      num_tokens += encode(value).length
      if (key == "name") {
        num_tokens += tokens_per_name
      }
    }
  }
  num_tokens += 3
  return num_tokens
}
