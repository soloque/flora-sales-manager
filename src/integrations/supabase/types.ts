export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      commission_settings: {
        Row: {
          default_rate: number | null
          id: string
          owner_id: string | null
          updated_at: string
        }
        Insert: {
          default_rate?: number | null
          id?: string
          owner_id?: string | null
          updated_at?: string
        }
        Update: {
          default_rate?: number | null
          id?: string
          owner_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_settings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_info: {
        Row: {
          address: string | null
          city: string | null
          id: string
          name: string
          observations: string | null
          order_details: string | null
          phone: string | null
          sale_id: string | null
          state: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          id?: string
          name: string
          observations?: string | null
          order_details?: string | null
          phone?: string | null
          sale_id?: string | null
          state?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          id?: string
          name?: string
          observations?: string | null
          order_details?: string | null
          phone?: string | null
          sale_id?: string | null
          state?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_info_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          receiver_id: string
          sender_id: string
          sender_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
          sender_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
          sender_name?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string | null
          cost_price: number | null
          created_at: string
          description: string | null
          id: string
          name: string
          quantity: number | null
          reorder_point: number | null
          selling_price: number | null
          supplier: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          quantity?: number | null
          reorder_point?: number | null
          selling_price?: number | null
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          quantity?: number | null
          reorder_point?: number | null
          selling_price?: number | null
          supplier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          reference_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          reference_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          reference_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          free_sales_remaining: number | null
          id: string
          name: string | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          free_sales_remaining?: number | null
          id: string
          name?: string | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          free_sales_remaining?: number | null
          id?: string
          name?: string | null
          role?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          commission: number | null
          commission_rate: number | null
          cost_price: number | null
          created_at: string
          customer_address: string | null
          customer_city: string | null
          customer_name: string | null
          customer_order: string | null
          customer_phone: string | null
          customer_state: string | null
          customer_zipcode: string | null
          date: string
          description: string | null
          id: string
          observations: string | null
          profit: number | null
          quantity: number | null
          seller_id: string | null
          seller_name: string | null
          status: string | null
          total_price: number | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          commission?: number | null
          commission_rate?: number | null
          cost_price?: number | null
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_name?: string | null
          customer_order?: string | null
          customer_phone?: string | null
          customer_state?: string | null
          customer_zipcode?: string | null
          date?: string
          description?: string | null
          id?: string
          observations?: string | null
          profit?: number | null
          quantity?: number | null
          seller_id?: string | null
          seller_name?: string | null
          status?: string | null
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          commission?: number | null
          commission_rate?: number | null
          cost_price?: number | null
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_name?: string | null
          customer_order?: string | null
          customer_phone?: string | null
          customer_state?: string | null
          customer_zipcode?: string | null
          date?: string
          description?: string | null
          id?: string
          observations?: string | null
          profit?: number | null
          quantity?: number | null
          seller_id?: string | null
          seller_name?: string | null
          status?: string | null
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_commission_rates: {
        Row: {
          id: string
          rate: number
          seller_id: string | null
          settings_id: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          rate: number
          seller_id?: string | null
          settings_id?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          rate?: number
          seller_id?: string | null
          settings_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_commission_rates_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_commission_rates_settings_id_fkey"
            columns: ["settings_id"]
            isOneToOne: false
            referencedRelation: "commission_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_subscriptions: {
        Row: {
          created_at: string | null
          id: string
          plan_type: string
          price_per_month: number | null
          sales_limit: number | null
          seller_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end: string | null
          subscription_start: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          plan_type?: string
          price_per_month?: number | null
          sales_limit?: number | null
          seller_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          plan_type?: string
          price_per_month?: number | null
          sales_limit?: number | null
          seller_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_subscriptions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          features_enabled: string[] | null
          has_watermark: boolean | null
          id: string
          max_customers: number | null
          max_sellers: number
          plan_name: string
          price_per_month: number
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end_date: string | null
          trial_end_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          features_enabled?: string[] | null
          has_watermark?: boolean | null
          id?: string
          max_customers?: number | null
          max_sellers?: number
          plan_name: string
          price_per_month: number
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          trial_end_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          features_enabled?: string[] | null
          has_watermark?: boolean | null
          id?: string
          max_customers?: number | null
          max_sellers?: number
          plan_name?: string
          price_per_month?: number
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          trial_end_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string | null
          id: string
          owner_id: string
          seller_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          owner_id: string
          seller_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          owner_id?: string
          seller_id?: string
        }
        Relationships: []
      }
      team_requests: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          owner_id: string
          seller_id: string
          seller_name: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          owner_id: string
          seller_id: string
          seller_name?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          owner_id?: string
          seller_id?: string
          seller_name?: string | null
          status?: string | null
        }
        Relationships: []
      }
      updates: {
        Row: {
          author_id: string | null
          author_name: string | null
          content: string
          created_at: string | null
          id: string
          images: string[] | null
          is_highlighted: boolean | null
          title: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          content: string
          created_at?: string | null
          id?: string
          images?: string[] | null
          is_highlighted?: boolean | null
          title: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          content?: string
          created_at?: string | null
          id?: string
          images?: string[] | null
          is_highlighted?: boolean | null
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_team_member: {
        Args: { owner_id_param: string; seller_id_param: string }
        Returns: undefined
      }
      can_add_customer: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      can_add_seller: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      can_register_sale: {
        Args: { seller_id_param: string }
        Returns: boolean
      }
      get_seller_subscription_info: {
        Args: { seller_id_param: string }
        Returns: {
          is_team_member: boolean
          subscription_status: string
          plan_type: string
          sales_used: number
          sales_limit: number
          can_register: boolean
        }[]
      }
      get_seller_team: {
        Args: { seller_id_param: string }
        Returns: {
          id: string
          name: string
          email: string
          role: string
          created_at: string
          avatar_url: string
        }[]
      }
      get_team_members: {
        Args: { owner_id_param: string }
        Returns: {
          id: string
          name: string
          email: string
          role: string
          created_at: string
          avatar_url: string
        }[]
      }
      get_team_requests: {
        Args: { owner_id_param: string }
        Returns: {
          id: string
          seller_id: string
          seller_name: string
          seller_email: string
          owner_id: string
          message: string
          status: string
          created_at: string
        }[]
      }
      get_user_current_plan: {
        Args: { user_id_param: string }
        Returns: {
          plan_name: string
          max_sellers: number
          price_per_month: number
          status: string
          can_upgrade_to_popular: boolean
          can_upgrade_to_crescimento: boolean
          can_upgrade_to_profissional: boolean
        }[]
      }
      get_user_messages: {
        Args: { user_id_param: string }
        Returns: {
          id: string
          sender_id: string
          sender_name: string
          receiver_id: string
          message: string
          read: boolean
          created_at: string
        }[]
      }
      mark_message_as_read: {
        Args: { message_id_param: string }
        Returns: undefined
      }
      send_direct_message: {
        Args: {
          sender_id_param: string
          sender_name_param: string
          receiver_id_param: string
          message_param: string
        }
        Returns: undefined
      }
      send_team_request: {
        Args: {
          seller_id_param: string
          seller_name_param: string
          owner_id_param: string
          message_param: string
        }
        Returns: undefined
      }
      update_team_request: {
        Args: { request_id_param: string; status_param: string }
        Returns: undefined
      }
      upgrade_user_plan: {
        Args: { user_id_param: string; new_plan_name_param: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
