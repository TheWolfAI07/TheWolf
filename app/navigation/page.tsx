import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { NavigationSidebar } from "@/components/navigation-sidebar"

export default async function NavigationPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationSidebar user={session.user} />
      <main className="lg:pl-72">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome to Your Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">AI Chat</h2>
                <p className="text-gray-600 mb-4">Chat with AI using GROQ and get intelligent responses.</p>
                <a href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
                  Start Chatting →
                </a>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Projects</h2>
                <p className="text-gray-600 mb-4">Manage your projects and collaborate with team members.</p>
                <a href="/projects" className="text-blue-600 hover:text-blue-800 font-medium">
                  View Projects →
                </a>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Documents</h2>
                <p className="text-gray-600 mb-4">Search through your documents with AI-powered search.</p>
                <a href="/documents" className="text-blue-600 hover:text-blue-800 font-medium">
                  Search Documents →
                </a>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Profile</h2>
                <p className="text-gray-600 mb-4">Update your personal information and preferences.</p>
                <a href="/profile" className="text-blue-600 hover:text-blue-800 font-medium">
                  Edit Profile →
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
