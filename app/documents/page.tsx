import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DocumentSearch } from "@/components/document-search"

export default async function DocumentsPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Get count of user's documents
  const { count } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("user_id", session.user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Document Search</h1>
            <a href="/dashboard" className="text-blue-600 hover:text-blue-800">
              Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DocumentSearch documentCount={count || 0} userId={session.user.id} />
      </main>
    </div>
  )
}
