export const EmptyState: React.FC<{ resource?: string }> = ({ resource }) => {
  return (
    <div className="text-center py-10 mb-10 text-2xl text-zinc-300 font-medium flex justify-center flex-col items-center">
      <span className="i-mdi:ghost-outline text-5xl mb-2"></span>
      <div className="">
        {" "}
        No <span className="capitalize">{resource || "posts"}</span> Yet.
      </div>
    </div>
  )
}
