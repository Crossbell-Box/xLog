export const EmptyState = ({ resource }: { resource?: string }) => {
  return (
    <div className="text-center py-10 mb-10 text-2xl text-zinc-300 font-medium flex justify-center flex-col items-center">
      <span className="icon-[mingcute--ghost-line] text-5xl mb-2"></span>
      <div className="">
        {" "}
        No <span className="capitalize">{resource || "post"}</span> Yet.
      </div>
    </div>
  )
}
