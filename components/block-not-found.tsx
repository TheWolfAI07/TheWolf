export function BlockNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
            <div className="flex space-x-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400"></div>
              <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400 animation-delay-200"></div>
              <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400 animation-delay-400"></div>
            </div>
          </div>
        </div>

        <h1 className="mb-4 text-2xl font-semibold text-gray-900">Block Not Found</h1>

        <p className="max-w-md text-gray-600">
          Sorry, the block that you're looking for was deleted, unpublished, or can't be found.
        </p>
      </div>
    </div>
  )
}
