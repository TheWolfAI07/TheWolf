import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ProjectList } from "@/components/project-list"
import { CreateProjectButton } from "@/components/create-project-button"

export default async function ProjectsPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Fetch user's projects
  const { data: ownedProjects } = await supabase
    .from("wolf_projects")
    .select("*")
    .eq("owner_id", session.user.id)
    .order("created_at", { ascending: false })

  // Fetch projects user is a team member of
  const { data: teamMemberships } = await supabase
    .from("wolf_team_members")
    .select("project_id, role")
    .eq("user_id", session.user.id)

  const teamProjectIds = teamMemberships?.map((tm) => tm.project_id) || []

  let teamProjects = []
  if (teamProjectIds.length > 0) {
    const { data } = await supabase
      .from("wolf_projects")
      .select("*")
      .in("id", teamProjectIds)
      .order("created_at", { ascending: false })

    teamProjects = data || []
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <div className="flex items-center space-x-4">
              <a href="/dashboard" className="text-blue-600 hover:text-blue-800">
                Back to Dashboard
              </a>
              <CreateProjectButton userId={session.user.id} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
            <ProjectList projects={ownedProjects || []} isOwner={true} />
          </div>

          {teamProjects.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Team Projects</h2>
              <ProjectList
                projects={teamProjects}
                isOwner={false}
                roles={teamMemberships?.reduce(
                  (acc, tm) => ({
                    ...acc,
                    [tm.project_id]: tm.role,
                  }),
                  {},
                )}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
