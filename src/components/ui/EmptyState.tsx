export const EmptyState: React.FC<{ resource?: string }> = ({ resource }) => {
  return (
    <div className="text-center py-10 mb-10 text-2xl text-zinc-500 flex justify-center flex-col items-center">
      <svg className="w-12 h-12" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 2a9 9 0 0 0-9 9v11l3-3l3 3l3-3l3 3l3-3l3 3V11a9 9 0 0 0-9-9M9 8a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m6 0a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2Z"
        ></path>
      </svg>
      <div className="text-zinc-400">
        {" "}
        No <span className="capitalize">{resource || "posts"}</span> Yet.
      </div>
    </div>
  )
}
