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
      atoms: {
        Row: {
          id: number
          title: string
          description: string | null
          content_type: string
          link: string | null
          media_source_link: string | null
          store_in_database: boolean | null
          creator_name: string | null
          tags: string[] | null
          created_at: string | null
          updated_at: string | null
          metadata: Json | null
          image_path: string | null
          thumbnail_path: string | null
          is_external: boolean | null
          location_latitude: number | null
          location_longitude: number | null
          location_address: string | null
          flag_for_deletion: boolean | null
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          content_type: string
          link?: string | null
          media_source_link?: string | null
          store_in_database?: boolean | null
          creator_name?: string | null
          tags?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
          image_path?: string | null
          thumbnail_path?: string | null
          is_external?: boolean | null
          location_latitude?: number | null
          location_longitude?: number | null
          location_address?: string | null
          flag_for_deletion?: boolean | null
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          content_type?: string
          link?: string | null
          media_source_link?: string | null
          store_in_database?: boolean | null
          creator_name?: string | null
          tags?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
          image_path?: string | null
          thumbnail_path?: string | null
          is_external?: boolean | null
          location_latitude?: number | null
          location_longitude?: number | null
          location_address?: string | null
          flag_for_deletion?: boolean | null
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string | null
          is_private: boolean | null
          private_password: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string | null
          is_private?: boolean | null
          private_password?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_at?: string | null
          is_private?: boolean | null
          private_password?: string | null
        }
      }
      creators: {
        Row: {
          id: number
          name: string
          count: number | null
          created_at: string | null
          link_1: string | null
          link_2: string | null
          link_3: string | null
        }
        Insert: {
          id?: number
          name: string
          count?: number | null
          created_at?: string | null
          link_1?: string | null
          link_2?: string | null
          link_3?: string | null
        }
        Update: {
          id?: number
          name?: string
          count?: number | null
          created_at?: string | null
          link_1?: string | null
          link_2?: string | null
          link_3?: string | null
        }
      }
      creator_tags: {
        Row: {
          id: number
          creator_id: number
          tag_id: number
          created_at: string | null
        }
        Insert: {
          id?: number
          creator_id: number
          tag_id: number
          created_at?: string | null
        }
        Update: {
          id?: number
          creator_id?: number
          tag_id?: number
          created_at?: string | null
        }
      }
      tags: {
        Row: {
          id: number
          name: string
          count: number | null
          created_at: string | null
          category_id: number | null
          is_private: boolean | null
          private_password: string | null
        }
        Insert: {
          id?: number
          name: string
          count?: number | null
          created_at?: string | null
          category_id?: number | null
          is_private?: boolean | null
          private_password?: string | null
        }
        Update: {
          id?: number
          name?: string
          count?: number | null
          created_at?: string | null
          category_id?: number | null
          is_private?: boolean | null
          private_password?: string | null
        }
      }
      category_tags: {
        Row: {
          id: number
          category_id: number
          tag_id: number
          created_at: string | null
        }
        Insert: {
          id?: number
          category_id: number
          tag_id: number
          created_at?: string | null
        }
        Update: {
          id?: number
          category_id?: number
          tag_id?: number
          created_at?: string | null
        }
      }
      category_creators: {
        Row: {
          id: number
          category_id: number
          creator_id: number
          created_at: string | null
        }
        Insert: {
          id?: number
          category_id: number
          creator_id: number
          created_at?: string | null
        }
        Update: {
          id?: number
          category_id?: number
          creator_id?: number
          created_at?: string | null
        }
      }
    }
  }
}