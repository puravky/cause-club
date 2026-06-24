export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: string;
          subscription_status: string | null;
          subscription_plan: string | null;
          charity_id: string | null;
          charity_percentage: number;
          stripe_customer_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          role?: string;
          subscription_status?: string | null;
          subscription_plan?: string | null;
          charity_id?: string | null;
          charity_percentage?: number;
          stripe_customer_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          role?: string;
          subscription_status?: string | null;
          subscription_plan?: string | null;
          charity_id?: string | null;
          charity_percentage?: number;
          stripe_customer_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "users_charity_id_fkey";
            columns: ["charity_id"];
            referencedRelation: "charities";
            referencedColumns: ["id"];
          },
        ];
      };

      scores: {
        Row: {
          id: string;
          user_id: string;
          score: number;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          score: number;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          score?: number;
          date?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scores_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };

      charities: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          images: string[] | null;
          events: Json | null;
          featured: boolean;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          images?: string[] | null;
          events?: Json | null;
          featured?: boolean;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          images?: string[] | null;
          events?: Json | null;
          featured?: boolean;
          created_at?: string | null;
        };
        Relationships: [];
      };

      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string | null;
          plan: "monthly" | "yearly";
          status: string | null;
          current_period_end: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id?: string | null;
          plan: "monthly" | "yearly";
          status?: string | null;
          current_period_end?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_subscription_id?: string | null;
          plan?: "monthly" | "yearly";
          status?: string | null;
          current_period_end?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };

      draws: {
        Row: {
          id: string;
          month: number;
          year: number;
          draw_type: "random" | "algorithm";
          status: "draft" | "simulated" | "published";
          drawn_numbers: number[] | null;
          jackpot_amount: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          month: number;
          year: number;
          draw_type: "random" | "algorithm";
          status?: "draft" | "simulated" | "published";
          drawn_numbers?: number[] | null;
          jackpot_amount?: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          month?: number;
          year?: number;
          draw_type?: "random" | "algorithm";
          status?: "draft" | "simulated" | "published";
          drawn_numbers?: number[] | null;
          jackpot_amount?: number;
          created_at?: string | null;
        };
        Relationships: [];
      };

      draw_results: {
        Row: {
          id: string;
          draw_id: string;
          user_id: string;
          match_type: 3 | 4 | 5;
          prize_amount: number;
          verification_status: string;
          payout_status: string;
          proof_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          draw_id: string;
          user_id: string;
          match_type: 3 | 4 | 5;
          prize_amount?: number;
          verification_status?: string;
          payout_status?: string;
          proof_url?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          draw_id?: string;
          user_id?: string;
          match_type?: 3 | 4 | 5;
          prize_amount?: number;
          verification_status?: string;
          payout_status?: string;
          proof_url?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "draw_results_draw_id_fkey";
            columns: ["draw_id"];
            referencedRelation: "draws";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "draw_results_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };

      prize_pool: {
        Row: {
          id: string;
          draw_id: string;
          total_amount: number;
          tier_3_amount: number;
          tier_4_amount: number;
          tier_5_amount: number;
          jackpot_carried_over: number;
        };
        Insert: {
          id?: string;
          draw_id: string;
          total_amount?: number;
          tier_3_amount?: number;
          tier_4_amount?: number;
          tier_5_amount?: number;
          jackpot_carried_over?: number;
        };
        Update: {
          id?: string;
          draw_id?: string;
          total_amount?: number;
          tier_3_amount?: number;
          tier_4_amount?: number;
          tier_5_amount?: number;
          jackpot_carried_over?: number;
        };
        Relationships: [
          {
            foreignKeyName: "prize_pool_draw_id_fkey";
            columns: ["draw_id"];
            referencedRelation: "draws";
            referencedColumns: ["id"];
          },
        ];
      };

      donations: {
        Row: {
          id: string;
          user_id: string;
          charity_id: string;
          amount: number;
          type: "subscription_percentage" | "independent";
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          charity_id: string;
          amount?: number;
          type: "subscription_percentage" | "independent";
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          charity_id?: string;
          amount?: number;
          type?: "subscription_percentage" | "independent";
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "donations_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "donations_charity_id_fkey";
            columns: ["charity_id"];
            referencedRelation: "charities";
            referencedColumns: ["id"];
          },
        ];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };

    Enums: {
      [_ in never]: never;
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

/* ─── Convenience aliases ───────────────────── */

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type UpdateDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
