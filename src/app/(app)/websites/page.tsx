import { PageHeader } from "@/components/layout/page-header";
import { ProjectsBoard } from "@/components/projects/projects-board";
import { getProjects, getTasks, getUsers, getWebsitesBoard } from "@/lib/data";
import { todayIso } from "@/lib/utils/date";

// Pagamentos e renovações dependem do dia de hoje — sem prerender estático.
export const dynamic = "force-dynamic";

export default async function WebsitesPage() {
  const now = new Date();
  const [rows, projects, tasks, users] = await Promise.all([
    getWebsitesBoard(now),
    getProjects(now),
    getTasks(now),
    getUsers(now),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Websites"
        description="Os projetos de website da PiriLight Studio, do início à entrega."
      />
      <ProjectsBoard
        type="website"
        initialRows={rows}
        initialProjects={projects}
        initialTasks={tasks}
        users={users}
        today={todayIso(now)}
      />
    </div>
  );
}
