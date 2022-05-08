import { validate } from "uuid"

export const isUUID = (id: string) => validate(id)
