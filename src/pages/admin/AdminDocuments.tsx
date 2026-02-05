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
import { Plus, FileText, Bot, Loader2 } from "lucide-react";
import type { ProjectDocument, Project } from "@/types/project-management";
import { DOC_TYPE_LABELS } from "@/types/project-management";

const AdminDocuments = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    project_id: "",
    doc_type: "tech_spec" as ProjectDocument["doc_type"],
    title: "",
    content: "",
  });

  const { data: projects } = useQuery({
    queryKey: ["projects-list"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("id, name");
      return data as Pick<Project, "id" | "name">[];
    },
  });

  const { data: documents, isLoading } = useQuery({
    queryKey: ["admin-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_documents")
        .select("*, projects(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as (ProjectDocument & { projects: { name: string } | null })[];
    },
  });

  const createDocument = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("project_documents").insert({
        project_id: data.project_id,
        doc_type: data.doc_type,
        title: data.title,
        content: data.content || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      setIsDialogOpen(false);
      setFormData({ project_id: "", doc_type: "tech_spec", title: "", content: "" });
      toast({ title: "Document created successfully" });
    },
  });

  const generateWithAI = useMutation({
    mutationFn: async ({ projectId, docType }: { projectId: string; docType: string }) => {
      setGeneratingFor(projectId + docType);
      const { data, error } = await supabase.functions.invoke("generate-project-docs", {
        body: { project_id: projectId, doc_type: docType },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      toast({ title: "Document generated with AI" });
      setGeneratingFor(null);
    },
    onError: (error) => {
      toast({ title: "Error generating document", description: error.message, variant: "destructive" });
      setGeneratingFor(null);
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Documents</h1>
            <p className="text-muted-foreground">
              Roadmaps, blueprints, specs, and all project artifacts
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Document</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createDocument.mutate(formData);
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
                <Select
                  value={formData.doc_type}
                  onValueChange={(v) =>
                    setFormData({ ...formData, doc_type: v as ProjectDocument["doc_type"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Document Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOC_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Content (Markdown supported)"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="min-h-[200px]"
                />
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={createDocument.isPending}>
                    Create Document
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      formData.project_id &&
                      generateWithAI.mutate({
                        projectId: formData.project_id,
                        docType: formData.doc_type,
                      })
                    }
                    disabled={!formData.project_id || generateWithAI.isPending}
                  >
                    {generatingFor ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                    <span className="ml-2">Generate with AI</span>
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading documents...</div>
        ) : documents?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No documents yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents?.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <FileText className="w-8 h-8 text-primary" />
                    <Badge variant="secondary">{DOC_TYPE_LABELS[doc.doc_type]}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{doc.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {doc.content || "No content yet"}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{doc.projects?.name || "No project"}</span>
                    <span>v{doc.version}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDocuments;
