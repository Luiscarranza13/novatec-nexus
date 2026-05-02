export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      mensajes: {
        Row: {
          correo: string;
          creado_en: string;
          id: string;
          leido: boolean;
          mensaje: string;
          nombre: string;
        };
        Insert: {
          correo: string;
          creado_en?: string;
          id?: string;
          leido?: boolean;
          mensaje: string;
          nombre: string;
        };
        Update: {
          correo?: string;
          creado_en?: string;
          id?: string;
          leido?: boolean;
          mensaje?: string;
          nombre?: string;
        };
        Relationships: [];
      };
      perfiles: {
        Row: {
          actualizado_en: string;
          avatar_url: string | null;
          bio: string | null;
          creado_en: string;
          email_publico: string | null;
          facebook: string | null;
          github: string | null;
          id: string;
          instagram: string | null;
          linkedin: string | null;
          nombre: string;
          role: Database["public"]["Enums"]["app_role"];
          whatsapp: string | null;
        };
        Insert: {
          actualizado_en?: string;
          avatar_url?: string | null;
          bio?: string | null;
          creado_en?: string;
          email_publico?: string | null;
          facebook?: string | null;
          github?: string | null;
          id: string;
          instagram?: string | null;
          linkedin?: string | null;
          nombre?: string;
          role?: Database["public"]["Enums"]["app_role"];
          whatsapp?: string | null;
        };
        Update: {
          actualizado_en?: string;
          avatar_url?: string | null;
          bio?: string | null;
          creado_en?: string;
          email_publico?: string | null;
          facebook?: string | null;
          github?: string | null;
          id?: string;
          instagram?: string | null;
          linkedin?: string | null;
          nombre?: string;
          role?: Database["public"]["Enums"]["app_role"];
          whatsapp?: string | null;
        };
        Relationships: [];
      };
      proyectos: {
        Row: {
          categoria: string;
          creado_en: string;
          descripcion: string;
          destacado: boolean;
          id: string;
          imagen_url: string | null;
          link: string | null;
          nombre: string;
          orden: number;
        };
        Insert: {
          categoria?: string;
          creado_en?: string;
          descripcion?: string;
          destacado?: boolean;
          id?: string;
          imagen_url?: string | null;
          link?: string | null;
          nombre: string;
          orden?: number;
        };
        Update: {
          categoria?: string;
          creado_en?: string;
          descripcion?: string;
          destacado?: boolean;
          id?: string;
          imagen_url?: string | null;
          link?: string | null;
          nombre?: string;
          orden?: number;
        };
        Relationships: [];
      };
      servicios: {
        Row: {
          creado_en: string;
          descripcion: string;
          icono: string;
          id: string;
          orden: number;
          titulo: string;
        };
        Insert: {
          creado_en?: string;
          descripcion?: string;
          icono?: string;
          id?: string;
          orden?: number;
          titulo: string;
        };
        Update: {
          creado_en?: string;
          descripcion?: string;
          icono?: string;
          id?: string;
          orden?: number;
          titulo?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const;
