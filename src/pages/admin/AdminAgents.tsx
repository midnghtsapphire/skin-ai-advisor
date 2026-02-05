import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Bot, Play, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import type { AgentTask, Project } from "@/types/project-management";
import { AGENT_TASK_LABELS } from "@/types/project-management";

const statusIcons: Record<AgentTask["status"], React.ReactNode> = {
  pending: <Clock className="w-4 h-4 text-yellow-500" />,
  processing: <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />,
  completed: <CheckCircle className="w-4 h-4 text-green-500" />,
  failed: <XCircle className="w-4 h-4 text-red-500" />,
};

const AdminAgents = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    project_id: "",
    task_type: "generate_docs" as AgentTask["task_type"],
    input_prompt: "",
  });

  const { data: projects } = useQuery({
    queryKey: ["projects-list"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("id, name");
      return data as Pick<Project, "id" | "name">[];
    },
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["admin-agent-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_tasks")
        .select("*, projects(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as (AgentTask & { projects: { name: string } | null })[];
    },
  });

  const createTask = useMutation({
    mutationFn: async (data: typeof formData) => {
      // First create the task
      const { data: task, error } = await supabase
        .from("agent_tasks")
        .insert({
          project_id: data.project_id || null,
          task_type: data.task_type,
          input_data: { prompt: data.input_prompt },
          status: "processing",
        })
        .select()
        .single();
      if (error) throw error;

      // Then invoke the edge function
      const { data: result, error: fnError } = await supabase.functions.invoke(
        "execute-agent-task",
        { body: { task_id: task.id } }
      );
      if (fnError) {
        // Update task as failed
        await supabase
          .from("agent_tasks")
          .update({ status: "failed", error_message: fnError.message })
          .eq("id", task.id);
        throw fnError;
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-agent-tasks"] });
      setIsDialogOpen(false);
      setFormData({ project_id: "", task_type: "generate_docs", input_prompt: "" });
      toast({ title: "Agent task started" });
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: ["admin-agent-tasks"] });
      toast({ title: "Task failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">AI Agents</h1>
            <p className="text-muted-foreground">
              Automated documentation, research, and artifact generation
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Bot className="w-4 h-4 mr-2" />
                New Agent Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Agent Task</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createTask.mutate(formData);
                }}
                className="space-y-4"
              >
                <Select
                  value={formData.project_id}
                  onValueChange={(v) => setFormData({ ...formData, project_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Project (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={formData.task_type}
                  onValueChange={(v) =>
                    setFormData({ ...formData, task_type: v as AgentTask["task_type"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Task Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AGENT_TASK_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Input prompt or instructions for the AI agent..."
                  value={formData.input_prompt}
                  onChange={(e) => setFormData({ ...formData, input_prompt: e.target.value })}
                  className="min-h-[100px]"
                />
                <Button type="submit" className="w-full" disabled={createTask.isPending}>
                  {createTask.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Agent
                    </>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Agent Capabilities */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(AGENT_TASK_LABELS).map(([key, label]) => (
            <Card key={key} className="bg-muted/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Task History */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Task History</h2>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
          ) : tasks?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No agent tasks yet. Create your first one!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tasks?.map((task) => (
                <Card key={task.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {statusIcons[task.status]}
                        <div>
                          <CardTitle className="text-lg">
                            {AGENT_TASK_LABELS[task.task_type]}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {task.projects?.name || "No project"} •{" "}
                            {new Date(task.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={task.status === "completed" ? "default" : "secondary"}
                      >
                        {task.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {task.input_data && (
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Input:</strong>{" "}
                        {(task.input_data as { prompt?: string }).prompt || "No prompt"}
                      </p>
                    )}
                    {task.error_message && (
                      <p className="text-sm text-red-500">
                        <strong>Error:</strong> {task.error_message}
                      </p>
                    )}
                    {task.output_data && (
                      <details className="mt-2">
                        <summary className="text-sm cursor-pointer text-primary">
                          View Output
                        </summary>
                        <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(task.output_data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAgents;
