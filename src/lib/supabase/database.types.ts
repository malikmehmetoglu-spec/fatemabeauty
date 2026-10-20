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
          eligibility: Json | null
          eligibility_at: string | null
          finished_at: string | null
          id: string
          minutes: number
          note: string | null
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
          eligibility?: Json | null
          eligibility_at?: string | null
          finished_at?: string | null
          id?: string
          minutes: number
          note?: string | null
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
          eligibility?: Json | null
          eligibility_at?: string | null
          finished_at?: string | null
          id?: string
          minutes?: number
          note?: string | null
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
      campaigns: {
        Row: {
          audience: string
          body: string
          channel: string
          created_at: string
          created_by: string | null
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string
          body?: string
          channel?: string
          created_at?: string
          created_by?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          body?: string
          channel?: string
          created_at?: string
          created_by?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cash_shifts: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          counted_cash: number | null
          expected_cash: number | null
          id: string
          note: string | null
          opened_at: string
          opened_by: string | null
          opening_cash: number
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          counted_cash?: number | null
          expected_cash?: number | null
          id?: string
          note?: string | null
          opened_at?: string
          opened_by?: string | null
          opening_cash?: number
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          counted_cash?: number | null
          expected_cash?: number | null
          id?: string
          note?: string | null
          opened_at?: string
          opened_by?: string | null
          opening_cash?: number
        }
        Relationships: []
      }
      commission_rules: {
        Row: {
          note: string
          percent: number
          staff_id: string
          updated_at: string
        }
        Insert: {
          note?: string
          percent: number
          staff_id: string
          updated_at?: string
        }
        Update: {
          note?: string
          percent?: number
          staff_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_rules_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: true
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          answers: Json
          appointment_id: string | null
          id: string
          patient_id: string
          service_key: string | null
          signature_path: string | null
          signed_at: string
        }
        Insert: {
          answers?: Json
          appointment_id?: string | null
          id?: string
          patient_id: string
          service_key?: string | null
          signature_path?: string | null
          signed_at?: string
        }
        Update: {
          answers?: Json
          appointment_id?: string | null
          id?: string
          patient_id?: string
          service_key?: string | null
          signature_path?: string | null
          signed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consents_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
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
      exchange_rates: {
        Row: {
          created_at: string
          created_by: string | null
          effective_at: string
          id: string
          note: string
          source: string
          usd_to_syp: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          effective_at?: string
          id?: string
          note?: string
          source?: string
          usd_to_syp: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          effective_at?: string
          id?: string
          note?: string
          source?: string
          usd_to_syp?: number
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          from_cash_box: boolean
          id: string
          label: string
          note: string | null
          shift_id: string | null
          spent_on: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by?: string | null
          from_cash_box?: boolean
          id?: string
          label: string
          note?: string | null
          shift_id?: string | null
          spent_on?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          from_cash_box?: boolean
          id?: string
          label?: string
          note?: string | null
          shift_id?: string | null
          spent_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "cash_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_requests: {
        Row: {
          amount: number | null
          created_at: string
          id: string
          message: string | null
          patient_id: string
          recipient_name: string
          recipient_phone: string | null
          service_key: string | null
          status: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: string
          message?: string | null
          patient_id: string
          recipient_name: string
          recipient_phone?: string | null
          service_key?: string | null
          status?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: string
          message?: string | null
          patient_id?: string
          recipient_name?: string
          recipient_phone?: string | null
          service_key?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_requests_service_key_fkey"
            columns: ["service_key"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["key"]
          },
        ]
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          kind: string
          label: string
          qty: number
          ref: string | null
          unit_price: number
        }
        Insert: {
          id?: string
          invoice_id: string
          kind?: string
          label: string
          qty?: number
          ref?: string | null
          unit_price: number
        }
        Update: {
          id?: string
          invoice_id?: string
          kind?: string
          label?: string
          qty?: number
          ref?: string | null
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
      invoice_payments: {
        Row: {
          amount: number
          created_by: string | null
          id: string
          invoice_id: string
          method: Database["public"]["Enums"]["pay_method"]
          paid_at: string
          shift_id: string | null
        }
        Insert: {
          amount: number
          created_by?: string | null
          id?: string
          invoice_id: string
          method: Database["public"]["Enums"]["pay_method"]
          paid_at?: string
          shift_id?: string | null
        }
        Update: {
          amount?: number
          created_by?: string | null
          id?: string
          invoice_id?: string
          method?: Database["public"]["Enums"]["pay_method"]
          paid_at?: string
          shift_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_payments_shift_fk"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "cash_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          appointment_id: string | null
          created_at: string
          created_by: string | null
          discount: number
          discount_approved_by: string | null
          due_on: string | null
          id: string
          method: Database["public"]["Enums"]["pay_method"]
          no: string
          note: string | null
          paid: boolean
          patient_id: string | null
          patient_package_id: string | null
          refund_cash: number
          refund_shift_id: string | null
          shift_id: string | null
          subtotal: number
          total: number
          void: boolean
          void_at: string | null
          void_by: string | null
          walk_in_name: string | null
        }
        Insert: {
          amount_paid?: number
          appointment_id?: string | null
          created_at?: string
          created_by?: string | null
          discount?: number
          discount_approved_by?: string | null
          due_on?: string | null
          id?: string
          method?: Database["public"]["Enums"]["pay_method"]
          no?: string
          note?: string | null
          paid?: boolean
          patient_id?: string | null
          patient_package_id?: string | null
          refund_cash?: number
          refund_shift_id?: string | null
          shift_id?: string | null
          subtotal?: number
          total?: number
          void?: boolean
          void_at?: string | null
          void_by?: string | null
          walk_in_name?: string | null
        }
        Update: {
          amount_paid?: number
          appointment_id?: string | null
          created_at?: string
          created_by?: string | null
          discount?: number
          discount_approved_by?: string | null
          due_on?: string | null
          id?: string
          method?: Database["public"]["Enums"]["pay_method"]
          no?: string
          note?: string | null
          paid?: boolean
          patient_id?: string | null
          patient_package_id?: string | null
          refund_cash?: number
          refund_shift_id?: string | null
          shift_id?: string | null
          subtotal?: number
          total?: number
          void?: boolean
          void_at?: string | null
          void_by?: string | null
          walk_in_name?: string | null
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
          {
            foreignKeyName: "invoices_patient_package_id_fkey"
            columns: ["patient_package_id"]
            isOneToOne: false
            referencedRelation: "patient_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_refund_shift_id_fkey"
            columns: ["refund_shift_id"]
            isOneToOne: false
            referencedRelation: "cash_shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_shift_fk"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "cash_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          created_at: string
          decided_by: string | null
          ends: string
          id: string
          kind: string
          reason: string
          staff_id: string
          starts: string
          status: string
        }
        Insert: {
          created_at?: string
          decided_by?: string | null
          ends: string
          id?: string
          kind?: string
          reason?: string
          staff_id: string
          starts: string
          status?: string
        }
        Update: {
          created_at?: string
          decided_by?: string | null
          ends?: string
          id?: string
          kind?: string
          reason?: string
          staff_id?: string
          starts?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          from_patient: boolean
          id: string
          patient_id: string
          read_at: string | null
          staff_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          from_patient: boolean
          id?: string
          patient_id: string
          read_at?: string | null
          staff_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          from_patient?: boolean
          id?: string
          patient_id?: string
          read_at?: string | null
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          kind: string
          link: string | null
          patient_id: string
          read_at: string | null
          title: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          patient_id: string
          read_at?: string | null
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          patient_id?: string
          read_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          active: boolean
          code: string | null
          created_at: string
          ends_on: string | null
          id: string
          kind: string
          max_uses: number | null
          service_key: string | null
          starts_on: string | null
          title: string
          uses: number
          value: number
        }
        Insert: {
          active?: boolean
          code?: string | null
          created_at?: string
          ends_on?: string | null
          id?: string
          kind?: string
          max_uses?: number | null
          service_key?: string | null
          starts_on?: string | null
          title: string
          uses?: number
          value: number
        }
        Update: {
          active?: boolean
          code?: string | null
          created_at?: string
          ends_on?: string | null
          id?: string
          kind?: string
          max_uses?: number | null
          service_key?: string | null
          starts_on?: string | null
          title?: string
          uses?: number
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "offers_service_key_fkey"
            columns: ["service_key"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["key"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          name: string
          order_id: string
          product_key: string
          qty: number
          unit_price: number
        }
        Insert: {
          id?: string
          name?: string
          order_id: string
          product_key: string
          qty: number
          unit_price: number
        }
        Update: {
          id?: string
          name?: string
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
          updated_at: string
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
          updated_at?: string
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
          updated_at?: string
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
          invoice_id: string | null
          package_id: string
          patient_id: string
          price_paid: number
          purchased_at: string
          sessions_total: number
          sessions_used: number
        }
        Insert: {
          id?: string
          invoice_id?: string | null
          package_id: string
          patient_id: string
          price_paid?: number
          purchased_at?: string
          sessions_total: number
          sessions_used?: number
        }
        Update: {
          id?: string
          invoice_id?: string | null
          package_id?: string
          patient_id?: string
          price_paid?: number
          purchased_at?: string
          sessions_total?: number
          sessions_used?: number
        }
        Relationships: [
          {
            foreignKeyName: "patient_packages_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
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
      patient_photos: {
        Row: {
          angle: string
          appointment_id: string | null
          created_at: string
          created_by: string | null
          id: string
          path: string
          patient_id: string | null
          stage: string
        }
        Insert: {
          angle?: string
          appointment_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          path: string
          patient_id?: string | null
          stage?: string
        }
        Update: {
          angle?: string
          appointment_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          path?: string
          patient_id?: string | null
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_photos_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_photos_patient_id_fkey"
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
          notify: Json
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
          notify?: Json
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
          notify?: Json
          phone?: string | null
          points?: number
          pregnant?: boolean
          skin_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payroll_entries: {
        Row: {
          amount_original: number | null
          amount_syp: number | null
          base_salary: number
          bonus: number
          commission: number
          created_at: string
          currency: string
          deductions: number
          fx_rate: number | null
          id: string
          note: string
          paid_at: string | null
          period: string
          staff_id: string
        }
        Insert: {
          amount_original?: number | null
          amount_syp?: number | null
          base_salary?: number
          bonus?: number
          commission?: number
          created_at?: string
          currency?: string
          deductions?: number
          fx_rate?: number | null
          id?: string
          note?: string
          paid_at?: string | null
          period: string
          staff_id: string
        }
        Update: {
          amount_original?: number | null
          amount_syp?: number | null
          base_salary?: number
          bonus?: number
          commission?: number
          created_at?: string
          currency?: string
          deductions?: number
          fx_rate?: number | null
          id?: string
          note?: string
          paid_at?: string | null
          period?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_entries_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
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
          active: boolean
          category: string
          cost: number | null
          created_at: string
          description: string
          image_path: string | null
          key: string
          kind: string
          min_stock: number
          name: string
          price: number | null
          recommended: boolean
          show_in_store: boolean
          size: string
          sku: string | null
          sort: number
          stock: number
          unit: string
          updated_at: string
          usage: string
        }
        Insert: {
          active?: boolean
          category?: string
          cost?: number | null
          created_at?: string
          description?: string
          image_path?: string | null
          key?: string
          kind?: string
          min_stock?: number
          name: string
          price?: number | null
          recommended?: boolean
          show_in_store?: boolean
          size?: string
          sku?: string | null
          sort?: number
          stock?: number
          unit?: string
          updated_at?: string
          usage?: string
        }
        Update: {
          active?: boolean
          category?: string
          cost?: number | null
          created_at?: string
          description?: string
          image_path?: string | null
          key?: string
          kind?: string
          min_stock?: number
          name?: string
          price?: number | null
          recommended?: boolean
          show_in_store?: boolean
          size?: string
          sku?: string | null
          sort?: number
          stock?: number
          unit?: string
          updated_at?: string
          usage?: string
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
      service_categories: {
        Row: {
          active: boolean
          created_at: string
          icon: string
          instructions: string
          key: string
          name: string
          not_for_pregnant: boolean
          short_description: string
          sort: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          icon?: string
          instructions?: string
          key: string
          name: string
          not_for_pregnant?: boolean
          short_description?: string
          sort?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          icon?: string
          instructions?: string
          key?: string
          name?: string
          not_for_pregnant?: boolean
          short_description?: string
          sort?: number
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          bookable_online: boolean
          category_id: string | null
          description: string
          device_id: string | null
          is_consultation: boolean
          key: string
          minutes: number
          name: string
          price: number
          price_currency: string
          price_from: boolean
          room_id: string | null
          short_name: string
          sort: number
        }
        Insert: {
          active?: boolean
          bookable_online?: boolean
          category_id?: string | null
          description?: string
          device_id?: string | null
          is_consultation?: boolean
          key: string
          minutes: number
          name: string
          price: number
          price_currency?: string
          price_from?: boolean
          room_id?: string | null
          short_name: string
          sort?: number
        }
        Update: {
          active?: boolean
          bookable_online?: boolean
          category_id?: string | null
          description?: string
          device_id?: string | null
          is_consultation?: boolean
          key?: string
          minutes?: number
          name?: string
          price?: number
          price_currency?: string
          price_from?: boolean
          room_id?: string | null
          short_name?: string
          sort?: number
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["key"]
          },
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
          fields: Json
          id: string
          patient_id: string
        }
        Insert: {
          appointment_id?: string | null
          author_id?: string | null
          body: string
          created_at?: string
          fields?: Json
          id?: string
          patient_id: string
        }
        Update: {
          appointment_id?: string | null
          author_id?: string | null
          body?: string
          created_at?: string
          fields?: Json
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
          is_consultant: boolean
          name: string
          phone: string | null
          photo_url: string | null
          role: Database["public"]["Enums"]["staff_role"]
          title: string
          user_id: string | null
          username: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          is_consultant?: boolean
          name: string
          phone?: string | null
          photo_url?: string | null
          role: Database["public"]["Enums"]["staff_role"]
          title?: string
          user_id?: string | null
          username?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          is_consultant?: boolean
          name?: string
          phone?: string | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          title?: string
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      staff_attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string
          day: string
          id: string
          note: string
          staff_id: string
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          day?: string
          id?: string
          note?: string
          staff_id: string
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          day?: string
          id?: string
          note?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_attendance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_hours: {
        Row: {
          created_at: string
          ends: string
          id: string
          staff_id: string
          starts: string
          weekday: number
        }
        Insert: {
          created_at?: string
          ends: string
          id?: string
          staff_id: string
          starts: string
          weekday: number
        }
        Update: {
          created_at?: string
          ends?: string
          id?: string
          staff_id?: string
          starts?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "staff_hours_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_salaries: {
        Row: {
          base_salary: number
          salary_currency: string
          staff_id: string
          updated_at: string
        }
        Insert: {
          base_salary?: number
          salary_currency?: string
          staff_id: string
          updated_at?: string
        }
        Update: {
          base_salary?: number
          salary_currency?: string
          staff_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_salaries_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: true
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_shifts: {
        Row: {
          created_at: string
          day: string
          ends: string
          id: string
          note: string
          room_id: string | null
          staff_id: string
          starts: string
        }
        Insert: {
          created_at?: string
          day: string
          ends: string
          id?: string
          note?: string
          room_id?: string | null
          staff_id: string
          starts: string
        }
        Update: {
          created_at?: string
          day?: string
          ends?: string
          id?: string
          note?: string
          room_id?: string | null
          staff_id?: string
          starts?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_shifts_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_shifts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_batch_takes: {
        Row: {
          batch_id: string
          movement_id: number
          qty: number
        }
        Insert: {
          batch_id: string
          movement_id: number
          qty: number
        }
        Update: {
          batch_id?: string
          movement_id?: number
          qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_batch_takes_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "stock_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_batch_takes_movement_id_fkey"
            columns: ["movement_id"]
            isOneToOne: false
            referencedRelation: "stock_movements"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_batches: {
        Row: {
          created_by: string | null
          expires_on: string | null
          id: string
          location_id: string
          product_key: string
          qty_left: number
          qty_received: number
          received_at: string
          source: string
          supplier: string | null
          unit_cost: number | null
        }
        Insert: {
          created_by?: string | null
          expires_on?: string | null
          id?: string
          location_id: string
          product_key: string
          qty_left: number
          qty_received: number
          received_at?: string
          source?: string
          supplier?: string | null
          unit_cost?: number | null
        }
        Update: {
          created_by?: string | null
          expires_on?: string | null
          id?: string
          location_id?: string
          product_key?: string
          qty_left?: number
          qty_received?: number
          received_at?: string
          source?: string
          supplier?: string | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_batches_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_batches_product_key_fkey"
            columns: ["product_key"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["key"]
          },
        ]
      }
      stock_locations: {
        Row: {
          active: boolean
          created_at: string
          id: string
          is_default_center: boolean
          kind: string
          name: string
          note: string
          sells_online: boolean
          sort: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          is_default_center?: boolean
          kind?: string
          name: string
          note?: string
          sells_online?: boolean
          sort?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          is_default_center?: boolean
          kind?: string
          name?: string
          note?: string
          sells_online?: boolean
          sort?: number
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string | null
          delta: number
          id: number
          location_id: string | null
          note: string | null
          product_key: string
          reason: string
          ref_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delta: number
          id?: never
          location_id?: string | null
          note?: string | null
          product_key: string
          reason: string
          ref_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delta?: number
          id?: never
          location_id?: string | null
          note?: string | null
          product_key?: string
          reason?: string
          ref_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_key_fkey"
            columns: ["product_key"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["key"]
          },
        ]
      }
      store_slides: {
        Row: {
          active: boolean
          body: string
          created_at: string
          cta_href: string
          cta_label: string
          cta2_href: string
          cta2_label: string
          eyebrow: string
          id: string
          image_path: string | null
          sort: number
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          body?: string
          created_at?: string
          cta_href?: string
          cta_label?: string
          cta2_href?: string
          cta2_label?: string
          eyebrow?: string
          id?: string
          image_path?: string | null
          sort?: number
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          body?: string
          created_at?: string
          cta_href?: string
          cta_label?: string
          cta2_href?: string
          cta2_label?: string
          eyebrow?: string
          id?: string
          image_path?: string | null
          sort?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      surveys: {
        Row: {
          answers: Json
          appointment_id: string | null
          created_at: string
          id: string
          note: string | null
          patient_id: string
        }
        Insert: {
          answers?: Json
          appointment_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          patient_id: string
        }
        Update: {
          answers?: Json
          appointment_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveys_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          appointment_id: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string | null
          note: string | null
          part: string
          patient_id: string | null
          phone: string | null
          preferred_day: string | null
          service_key: string | null
          specialist_id: string | null
          status: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string | null
          note?: string | null
          part?: string
          patient_id?: string | null
          phone?: string | null
          preferred_day?: string | null
          service_key?: string | null
          specialist_id?: string | null
          status?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string | null
          note?: string | null
          part?: string
          patient_id?: string | null
          phone?: string | null
          preferred_day?: string | null
          service_key?: string | null
          specialist_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_service_key_fkey"
            columns: ["service_key"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "waitlist_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_stock: {
        Args: { p_counted: number; p_note?: string; p_product: string }
        Returns: undefined
      }
      adjust_stock_at: {
        Args: {
          p_counted: number
          p_location: string
          p_note?: string
          p_product: string
        }
        Returns: undefined
      }
      app_slots: {
        Args: { p_day: string; p_service: string; p_specialist?: string }
        Returns: {
          available: boolean
          starts_at: string
        }[]
      }
      attendance_punch: {
        Args: { p_kind: string }
        Returns: {
          check_in: string | null
          check_out: string | null
          created_at: string
          day: string
          id: string
          note: string
          staff_id: string
        }
        SetofOptions: {
          from: "*"
          to: "staff_attendance"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      book_appointment: {
        Args: {
          p_check_in?: boolean
          p_patient?: string
          p_room?: string
          p_service: string
          p_source?: string
          p_specialist?: string
          p_starts: string
          p_walk_in_name?: string
          p_walk_in_phone?: string
        }
        Returns: {
          called_at: string | null
          cancel_reason: string | null
          checked_in_at: string | null
          created_at: string
          created_by: string | null
          eligibility: Json | null
          eligibility_at: string | null
          finished_at: string | null
          id: string
          minutes: number
          note: string | null
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
        SetofOptions: {
          from: "*"
          to: "appointments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      booked_ranges: {
        Args: { p_from: string; p_to: string }
        Returns: {
          ends_at: string
          room_id: string
          specialist_id: string
          starts_at: string
        }[]
      }
      booking_weekdays: {
        Args: { p_service: string; p_specialist?: string }
        Returns: number[]
      }
      cancel_my_appointment: {
        Args: { p_id: string; p_reason: string }
        Returns: undefined
      }
      cancel_order: { Args: { p_order: string }; Returns: undefined }
      cash_shift_expected: { Args: { p_shift: string }; Returns: number }
      close_cash_shift: {
        Args: { p_counted: number; p_note?: string }
        Returns: {
          closed_at: string | null
          closed_by: string | null
          counted_cash: number | null
          expected_cash: number | null
          id: string
          note: string | null
          opened_at: string
          opened_by: string | null
          opening_cash: number
        }
        SetofOptions: {
          from: "*"
          to: "cash_shifts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_invoice: {
        Args: {
          p_appointment: string
          p_discount: number
          p_due_on?: string
          p_items: Json
          p_note?: string
          p_patient: string
          p_patient_package?: string
          p_payments: Json
          p_walk_in_name?: string
        }
        Returns: {
          amount_paid: number
          appointment_id: string | null
          created_at: string
          created_by: string | null
          discount: number
          discount_approved_by: string | null
          due_on: string | null
          id: string
          method: Database["public"]["Enums"]["pay_method"]
          no: string
          note: string | null
          paid: boolean
          patient_id: string | null
          patient_package_id: string | null
          refund_cash: number
          refund_shift_id: string | null
          shift_id: string | null
          subtotal: number
          total: number
          void: boolean
          void_at: string | null
          void_by: string | null
          walk_in_name: string | null
        }
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: true
          isSetofReturn: false
        }
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
          notify: Json
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
        Returns: {
          active: boolean
          created_at: string
          email: string | null
          id: string
          is_consultant: boolean
          name: string
          phone: string | null
          photo_url: string | null
          role: Database["public"]["Enums"]["staff_role"]
          title: string
          user_id: string | null
          username: string | null
        }
        SetofOptions: {
          from: "*"
          to: "staff"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      my_queue: {
        Args: never
        Returns: {
          ahead: number
          appointment_id: string
          called_at: string
          now_serving: number
          queue_no: number
          room: string
          starts_at: string
          status: Database["public"]["Enums"]["appointment_status"]
        }[]
      }
      open_cash_shift: {
        Args: { p_opening: number }
        Returns: {
          closed_at: string | null
          closed_by: string | null
          counted_cash: number | null
          expected_cash: number | null
          id: string
          note: string | null
          opened_at: string
          opened_by: string | null
          opening_cash: number
        }
        SetofOptions: {
          from: "*"
          to: "cash_shifts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      pay_invoice: {
        Args: {
          p_amount: number
          p_invoice: string
          p_method: Database["public"]["Enums"]["pay_method"]
        }
        Returns: {
          amount_paid: number
          appointment_id: string | null
          created_at: string
          created_by: string | null
          discount: number
          discount_approved_by: string | null
          due_on: string | null
          id: string
          method: Database["public"]["Enums"]["pay_method"]
          no: string
          note: string | null
          paid: boolean
          patient_id: string | null
          patient_package_id: string | null
          refund_cash: number
          refund_shift_id: string | null
          shift_id: string | null
          subtotal: number
          total: number
          void: boolean
          void_at: string | null
          void_by: string | null
          walk_in_name: string | null
        }
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      place_order: {
        Args: { p_address?: string; p_delivery: boolean; p_items: Json }
        Returns: {
          address: string | null
          created_at: string
          delivery: boolean
          id: string
          no: number
          patient_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          total: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      public_book: {
        Args: {
          p_name: string
          p_note?: string
          p_phone: string
          p_service: string
          p_specialist: string
          p_starts: string
        }
        Returns: Json
      }
      public_booking_info: { Args: never; Returns: Json }
      public_slots: {
        Args: { p_day: string; p_service: string; p_specialist?: string }
        Returns: {
          available: boolean
          starts_at: string
        }[]
      }
      receive_stock: {
        Args: {
          p_expires?: string
          p_product: string
          p_qty: number
          p_supplier?: string
          p_unit_cost?: number
        }
        Returns: undefined
      }
      receive_stock_at: {
        Args: {
          p_expires?: string
          p_location?: string
          p_product: string
          p_qty: number
          p_supplier?: string
          p_unit_cost?: number
        }
        Returns: undefined
      }
      save_stock_location: {
        Args: {
          p_active?: boolean
          p_id: string
          p_is_default?: boolean
          p_kind: string
          p_name: string
          p_note?: string
          p_sells_online?: boolean
          p_sort?: number
        }
        Returns: {
          active: boolean
          created_at: string
          id: string
          is_default_center: boolean
          kind: string
          name: string
          note: string
          sells_online: boolean
          sort: number
        }
        SetofOptions: {
          from: "*"
          to: "stock_locations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      service_price_syp: { Args: { p_key: string }; Returns: number }
      service_prices_syp: {
        Args: never
        Returns: {
          key: string
          price_syp: number
        }[]
      }
      set_exchange_rate: {
        Args: { p_note?: string; p_rate: number; p_source?: string }
        Returns: {
          created_at: string
          created_by: string | null
          effective_at: string
          id: string
          note: string
          source: string
          usd_to_syp: number
        }
        SetofOptions: {
          from: "*"
          to: "exchange_rates"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_usd_rate: {
        Args: { p_note?: string; p_rate: number }
        Returns: {
          created_at: string
          created_by: string | null
          effective_at: string
          id: string
          note: string
          source: string
          usd_to_syp: number
        }
        SetofOptions: {
          from: "*"
          to: "exchange_rates"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      store_bestsellers: { Args: { p_limit?: number }; Returns: string[] }
      store_products: {
        Args: { p_keys?: string[] }
        Returns: {
          active: boolean
          category: string
          cost: number | null
          created_at: string
          description: string
          image_path: string | null
          key: string
          kind: string
          min_stock: number
          name: string
          price: number | null
          recommended: boolean
          show_in_store: boolean
          size: string
          sku: string | null
          sort: number
          stock: number
          unit: string
          updated_at: string
          usage: string
        }[]
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      syp_ceil5: { Args: { p_amount: number }; Returns: number }
      to_syp: {
        Args: { p_amount: number; p_currency: string }
        Returns: number
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
      transfer_stock: {
        Args: {
          p_from: string
          p_note?: string
          p_product: string
          p_qty: number
          p_to: string
        }
        Returns: undefined
      }
      void_invoice: {
        Args: { p_invoice: string; p_reason?: string }
        Returns: undefined
      }
      waste_stock: {
        Args: {
          p_batch?: string
          p_note?: string
          p_product: string
          p_qty: number
        }
        Returns: undefined
      }
      waste_stock_at: {
        Args: {
          p_batch?: string
          p_location?: string
          p_note?: string
          p_product: string
          p_qty: number
        }
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
