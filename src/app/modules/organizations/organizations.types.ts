export interface Organization {
    _id?: string;
    code?: string;
    name: string;
    description: string;
    is_deleted?: boolean;
    committee_codes?: string[];
}
  