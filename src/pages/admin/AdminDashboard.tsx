import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FolderKanban,
  FileText,
  TestTube,
  ListTodo,
  Bot,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [projects, documents, qaTests, backlog, agentTasks, products, orders] =
        await Promise.all([
          supabase.from("projects").select("id, status", { count: "exact" }),
          supabase.from("project_documents").select("id", { count: "exact" }),
          supabase.from("qa_tests").select("id, status", { count: "exact" }),
          supabase.from("feature_backlog").select("id, status", { count: "exact" }),
          supabase.from("agent_tasks").select("id, status", { count: "exact" }),
          supabase.from("products").select("id", { count: "exact" }),
          supabase.from("orders").select("id, status", { count: "exact" }),
        ]);

      return {
        projectsCount: projects.count || 0,
        projectsActive: projects.data?.filter((p) => p.status === "in_progress").length || 0,
        documentsCount: documents.count || 0,
        qaTestsCount: qaTests.count || 0,
        qaTestsPassed: qaTests.data?.filter((t) => t.status === "passed").length || 0,
        backlogCount: backlog.count || 0,
        backlogDone: backlog.data?.filter((b) => b.status === "done").length || 0,
        agentTasksCount: agentTasks.count || 0,
        agentTasksCompleted: agentTasks.data?.filter((t) => t.status === "completed").length || 0,
        productsCount: products.count || 0,
        ordersCount: orders.count || 0,
        ordersPending: orders.data?.filter((o) => o.status === "pending").length || 0,
      };
    },
  });

  const statCards = [
    {
      title: "Projects",
      value: stats?.projectsCount || 0,
      subtitle: `${stats?.projectsActive || 0} active`,
      icon: FolderKanban,
      color: "text-blue-500",
    },
    {
      title: "Documents",
      value: stats?.documentsCount || 0,
      subtitle: "Total artifacts",
      icon: FileText,
      color: "text-green-500",
    },
    {
      title: "QA Tests",
      value: stats?.qaTestsCount || 0,
      subtitle: `${stats?.qaTestsPassed || 0} passed`,
      icon: TestTube,
      color: "text-purple-500",
    },
    {
      title: "Backlog",
      value: stats?.backlogCount || 0,
      subtitle: `${stats?.backlogDone || 0} completed`,
      icon: ListTodo,
      color: "text-orange-500",
    },
    {
      title: "AI Tasks",
      value: stats?.agentTasksCount || 0,
      subtitle: `${stats?.agentTasksCompleted || 0} completed`,
      icon: Bot,
      color: "text-cyan-500",
    },
    {
      title: "Products",
      value: stats?.productsCount || 0,
      subtitle: "In catalog",
      icon: Package,
      color: "text-pink-500",
    },
    {
      title: "Orders",
      value: stats?.ordersCount || 0,
      subtitle: `${stats?.ordersPending || 0} pending`,
      icon: ShoppingCart,
      color: "text-yellow-500",
    },
  ];

  const qaProgress = stats?.qaTestsCount
    ? Math.round((stats.qaTestsPassed / stats.qaTestsCount) * 100)
    : 0;

  const backlogProgress = stats?.backlogCount
    ? Math.round((stats.backlogDone / stats.backlogCount) * 100)
    : 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Central hub for all project management and documentation
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                  </div>
                  <stat.icon className={`w-10 h-10 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                QA Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tests Passed</span>
                  <span>{qaProgress}%</span>
                </div>
                <Progress value={qaProgress} />
                <p className="text-xs text-muted-foreground">
                  {stats?.qaTestsPassed || 0} of {stats?.qaTestsCount || 0} tests passing
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="w-5 h-5" />
                Backlog Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Features Completed</span>
                  <span>{backlogProgress}%</span>
                </div>
                <Progress value={backlogProgress} />
                <p className="text-xs text-muted-foreground">
                  {stats?.backlogDone || 0} of {stats?.backlogCount || 0} features done
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Development Standards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Agile/XP Methodology</Badge>
              <Badge variant="secondary">API-First Architecture</Badge>
              <Badge variant="secondary">W3C Compliant</Badge>
              <Badge variant="secondary">Eco-Friendly Design</Badge>
              <Badge variant="secondary">Modular Components</Badge>
              <Badge variant="secondary">Auto Documentation</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
