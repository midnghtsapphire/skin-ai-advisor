-- Projects table for tracking all projects
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'testing', 'completed', 'archived')),
  github_url TEXT,
  live_url TEXT,
  tech_stack JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project phases for roadmap tracking
CREATE TABLE public.project_phases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  phase_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Documentation artifacts
CREATE TABLE public.project_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('roadmap', 'blueprint', 'wireframe', 'tech_spec', 'user_doc', 'qa_doc', 'api_doc', 'error_log', 'faq', 'competitor_analysis', 'business_plan')),
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- QA tracking
CREATE TABLE public.qa_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('unit', 'integration', 'e2e', 'manual', 'accessibility', 'performance')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed', 'skipped')),
  test_steps JSONB DEFAULT '[]'::jsonb,
  expected_result TEXT,
  actual_result TEXT,
  error_details TEXT,
  tested_by TEXT,
  tested_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Feature backlog with phases
CREATE TABLE public.feature_backlog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES public.project_phases(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'ready', 'in_progress', 'review', 'done')),
  story_points INTEGER,
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  permissions JSONB DEFAULT '["read", "write", "delete"]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Agent workflow tasks
CREATE TABLE public.agent_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('generate_docs', 'create_wireframe', 'analyze_competitors', 'generate_tests', 'create_api_spec', 'research')),
  input_data JSONB,
  output_data JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_backlog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;

-- Public read policies for projects (portfolio view)
CREATE POLICY "Projects are viewable by everyone" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Project phases are viewable by everyone" ON public.project_phases FOR SELECT USING (true);
CREATE POLICY "Project documents are viewable by everyone" ON public.project_documents FOR SELECT USING (true);
CREATE POLICY "QA tests are viewable by everyone" ON public.qa_tests FOR SELECT USING (true);
CREATE POLICY "Feature backlog is viewable by everyone" ON public.feature_backlog FOR SELECT USING (true);
CREATE POLICY "Agent tasks are viewable by everyone" ON public.agent_tasks FOR SELECT USING (true);

-- Admin write policies
CREATE POLICY "Admins can manage projects" ON public.projects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage phases" ON public.project_phases FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage documents" ON public.project_documents FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage QA tests" ON public.qa_tests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage backlog" ON public.feature_backlog FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admin users viewable by admins" ON public.admin_users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage agent tasks" ON public.agent_tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- Triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_phases_updated_at BEFORE UPDATE ON public.project_phases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_documents_updated_at BEFORE UPDATE ON public.project_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feature_backlog_updated_at BEFORE UPDATE ON public.feature_backlog FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();