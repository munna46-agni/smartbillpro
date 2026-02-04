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
      bank_accounts: {
        Row: {
          account_name: string
          account_number: string | null
          account_type: string
          bank_name: string
          created_at: string
          current_balance: number
          id: string
          ifsc_code: string | null
          updated_at: string
          upi_id: string | null
        }
        Insert: {
          account_name: string
          account_number?: string | null
          account_type?: string
          bank_name: string
          created_at?: string
          current_balance?: number
          id?: string
          ifsc_code?: string | null
          updated_at?: string
          upi_id?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string | null
          account_type?: string
          bank_name?: string
          created_at?: string
          current_balance?: number
          id?: string
          ifsc_code?: string | null
          updated_at?: string
          upi_id?: string | null
        }
        Relationships: []
      }
      bank_transactions: {
        Row: {
          amount: number
          bank_account_id: string
          created_at: string
          description: string | null
          id: string
          reference_no: string | null
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["transaction_type_enum"]
        }
        Insert: {
          amount?: number
          bank_account_id: string
          created_at?: string
          description?: string | null
          id?: string
          reference_no?: string | null
          transaction_date?: string
          transaction_type: Database["public"]["Enums"]["transaction_type_enum"]
        }
        Update: {
          amount?: number
          bank_account_id?: string
          created_at?: string
          description?: string | null
          id?: string
          reference_no?: string | null
          transaction_date?: string
          transaction_type?: Database["public"]["Enums"]["transaction_type_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_closing: {
        Row: {
          created_at: string
          date: string
          difference: number
          id: string
          opening_cash: number
          physical_cash: number
          system_cash: number
        }
        Insert: {
          created_at?: string
          date?: string
          difference?: number
          id?: string
          opening_cash?: number
          physical_cash?: number
          system_cash?: number
        }
        Update: {
          created_at?: string
          date?: string
          difference?: number
          id?: string
          opening_cash?: number
          physical_cash?: number
          system_cash?: number
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          mobile_number: string
          name: string
          notes: string | null
          total_balance: number
          total_purchases: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          mobile_number: string
          name: string
          notes?: string | null
          total_balance?: number
          total_purchases?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          mobile_number?: string
          name?: string
          notes?: string | null
          total_balance?: number
          total_purchases?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          cost_price: number
          created_at: string
          id: string
          item_type: string
          name: string
          selling_price: number
          stock: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          cost_price?: number
          created_at?: string
          id?: string
          item_type?: string
          name: string
          selling_price?: number
          stock?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          cost_price?: number
          created_at?: string
          id?: string
          item_type?: string
          name?: string
          selling_price?: number
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          cost: number
          created_at: string
          date: string
          id: string
          invoice_no: string | null
          item_name: string
          quantity: number
          supplier_name: string
          total_amount: number
        }
        Insert: {
          cost?: number
          created_at?: string
          date?: string
          id?: string
          invoice_no?: string | null
          item_name: string
          quantity?: number
          supplier_name: string
          total_amount?: number
        }
        Update: {
          cost?: number
          created_at?: string
          date?: string
          id?: string
          invoice_no?: string | null
          item_name?: string
          quantity?: number
          supplier_name?: string
          total_amount?: number
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          created_at: string
          discount: number
          id: string
          item_type: string
          product_name: string
          quantity: number
          rate: number
          sale_id: string
          total: number
        }
        Insert: {
          created_at?: string
          discount?: number
          id?: string
          item_type?: string
          product_name: string
          quantity?: number
          rate?: number
          sale_id: string
          total?: number
        }
        Update: {
          created_at?: string
          discount?: number
          id?: string
          item_type?: string
          product_name?: string
          quantity?: number
          rate?: number
          sale_id?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          balance_amount: number
          bill_type: Database["public"]["Enums"]["bill_type_enum"]
          created_at: string
          customer_name: string | null
          due_date: string | null
          id: string
          invoice_date: string
          mobile_number: string | null
          paid_amount: number
          payment_mode: Database["public"]["Enums"]["payment_mode_enum"]
          total_amount: number
        }
        Insert: {
          balance_amount?: number
          bill_type?: Database["public"]["Enums"]["bill_type_enum"]
          created_at?: string
          customer_name?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          mobile_number?: string | null
          paid_amount?: number
          payment_mode?: Database["public"]["Enums"]["payment_mode_enum"]
          total_amount?: number
        }
        Update: {
          balance_amount?: number
          bill_type?: Database["public"]["Enums"]["bill_type_enum"]
          created_at?: string
          customer_name?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          mobile_number?: string | null
          paid_amount?: number
          payment_mode?: Database["public"]["Enums"]["payment_mode_enum"]
          total_amount?: number
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          gst_number: string | null
          id: string
          mobile_number: string | null
          name: string
          notes: string | null
          total_paid: number
          total_purchases: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          mobile_number?: string | null
          name: string
          notes?: string | null
          total_paid?: number
          total_purchases?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          mobile_number?: string | null
          name?: string
          notes?: string | null
          total_paid?: number
          total_purchases?: number
          updated_at?: string
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
      bill_type_enum: "Invoice" | "Return"
      payment_mode_enum: "Cash" | "UPI" | "Card"
      transaction_type_enum: "credit" | "debit"
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
      bill_type_enum: ["Invoice", "Return"],
      payment_mode_enum: ["Cash", "UPI", "Card"],
      transaction_type_enum: ["credit", "debit"],
    },
  },
} as const
