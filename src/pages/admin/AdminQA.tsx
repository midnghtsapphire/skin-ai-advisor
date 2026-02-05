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
import { Plus, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import type { QATest, Project } from "@/types/project-management";

const statusIcons: Record<QATest["status"], React.ReactNode> = {
  pending: <Clock className="w-4 h-4 text-yellow-500" />,
  passed: <CheckCircle className="w-4 h-4 text-green-500" />,
  failed: <XCircle className="w-4 h-4 text-red-500" />,
  skipped: <AlertTriangle className="w-4 h-4 text-gray-500" />,
};

const AdminQA = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    project_id: "",
    feature_name: "",
    test_type: "manual" as QATest["test_type"],
    expected_result: "",
  });

  const { data: projects } = useQuery({
    queryKey: ["projects-list"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("id, name");
      return data as Pick<Project, "id" | "name">[];
    },
  });

  const { data: tests, isLoading } = useQuery({
    queryKey: ["admin-qa-tests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("qa_tests")
        .select("*, projects(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as (QATest & { projects: { name: string } | null })[];
    },
  });

  const createTest = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("qa_tests").insert({
        project_id: data.project_id,
        feature_name: data.feature_name,
        test_type: data.test_type,
        expected_result: data.expected_result || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-qa-tests"] });
      setIsDialogOpen(false);
      setFormData({ project_id: "", feature_name: "", test_type: "manual", expected_result: "" });
      toast({ title: "Test created successfully" });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      actual_result,
    }: {
      id: string;
      status: QATest["status"];
      actual_result?: string;
    }) => {
      const { error } = await supabase
        .from("qa_tests")
        .update({
          status,
          actual_result: actual_result || null,
          tested_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-qa-tests"] });
      toast({ title: "Test status updated" });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">QA Tests</h1>
            <p className="text-muted-foreground">Track all testing across projects</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Test
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create QA Test</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createTest.mutate(formData);
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
                  placeholder="Feature Name"
                  value={formData.feature_name}
                  onChange={(e) => setFormData({ ...formData, feature_name: e.target.value })}
                  required
                />
                <Select
                  value={formData.test_type}
                  onValueChange={(v) => setFormData({ ...formData, test_type: v as QATest["test_type"] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Test Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unit">Unit</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                    <SelectItem value="e2e">End-to-End</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="accessibility">Accessibility</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Expected Result"
                  value={formData.expected_result}
                  onChange={(e) => setFormData({ ...formData, expected_result: e.target.value })}
                />
                <Button type="submit" className="w-full" disabled={createTest.isPending}>
                  Create Test
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading tests...</div>
        ) : tests?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No tests yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tests?.map((test) => (
              <Card key={test.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {statusIcons[test.status]}
                      <div>
                        <CardTitle className="text-lg">{test.feature_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {test.projects?.name} • {test.test_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus.mutate({ id: test.id, status: "passed" })}
                        disabled={test.status === "passed"}
                      >
                        Pass
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus.mutate({ id: test.id, status: "failed" })}
                        disabled={test.status === "failed"}
                      >
                        Fail
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {test.expected_result && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      <strong>Expected:</strong> {test.expected_result}
                    </p>
                    {test.actual_result && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Actual:</strong> {test.actual_result}
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminQA;
