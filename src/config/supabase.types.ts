/**
 * Supabase Database Types
 *
 * This file contains TypeScript type definitions for all database tables.
 * These types ensure type safety when querying the database.
 *
 * Note: These types can be auto-generated using Supabase CLI:
 * npx supabase gen types typescript --project-id nwxvzuhoelvtynccvxpy
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      facilities: {
        Row: {
          id: number
          name: string
          facility_type: 'Elementary' | 'Middle' | 'High School' | 'Specialty' | 'Administration' | 'District'
          address: string | null
          latitude: number | null
          longitude: number | null
          site_area: string | null
          year_built: number | null
          current_enrollment: number
          capacity: number
          grade_range: string | null
          principal: string | null
          phone: string | null
          status: 'Existing' | 'Under Construction' | 'Planned'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          facility_type: 'Elementary' | 'Middle' | 'High School' | 'Specialty' | 'Administration' | 'District'
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          site_area?: string | null
          year_built?: number | null
          current_enrollment?: number
          capacity?: number
          grade_range?: string | null
          principal?: string | null
          phone?: string | null
          status?: 'Existing' | 'Under Construction' | 'Planned'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          facility_type?: 'Elementary' | 'Middle' | 'High School' | 'Specialty' | 'Administration' | 'District'
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          site_area?: string | null
          year_built?: number | null
          current_enrollment?: number
          capacity?: number
          grade_range?: string | null
          principal?: string | null
          phone?: string | null
          status?: 'Existing' | 'Under Construction' | 'Planned'
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: number
          facility_id: number | null
          name: string
          school_name: string | null
          building_type: 'Elementary' | 'Middle' | 'High School' | 'Specialty' | 'Administration Building' | 'District'
          project_type: 'New Construction' | 'Renovations' | 'Additions' | 'Technology' | 'Site Improvements'
          cost_estimate: number
          last_modified: string | null
          status: 'Draft' | 'In Progress' | 'Complete' | 'On Hold' | 'Cancelled'
          square_footage: number
          address: string | null
          site_area: string | null
          capacity: number
          duration: string | null
          start_date: string | null
          completion_date: string | null
          base_cost: number
          site_costs: number
          design_costs: number
          contingency: number
          latitude: number | null
          longitude: number | null
          construction_type: 'Concrete' | 'Steel' | 'Mass Timber' | 'Wood Frame' | null
          number_of_stories: number | null
          procurement_method: 'Hard Bid' | 'CMAR' | 'Design Build' | 'Competitive Sealed Proposal' | null
          leed_certification: 'None' | 'Certified' | 'Silver' | 'Gold' | 'Platinum' | null
          leed_cost: number
          chips_certification: boolean
          chips_cost: number
          land_acquisition_cost: number
          transportation_infrastructure_cost: number
          environmental_studies_cost: number
          asbestos_abatement_cost: number
          site_preparation_cost: number
          inflation_rate: number
          total_cost_with_inflation: number
          inflation_amount: number
          space_costs: number
          number_of_pods: number
          procurement_phase_duration: number | null
          procurement_phase_cost: number
          design_phase_duration: number | null
          design_phase_cost: number
          construction_phase_duration: number | null
          construction_phase_cost: number
          project_pauses: string | null
          current_enrollment: number
          created_at: string
          updated_at: string
          created_by: number | null
        }
        Insert: {
          id?: number
          facility_id?: number | null
          name: string
          school_name?: string | null
          building_type: 'Elementary' | 'Middle' | 'High School' | 'Specialty' | 'Administration Building' | 'District'
          project_type: 'New Construction' | 'Renovations' | 'Additions' | 'Technology' | 'Site Improvements'
          cost_estimate: number
          last_modified?: string | null
          status?: 'Draft' | 'In Progress' | 'Complete' | 'On Hold' | 'Cancelled'
          square_footage?: number
          address?: string | null
          site_area?: string | null
          capacity?: number
          duration?: string | null
          start_date?: string | null
          completion_date?: string | null
          base_cost?: number
          site_costs?: number
          design_costs?: number
          contingency?: number
          latitude?: number | null
          longitude?: number | null
          construction_type?: 'Concrete' | 'Steel' | 'Mass Timber' | 'Wood Frame' | null
          number_of_stories?: number | null
          procurement_method?: 'Hard Bid' | 'CMAR' | 'Design Build' | 'Competitive Sealed Proposal' | null
          leed_certification?: 'None' | 'Certified' | 'Silver' | 'Gold' | 'Platinum' | null
          leed_cost?: number
          chips_certification?: boolean
          chips_cost?: number
          land_acquisition_cost?: number
          transportation_infrastructure_cost?: number
          environmental_studies_cost?: number
          asbestos_abatement_cost?: number
          site_preparation_cost?: number
          inflation_rate?: number
          total_cost_with_inflation?: number
          inflation_amount?: number
          space_costs?: number
          number_of_pods?: number
          procurement_phase_duration?: number | null
          procurement_phase_cost?: number
          design_phase_duration?: number | null
          design_phase_cost?: number
          construction_phase_duration?: number | null
          construction_phase_cost?: number
          project_pauses?: string | null
          current_enrollment?: number
          created_at?: string
          updated_at?: string
          created_by?: number | null
        }
        Update: {
          id?: number
          facility_id?: number | null
          name?: string
          school_name?: string | null
          building_type?: 'Elementary' | 'Middle' | 'High School' | 'Specialty' | 'Administration Building' | 'District'
          project_type?: 'New Construction' | 'Renovations' | 'Additions' | 'Technology' | 'Site Improvements'
          cost_estimate?: number
          last_modified?: string | null
          status?: 'Draft' | 'In Progress' | 'Complete' | 'On Hold' | 'Cancelled'
          square_footage?: number
          address?: string | null
          site_area?: string | null
          capacity?: number
          duration?: string | null
          start_date?: string | null
          completion_date?: string | null
          base_cost?: number
          site_costs?: number
          design_costs?: number
          contingency?: number
          latitude?: number | null
          longitude?: number | null
          construction_type?: 'Concrete' | 'Steel' | 'Mass Timber' | 'Wood Frame' | null
          number_of_stories?: number | null
          procurement_method?: 'Hard Bid' | 'CMAR' | 'Design Build' | 'Competitive Sealed Proposal' | null
          leed_certification?: 'None' | 'Certified' | 'Silver' | 'Gold' | 'Platinum' | null
          leed_cost?: number
          chips_certification?: boolean
          chips_cost?: number
          land_acquisition_cost?: number
          transportation_infrastructure_cost?: number
          environmental_studies_cost?: number
          asbestos_abatement_cost?: number
          site_preparation_cost?: number
          inflation_rate?: number
          total_cost_with_inflation?: number
          inflation_amount?: number
          space_costs?: number
          number_of_pods?: number
          procurement_phase_duration?: number | null
          procurement_phase_cost?: number
          design_phase_duration?: number | null
          design_phase_cost?: number
          construction_phase_duration?: number | null
          construction_phase_cost?: number
          project_pauses?: string | null
          current_enrollment?: number
          created_at?: string
          updated_at?: string
          created_by?: number | null
        }
      }
      bonds: {
        Row: {
          id: number
          name: string
          total_value: number
          total_budget: number
          project_count: number
          status: 'Active' | 'Planning' | 'Completed' | 'Cancelled'
          approval_date: string | null
          start_year: number | null
          end_year: number | null
          created_at: string
          updated_at: string
          created_by: number | null
        }
        Insert: {
          id?: number
          name: string
          total_value: number
          total_budget: number
          project_count?: number
          status?: 'Active' | 'Planning' | 'Completed' | 'Cancelled'
          approval_date?: string | null
          start_year?: number | null
          end_year?: number | null
          created_at?: string
          updated_at?: string
          created_by?: number | null
        }
        Update: {
          id?: number
          name?: string
          total_value?: number
          total_budget?: number
          project_count?: number
          status?: 'Active' | 'Planning' | 'Completed' | 'Cancelled'
          approval_date?: string | null
          start_year?: number | null
          end_year?: number | null
          created_at?: string
          updated_at?: string
          created_by?: number | null
        }
      }
      bond_projects: {
        Row: {
          id: number
          bond_id: number
          project_id: number
          order_number: number
          created_at: string
        }
        Insert: {
          id?: number
          bond_id: number
          project_id: number
          order_number?: number
          created_at?: string
        }
        Update: {
          id?: number
          bond_id?: number
          project_id?: number
          order_number?: number
          created_at?: string
        }
      }
      project_elemental_costs: {
        Row: {
          id: number
          project_id: number
          elemental_code: string
          cost_per_sf: number
          total_cost: number
          created_at: string
        }
        Insert: {
          id?: number
          project_id: number
          elemental_code: string
          cost_per_sf: number
          total_cost: number
          created_at?: string
        }
        Update: {
          id?: number
          project_id?: number
          elemental_code?: string
          cost_per_sf?: number
          total_cost?: number
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string // UUID from auth.users
          email: string
          first_name: string | null
          last_name: string | null
          role: string
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
