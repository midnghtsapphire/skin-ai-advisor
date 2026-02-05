import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  TestTube,
  ListTodo,
  Bot,
  Package,
  Warehouse,
  ShoppingCart,
  Users,
  Settings,
} from "lucide-react";

type NavItem = 
  | { type: "divider"; label: string }
  | { label: string; icon: LucideIcon; path: string };

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Projects", icon: FolderKanban, path: "/admin/projects" },
  { label: "Documents", icon: FileText, path: "/admin/documents" },
  { label: "QA Tests", icon: TestTube, path: "/admin/qa" },
  { label: "Backlog", icon: ListTodo, path: "/admin/backlog" },
  { label: "AI Agents", icon: Bot, path: "/admin/agents" },
  { type: "divider", label: "E-Commerce" },
  { label: "Products", icon: Package, path: "/admin/products" },
  { label: "Inventory", icon: Warehouse, path: "/admin/inventory" },
  { label: "Orders", icon: ShoppingCart, path: "/admin/orders" },
  { type: "divider", label: "System" },
  { label: "Admin Users", icon: Users, path: "/admin/users" },
  { label: "Settings", icon: Settings, path: "/admin/settings" },
];

export const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-card border-r min-h-screen p-4">
      <div className="mb-8">
        <h2 className="font-display text-xl font-semibold text-foreground">Admin Hub</h2>
        <p className="text-xs text-muted-foreground">Project Management</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item, index) => {
          if ("type" in item && item.type === "divider") {
            return (
              <div key={index} className="pt-4 pb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            );
          }

          const navLink = item as { label: string; icon: LucideIcon; path: string };
          const Icon = navLink.icon;
          const isActive = location.pathname === navLink.path;

          return (
            <Link
              key={navLink.path}
              to={navLink.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon size={18} />
              {navLink.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
