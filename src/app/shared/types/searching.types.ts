export interface SearchOptions {
  search: string;
  status?: string;
  director_type?: string;
  is_deleted?: boolean;
  meeting_type?: string
  start_date?: string;
  end_date?: string;
  committee_code? : string;
  shareholding_class?: string;
}
