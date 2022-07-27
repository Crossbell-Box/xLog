import React from "react"

export const CopyIcon: React.FC<React.ComponentPropsWithoutRef<"svg">> = (
  props
) => {
  return (
    <svg width="1em" height="1em" {...props} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5253"><path d="M832 128c-12.8-76.8-76.8-128-160-128h-448C102.4 0 0 102.4 0 224v448c0 76.8 57.6 140.8 128 160 12.8 76.8 76.8 128 160 128h512c89.6 0 160-70.4 160-160v-512c0-76.8-57.6-140.8-128-160zM64 672v-448C64 134.4 134.4 64 224 64h448c44.8 0 76.8 25.6 89.6 64H288C198.4 128 128 198.4 128 288v473.6c-38.4-12.8-64-44.8-64-89.6z m832 128c0 51.2-44.8 96-96 96h-512c-51.2 0-96-44.8-96-96v-512C192 236.8 236.8 192 288 192h512c51.2 0 96 44.8 96 96v512z" p-id="5254"></path></svg>
  )
}
