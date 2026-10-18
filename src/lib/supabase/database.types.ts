/* Generated from the Supabase schema — regenerate after every migration. */
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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      app_installs: {
        Row: {
          channel: string
          device_id: string
          installed_at: string
          last_open_at: string
          opens: number
          patient_id: string | null
          platform: string
        }
        Insert: {
          channel: string
          device_id: string
          installed_at?: string
          last_open_at?: string
          opens?: number
          patient_id?: string | null
          platform: string
        }
        Update: {
          channel?: string
          device_id?: string
          installed_at?: string
          last_open_at?: string
          opens?: number
          patient_id?: string | null
          platform?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_installs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          called_at: string | null
          cancel_reason: string | null
          checked_in_at: string | null
          created_at: string
          created_by: string | null
          finished_at: string | null
          id: string
          minutes: number
          patient_id: string | null
          patient_package_id: string | null
          pay_method: Database["public"]["Enums"]["pay_method"] | null
          price: number
          queue_day: string | null
          queue_no: number | null
          room_id: string | null
          service_key: string
          source: string
          specialist_id: string | null
          started_at: string | null
          starts_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          walk_in_name: string | null
          walk_in_phone: string | null
        }
        Insert: {
          called_at?: string | null
          cancel_reason?: string | null
          checked_in_at?: string | null
          created_at?: string
          created_by?: string | null
          finished_at?: string | null
          id?: string
          minutes: number
          patient_id?: string | null
          patient_package_id?: string | null
          pay_method?: Database["public"]["Enums"]["pay_method"] | null
          price?: number
          queue_day?: string | null
          queue_no?: number | null
          room_id?: string | null
          service_key: string
          source?: string
          specialist_id?: string | null
          started_at?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          walk_in_name?: string | null
          walk_in_phone?: string | null
        }
        Update: {
          called_at?: string | null
          cancel_reason?: string | null
          checked_in_at?: string | null
          created_at?: string
          created_by?: string | null
          finished_at?: string | null
          id?: string
          minutes?: number
          patient_id?: string | null
          patient_package_id?: string | null
          pay_method?: Database["public"]["Enums"]["pay_method"] | null
          price?: number
          queue_day?: string | null
          queue_no?: number | null
          room_id?: string | null
          service_key?: string
          source?: string
          specialist_id?: string | null
          started_at?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          walk_in_name?: string | null
          walk_in_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_package_id_fkey"
            columns: ["patient_package_id"]
            isOneToOne: false
            referencedRelation: "patient_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_key_fkey"
            columns: ["service_key"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "appointments_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          details: Json | null
          id: number
          target: string | null
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          details?: Json | null
          id?: never
          target?: string | null
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          details?: Json | null
          id?: never
          target?: string | null
        }
        Relationships: []
      }
      consents: {
        Row: {
          answers: Json
          id: string
          patient_id: string
          service_key: string | null
          signature_path: string | null
          signed_at: string
        }
        Insert: {
          answers?: Json
          id?: string
          patient_id: string
          service_key?: string | null
          signature_path?: string | null
          signed_at?: string
        }
        Update: {
          answers?: Json
          id?: string
          patient_id?: string
          service_key?: string | null
          signature_path?: string | null
          signed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_service_key_fkey"
            columns: ["service_key"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["key"]
          },
        ]
      }
      devices: {
        Row: {
          id: string
          in_maintenance: boolean
          name: string
          next_service_at: string | null
          room_id: string | null
          sessions_count: number
        }
        Insert: {
          id?: string
          in_maintenance?: boolean
          name: string
          next_service_at?: string | null
          room_id?: string | null
          sessions_count?: number
        }
        Update: {
          id?: string
          in_maintenance?: boolean
          name?: string
          next_service_at?: string | null
          room_id?: string | null
          sessions_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "devices_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          id: string
          label: string
          spent_on: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by?: string | null
          id?: string
          label: string
          spent_on?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string
          spent_on?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          label: string
          qty: number
          unit_price: number
        }
        Insert: {
          id?: string
          invoice_id: string
          label: string
          qty?: number
          unit_price: number
        }
        Update: {
          id?: string
          invoice_id?: string
          label?: string
          qty?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          appointment_id: string | null
          created_at: string
          created_by: string | null
          discount: number
          id: string
          method: Database["public"]["Enums"]["pay_method"]
          no: string
          paid: boolean
          patient_id: string | null
          subtotal: number
          total: number
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          created_by?: string | null
          discount?: number
          id?: string
          method?: Database["public"]["Enums"]["pay_method"]
          no?: string
          paid?: boolean
          patient_id?: string | null
          subtotal?: number
          total?: number
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          created_by?: string | null
          discount?: number
          id?: string
          method?: Database["public"]["Enums"]["pay_method"]
          no?: string
          paid?: boolean
          patient_id?: string | null
          subtotal?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_key: string
          qty: number
          unit_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_key: string
          qty: number
          unit_price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_key?: string
          qty?: number
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
            foreignKeyName: "order_items_product_key_fkey"
            columns: ["product_key"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["key"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          created_at: string
          delivery: boolean
          id: string
          no: number
          patient_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          total: number
        }
        Insert: {
          address?: string | null
          created_at?: string
          delivery?: boolean
          id?: string
          no?: number
          patient_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
        }
        Update: {
          address?: string | null
          created_at?: string
          delivery?: boolean
          id?: string
          no?: number
          patient_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          active: boolean
          id: string
          name: string
          price: number
          service_key: string
          sessions: number
        }
        Insert: {
          active?: boolean
          id?: string
          name: string
          price: number
          service_key: string
          sessions: number
        }
        Update: {
          active?: boolean
          id?: string
          name?: string
          price?: number
          service_key?: string
          sessions?: number
        }
        Relationships: [
          {
            foreignKeyName: "packages_service_key_fkey"
            columns: ["service_key"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["key"]
          },
        ]
      }
      patient_conditions: {
        Row: {
          created_at: string
          id: string
          kind: string
          name: string
          patient_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          name: string
          patient_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          name?: string
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_conditions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_packages: {
        Row: {
          id: string
          package_id: string
          patient_id: string
          price_paid: number
          purchased_at: string
          sessions_total: number
          sessions_used: number
        }
        Insert: {
          id?: string
          package_id: string
          patient_id: string
          price_paid?: number
          purchased_at?: string
          sessions_total: number
          sessions_used?: number
        }
        Update: {
          id?: string
          package_id?: string
          patient_id?: string
          price_paid?: number
          purchased_at?: string
          sessions_total?: number
          sessions_used?: number
        }
        Relationships: [
          {
            foreignKeyName: "patient_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_packages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          birth_date: string | null
          breastfeeding: boolean
          created_at: string
          file_no: number
          id: string
          lang: string
          name: string
          notes: string | null
          phone: string | null
          points: number
          pregnant: boolean
          skin_type: string | null
          user_id: string | null
        }
        Insert: {
          birth_date?: string | null
          breastfeeding?: boolean
          created_at?: string
          file_no?: number
          id?: string
          lang?: string
          name?: string
          notes?: string | null
          phone?: string | null
          points?: number
          pregnant?: boolean
          skin_type?: string | null
          user_id?: string | null
        }
        Update: {
          birth_date?: string | null
          breastfeeding?: boolean
          created_at?: string
          file_no?: number
          id?: string
          lang?: string
          name?: string
          notes?: string | null
          phone?: string | null
          points?: number
          pregnant?: boolean
          skin_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          author_id: string | null
          created_at: string
          id: string
          items: Json
          patient_id: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          id?: string
          items?: Json
          patient_id: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          id?: string
          items?: Json
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          key: string
          name: string
          price: number | null
          recommended: boolean
          size: string
          sort: number
          stock: number
          visible: boolean
        }
        Insert: {
          category: string
          key: string
          name: string
          price?: number | null
          recommended?: boolean
          size?: string
          sort?: number
          stock?: number
          visible?: boolean
        }
        Update: {
          category?: string
          key?: string
          name?: string
          price?: number | null
          recommended?: boolean
          size?: string
          sort?: number
          stock?: number
          visible?: boolean
        }
        Relationships: []
      }
      reviews: {
        Row: {
          appointment_id: string | null
          created_at: string
          id: string
          note: string | null
          patient_id: string | null
          stars: number
          tags: string[]
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          patient_id?: string | null
          stars: number
          tags?: string[]
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          patient_id?: string | null
          stars?: number
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          active: boolean
          id: string
          name: string
          sort: number
        }
        Insert: {
          active?: boolean
          id?: string
          name: string
          sort?: number
        }
        Update: {
          active?: boolean
          id?: string
          name?: string
          sort?: number
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          bookable_online: boolean
          description: string
          device_id: string | null
          key: string
          minutes: number
          name: string
          price: number
          price_from: boolean
          room_id: string | null
          short_name: string
          sort: number
        }
        Insert: {
          active?: boolean
          bookable_online?: boolean
          description?: string
          device_id?: string | null
          key: string
          minutes: number
          name: string
          price: number
          price_from?: boolean
          room_id?: string | null
          short_name: string
          sort?: number
        }
        Update: {
          active?: boolean
          bookable_online?: boolean
          description?: string
          device_id?: string | null
          key?: string
          minutes?: number
          name?: string
          price?: number
          price_from?: boolean
          room_id?: string | null
          short_name?: string
          sort?: number
        }
        Relationships: [
          {
            foreignKeyName: "services_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      session_notes: {
        Row: {
          appointment_id: string | null
          author_id: string | null
          body: string
          created_at: string
          id: string
          patient_id: string
        }
        Insert: {
          appointment_id?: string | null
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          patient_id: string
        }
        Update: {
          appointment_id?: string | null
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      staff: {
        Row: {
          active: boolean
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          photo_url: string | null
          role: Database["public"]["Enums"]["staff_role"]
          title: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          photo_url?: string | null
          role: Database["public"]["Enums"]["staff_role"]
          title?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_my_appointment: {
        Args: { p_id: string; p_reason: string }
        Returns: undefined
      }
      ensure_patient: {
        Args: never
        Returns: {
          birth_date: string | null
          breastfeeding: boolean
          created_at: string
          file_no: number
          id: string
          lang: string
          name: string
          notes: string | null
          phone: string | null
          points: number
          pregnant: boolean
          skin_type: string | null
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "patients"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      link_my_staff: {
        Args: never
        Returns: Database["public"]["Tables"]["staff"]["Row"]
      }
      today_queue: {
        Args: never
        Returns: {
          called_at: string
          queue_no: number
          room: string
          starts_at: string
          status: Database["public"]["Enums"]["appointment_status"]
        }[]
      }
      track_app_open: {
        Args: { p_channel: string; p_device_id: string; p_platform: string }
        Returns: undefined
      }
    }
    Enums: {
      appointment_status:
        | "pending"
        | "confirmed"
        | "checked_in"
        | "in_session"
        | "done"
        | "no_show"
        | "cancelled"
      order_status:
        | "new"
        | "preparing"
        | "ready"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      pay_method: "cash" | "card" | "package" | "points"
      staff_role: "owner" | "admin" | "specialist" | "reception" | "accountant"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      appointment_status: [
        "pending",
        "confirmed",
        "checked_in",
        "in_session",
        "done",
        "no_show",
        "cancelled",
      ],
      order_status: [
        "new",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      pay_method: ["cash", "card", "package", "points"],
      staff_role: ["owner", "admin", "specialist", "reception", "accountant"],
    },
  },
} as const
