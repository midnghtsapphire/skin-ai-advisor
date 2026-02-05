export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'planning' | 'in_progress' | 'testing' | 'completed' | 'archived';
  github_url: string | null;
  live_url: string | null;
  tech_stack: string[];
  created_at: string;
  updated_at: string;
}

export interface ProjectPhase {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  phase_order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  doc_type: 'roadmap' | 'blueprint' | 'wireframe' | 'tech_spec' | 'user_doc' | 'qa_doc' | 'api_doc' | 'error_log' | 'faq' | 'competitor_analysis' | 'business_plan';
  title: string;
  content: string | null;
  file_url: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface QATest {
  id: string;
  project_id: string;
  feature_name: string;
  test_type: 'unit' | 'integration' | 'e2e' | 'manual' | 'accessibility' | 'performance';
  status: 'pending' | 'passed' | 'failed' | 'skipped';
  test_steps: { step: string; completed: boolean }[];
  expected_result: string | null;
  actual_result: string | null;
  error_details: string | null;
  tested_by: string | null;
  tested_at: string | null;
  created_at: string;
}

export interface FeatureBacklog {
  id: string;
  project_id: string;
  phase_id: string | null;
  title: string;
  description: string | null;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'backlog' | 'ready' | 'in_progress' | 'review' | 'done';
  story_points: number | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  created_at: string;
}

export interface AgentTask {
  id: string;
  project_id: string | null;
  task_type: 'generate_docs' | 'create_wireframe' | 'analyze_competitors' | 'generate_tests' | 'create_api_spec' | 'research';
  input_data: Record<string, unknown> | null;
  output_data: Record<string, unknown> | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export const DOC_TYPE_LABELS: Record<ProjectDocument['doc_type'], string> = {
  roadmap: 'Roadmap',
  blueprint: 'Blueprint',
  wireframe: 'Wireframe',
  tech_spec: 'Tech Specification',
  user_doc: 'User Documentation',
  qa_doc: 'QA Documentation',
  api_doc: 'API Documentation',
  error_log: 'Error Log',
  faq: 'FAQ',
  competitor_analysis: 'Competitor Analysis',
  business_plan: 'Business Plan',
};

export const AGENT_TASK_LABELS: Record<AgentTask['task_type'], string> = {
  generate_docs: 'Generate Documentation',
  create_wireframe: 'Create Wireframe',
  analyze_competitors: 'Analyze Competitors',
  generate_tests: 'Generate Tests',
  create_api_spec: 'Create API Spec',
  research: 'Research',
};
