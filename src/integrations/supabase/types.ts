export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          permissions: Json | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: Json | null
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliate_clicks: {
        Row: {
          affiliate_program_id: string | null
          clicked_at: string
          id: string
          ip_address: string | null
          product_id: string | null
          referrer: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          affiliate_program_id?: string | null
          clicked_at?: string
          id?: string
          ip_address?: string | null
          product_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          affiliate_program_id?: string | null
          clicked_at?: string
          id?: string
          ip_address?: string | null
          product_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_affiliate_program_id_fkey"
            columns: ["affiliate_program_id"]
            isOneToOne: false
            referencedRelation: "affiliate_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_clicks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_programs: {
        Row: {
          category: string | null
          commission_rate: string | null
          cookie_duration: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          signup_url: string | null
          tier: string | null
          website: string | null
        }
        Insert: {
          category?: string | null
          commission_rate?: string | null
          cookie_duration?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          signup_url?: string | null
          tier?: string | null
          website?: string | null
        }
        Update: {
          category?: string | null
          commission_rate?: string | null
          cookie_duration?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          signup_url?: string | null
          tier?: string | null
          website?: string | null
        }
        Relationships: []
      }
      agent_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          input_data: Json | null
          output_data: Json | null
          project_id: string | null
          status: string
          task_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          project_id?: string | null
          status?: string
          task_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          project_id?: string | null
          status?: string
          task_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_backlog: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          id: string
          phase_id: string | null
          priority: string
          project_id: string
          status: string
          story_points: number | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          phase_id?: string | null
          priority?: string
          project_id: string
          status?: string
          story_points?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          phase_id?: string | null
          priority?: string
          project_id?: string
          status?: string
          story_points?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_backlog_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_backlog_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          created_at: string
          id: string
          last_restocked_at: string | null
          product_id: string
          quantity: number
          reorder_level: number
          reorder_quantity: number
          reserved_quantity: number
          updated_at: string
          warehouse_location: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_restocked_at?: string | null
          product_id: string
          quantity?: number
          reorder_level?: number
          reorder_quantity?: number
          reserved_quantity?: number
          updated_at?: string
          warehouse_location?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_restocked_at?: string | null
          product_id?: string
          quantity?: number
          reorder_level?: number
          reorder_quantity?: number
          reserved_quantity?: number
          updated_at?: string
          warehouse_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          carrier: string | null
          created_at: string
          delivered_at: string | null
          id: string
          notes: string | null
          order_number: string
          shipped_at: string | null
          shipping_address: Json | null
          shipping_cost: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax: number
          total: number
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: Json | null
          carrier?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          notes?: string | null
          order_number: string
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_cost?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: Json | null
          carrier?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_cost?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          affiliate_commission_rate: number | null
          affiliate_link: string | null
          brand: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_affiliate: boolean | null
          markup_percentage: number | null
          my_cost: number
          name: string
          selling_price: number
          sku: string | null
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
        }
        Insert: {
          affiliate_commission_rate?: number | null
          affiliate_link?: string | null
          brand?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_affiliate?: boolean | null
          markup_percentage?: number | null
          my_cost?: number
          name: string
          selling_price?: number
          sku?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Update: {
          affiliate_commission_rate?: number | null
          affiliate_link?: string | null
          brand?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_affiliate?: boolean | null
          markup_percentage?: number | null
          my_cost?: number
          name?: string
          selling_price?: number
          sku?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          skin_concerns: string[] | null
          skin_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          skin_concerns?: string[] | null
          skin_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          skin_concerns?: string[] | null
          skin_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_documents: {
        Row: {
          content: string | null
          created_at: string
          doc_type: string
          file_url: string | null
          id: string
          project_id: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          content?: string | null
          created_at?: string
          doc_type: string
          file_url?: string | null
          id?: string
          project_id: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          content?: string | null
          created_at?: string
          doc_type?: string
          file_url?: string | null
          id?: string
          project_id?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_phases: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          phase_order: number
          project_id: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          phase_order?: number
          project_id: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          phase_order?: number
          project_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          github_url: string | null
          id: string
          live_url: string | null
          name: string
          status: string
          tech_stack: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          live_url?: string | null
          name: string
          status?: string
          tech_stack?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          live_url?: string | null
          name?: string
          status?: string
          tech_stack?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      qa_tests: {
        Row: {
          actual_result: string | null
          created_at: string
          error_details: string | null
          expected_result: string | null
          feature_name: string
          id: string
          project_id: string
          status: string
          test_steps: Json | null
          test_type: string
          tested_at: string | null
          tested_by: string | null
        }
        Insert: {
          actual_result?: string | null
          created_at?: string
          error_details?: string | null
          expected_result?: string | null
          feature_name: string
          id?: string
          project_id: string
          status?: string
          test_steps?: Json | null
          test_type: string
          tested_at?: string | null
          tested_by?: string | null
        }
        Update: {
          actual_result?: string | null
          created_at?: string
          error_details?: string | null
          expected_result?: string | null
          feature_name?: string
          id?: string
          project_id?: string
          status?: string
          test_steps?: Json | null
          test_type?: string
          tested_at?: string | null
          tested_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qa_tests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      return_items: {
        Row: {
          id: string
          order_item_id: string
          quantity: number
          reason: string | null
          return_id: string
        }
        Insert: {
          id?: string
          order_item_id: string
          quantity?: number
          reason?: string | null
          return_id: string
        }
        Update: {
          id?: string
          order_item_id?: string
          quantity?: number
          reason?: string | null
          return_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "return_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_items_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "returns"
            referencedColumns: ["id"]
          },
        ]
      }
      returns: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          order_id: string
          processed_at: string | null
          reason: string
          refund_amount: number | null
          requested_at: string
          status: Database["public"]["Enums"]["return_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          order_id: string
          processed_at?: string | null
          reason: string
          refund_amount?: number | null
          requested_at?: string
          status?: Database["public"]["Enums"]["return_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          order_id?: string
          processed_at?: string | null
          reason?: string
          refund_amount?: number | null
          requested_at?: string
          status?: Database["public"]["Enums"]["return_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_products: {
        Row: {
          analysis_result: Json
          created_at: string
          id: string
          ingredients: string
          product_name: string | null
          user_id: string
        }
        Insert: {
          analysis_result: Json
          created_at?: string
          id?: string
          ingredients: string
          product_name?: string | null
          user_id: string
        }
        Update: {
          analysis_result?: Json
          created_at?: string
          id?: string
          ingredients?: string
          product_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "returned"
      product_status: "active" | "inactive" | "out_of_stock" | "discontinued"
      return_status:
        | "requested"
        | "approved"
        | "rejected"
        | "received"
        | "refunded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      product_status: ["active", "inactive", "out_of_stock", "discontinued"],
      return_status: [
        "requested",
        "approved",
        "rejected",
        "received",
        "refunded",
      ],
    },
  },
} as const
