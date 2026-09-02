"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import type { Business, Project, User } from "@/types";

/** Botão "+ Nova tarefa" do cabeçalho de `/tasks` — dono do dialog em modo criação. */
export function NewTaskButton({
  businesses,
  projects,
  users,
}: {
  businesses: Business[];
  projects: Project[];
  users: User[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Nova tarefa
      </Button>
      <TaskFormDialog
        key={open ? "new" : "closed"}
        open={open}
        onOpenChange={setOpen}
        businesses={businesses}
        projects={projects}
        users={users}
      />
    </>
  );
}
