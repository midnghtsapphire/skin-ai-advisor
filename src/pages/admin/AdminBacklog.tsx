import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, GripVertical } from "lucide-react";
import type { FeatureBacklog, Project } from "@/types/project-management";

const priorityColors: Record<FeatureBacklog["priority"], string> = {
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low: "bg-green-500/10 text-green-500 border-green-500/20",
};

const statusColumns: FeatureBacklog["status"][] = ["backlog", "ready", "in_progress", "review", "done"];

const AdminBacklog = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    project_id: "",
    title: "",
    description: "",
    priority: "medium" as FeatureBacklog["priority"],
    story_points: "",
  });

  const { data: projects } = useQuery({
    queryKey: ["projects-list"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("id, name");
      return data as Pick<Project, "id" | "name">[];
    },
  });

  const { data: backlog, isLoading } = useQuery({
    queryKey: ["admin-backlog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feature_backlog")
        .select("*, projects(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as (FeatureBacklog & { projects: { name: string } | null })[];
    },
  });

  const createFeature = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("feature_backlog").insert({
        project_id: data.project_id,
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        story_points: data.story_points ? parseInt(data.story_points) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-backlog"] });
      setIsDialogOpen(false);
      setFormData({ project_id: "", title: "", description: "", priority: "medium", story_points: "" });
      toast({ title: "Feature added to backlog" });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: FeatureBacklog["status"] }) => {
      const { error } = await supabase.from("feature_backlog").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-backlog"] });
    },
  });

  const getColumnItems = (status: FeatureBacklog["status"]) =>
    backlog?.filter((item) => item.status === status) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Feature Backlog</h1>
            <p className="text-muted-foreground">Kanban board for feature tracking</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Feature to Backlog</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createFeature.mutate(formData);
                }}
                className="space-y-4"
              >
                <Select
                  value={formData.project_id}
                  onValueChange={(v) => setFormData({ ...formData, project_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Feature Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={formData.priority}
                    onValueChange={(v) =>
                      setFormData({ ...formData, priority: v as FeatureBacklog["priority"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Story Points"
                    value={formData.story_points}
                    onChange={(e) => setFormData({ ...formData, story_points: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createFeature.isPending}>
                  Add Feature
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading backlog...</div>
        ) : (
          <div className="grid grid-cols-5 gap-4 overflow-x-auto">
            {statusColumns.map((status) => (
              <div key={status} className="min-w-[250px]">
                <div className="bg-muted/50 rounded-lg p-3 mb-3">
                  <h3 className="font-medium capitalize text-sm">
                    {status.replace("_", " ")}
                    <Badge variant="secondary" className="ml-2">
                      {getColumnItems(status).length}
                    </Badge>
                  </h3>
                </div>
                <div className="space-y-3">
                  {getColumnItems(status).map((item) => (
                    <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <GripVertical className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.projects?.name}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={priorityColors[item.priority]} variant="outline">
                                {item.priority}
                              </Badge>
                              {item.story_points && (
                                <Badge variant="secondary">{item.story_points} pts</Badge>
                              )}
                            </div>
                            <Select
                              value={item.status}
                              onValueChange={(v) =>
                                updateStatus.mutate({
                                  id: item.id,
                                  status: v as FeatureBacklog["status"],
                                })
                              }
                            >
                              <SelectTrigger className="mt-2 h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statusColumns.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s.replace("_", " ")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBacklog;
