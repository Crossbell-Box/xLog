import Unidata from "unidata.js"

let unidata: Unidata | null = null;
if (typeof window !== "undefined") {
  unidata = new Unidata()
}

export default unidata
