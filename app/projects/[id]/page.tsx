import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { ProjectDetails } from "@/components/project-details"
import { TeamMembers } from "@/components/team-members"

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const projectId = Number.parseInt(params.id)
  if (isNaN(projectId)) {
    notFound()
  }

  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Fetch project details
  const { data: project } = await supabase.from("wolf_projects").select("*").eq("id", projectId).single()

  if (!project) {
    notFound()
  }

  // Check if user is owner or team member
  const isOwner = project.owner_id === session.user.id

  if (!isOwner) {
    const { data: teamMember } = await supabase
      .from("wolf_team_members")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", session.user.id)
      .single()

    if (!teamMember) {
      // User doesn't have access to this project
      redirect("/projects")
    }
  }

  // Fetch team members
  const { data: teamMembers } = await supabase
    .from("wolf_team_members")
    .select(`
      id,
      user_id,
      role,
      joined_at,
      profiles:user_id (
        full_name,
        email,
        avatar_url
      )
    `)
    .eq("project_id", projectId)

  // Fetch project activities
  const { data: activities } = await supabase
    .from("wolf_activities")
    .select(`
      id,
      action,
      created_at,
      details,
      profiles:user_id (
        full_name
      )
    `)
    .eq("entity_id", projectId.toString())
    .eq("entity_type", "project")
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <a href="/projects" className="text-blue-600 hover:text-blue-800">
              Back to Projects
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ProjectDetails
              project={project}
              activities={activities || []}
              isOwner={isOwner}
              userId={session.user.id}
            />
          </div>
          <div>
            <TeamMembers
              members={teamMembers || []}
              projectId={projectId}
              isOwner={isOwner}
              currentUserId={session.user.id}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
