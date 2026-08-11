/**
 * Hand-written mirror of supabase/migrations/*.sql.
 *
 * Once the project exists you can regenerate this from the live schema:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/types.ts
 * Until then this keeps every query and RPC call type-checked.
 */

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export type ServiceRow = {
  id: string;
  slug: string;
  name_tr: string;
  name_en: string;
  summary_tr: string | null;
  summary_en: string | null;
  duration_min: number;
  buffer_min: number;
  active: boolean;
  sort: number;
  created_at: string;
}

export type AvailabilityRuleRow = {
  id: string;
  /** EXTRACT(DOW): 0 = Sunday ... 6 = Saturday */
  weekday: number;
  start_time: string;
  end_time: string;
  active: boolean;
  created_at: string;
}

export type AvailabilityExceptionRow = {
  id: string;
  date: string;
  is_closed: boolean;
  start_time: string | null;
  end_time: string | null;
  note: string | null;
  created_at: string;
}

export type AppointmentRow = {
  id: string;
  reference_code: string;
  service_id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  patient_name: string;
  patient_email: string;
  patient_phone: string | null;
  notes: string | null;
  locale: string;
  confirmation_sent_at: string | null;
  cancel_token: string;
  cancelled_at: string | null;
  created_at: string;
}

export type AdminSettingsRow = {
  id: boolean;
  slot_interval_min: number;
  min_notice_hours: number;
  max_advance_days: number;
  timezone: string;
  updated_at: string;
}

export type AdminRow = {
  user_id: string;
  email: string | null;
  created_at: string;
}

export type AvailableSlot = {
  slot_start: string;
  slot_end: string;
}

export type CreateBookingResult = {
  booking_id: string;
  booking_reference: string;
  booking_cancel_token: string;
  booking_starts_at: string;
  booking_ends_at: string;
  service_slug: string;
  service_name_tr: string;
  service_name_en: string;
  service_duration_min: number;
}

export type BookingByToken = {
  booking_reference: string;
  booking_status: AppointmentStatus;
  booking_starts_at: string;
  booking_ends_at: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string | null;
  notes: string | null;
  locale: string;
  service_slug: string;
  service_name_tr: string;
  service_name_en: string;
}

type Insertable<T, Optional extends keyof T> = Omit<T, Optional> &
  Partial<Pick<T, Optional>>;

/**
 * Empty-map helper.
 *
 * `Record<never, never>` resolves to `{}`, which has no index signature and so
 * fails postgrest-js's `Views: Record<string, GenericView>` constraint. When
 * that constraint fails the whole schema silently degrades to `never` and every
 * query loses its types. `{ [_ in never]: never }` is a mapped type, satisfies
 * the constraint, and is what `supabase gen types` emits for empty groups.
 */
type EmptyMap = { [_ in never]: never };

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      services: {
        Row: ServiceRow;
        Insert: Insertable<
          ServiceRow,
          | "id"
          | "created_at"
          | "summary_tr"
          | "summary_en"
          | "duration_min"
          | "buffer_min"
          | "active"
          | "sort"
        >;
        Update: Partial<ServiceRow>;
        Relationships: [];
      };
      availability_rules: {
        Row: AvailabilityRuleRow;
        Insert: Insertable<AvailabilityRuleRow, "id" | "created_at" | "active">;
        Update: Partial<AvailabilityRuleRow>;
        Relationships: [];
      };
      availability_exceptions: {
        Row: AvailabilityExceptionRow;
        Insert: Insertable<
          AvailabilityExceptionRow,
          "id" | "created_at" | "is_closed" | "start_time" | "end_time" | "note"
        >;
        Update: Partial<AvailabilityExceptionRow>;
        Relationships: [];
      };
      appointments: {
        Row: AppointmentRow;
        Insert: Insertable<
          AppointmentRow,
          | "id"
          | "created_at"
          | "status"
          | "patient_phone"
          | "notes"
          | "locale"
          | "confirmation_sent_at"
          | "cancel_token"
          | "cancelled_at"
        >;
        Update: Partial<AppointmentRow>;
        Relationships: [];
      };
      admin_settings: {
        Row: AdminSettingsRow;
        Insert: Partial<AdminSettingsRow>;
        Update: Partial<AdminSettingsRow>;
        Relationships: [];
      };
      admins: {
        Row: AdminRow;
        Insert: Insertable<AdminRow, "created_at" | "email">;
        Update: Partial<AdminRow>;
        Relationships: [];
      };
    };
    Views: EmptyMap;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      get_available_slots: {
        Args: {
          p_service_slug: string;
          p_date: string;
          p_exclude_appointment_id?: string | null;
        };
        Returns: AvailableSlot[];
      };
      create_booking: {
        Args: {
          p_service_slug: string;
          p_starts_at: string;
          p_patient_name: string;
          p_patient_email: string;
          p_patient_phone?: string | null;
          p_notes?: string | null;
          p_locale?: string;
        };
        Returns: CreateBookingResult[];
      };
      get_booking_by_token: {
        Args: { p_token: string };
        Returns: BookingByToken[];
      };
      cancel_booking_by_token: {
        Args: { p_token: string };
        Returns: { booking_reference: string; booking_starts_at: string }[];
      };
      reschedule_booking_by_token: {
        Args: { p_token: string; p_starts_at: string };
        Returns: {
          booking_reference: string;
          booking_starts_at: string;
          booking_ends_at: string;
        }[];
      };
    };
    Enums: {
      appointment_status: AppointmentStatus;
    };
    CompositeTypes: EmptyMap;
  };
};

