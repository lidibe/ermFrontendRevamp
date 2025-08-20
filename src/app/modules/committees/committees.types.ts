export interface Committee {
    _id?: string;
    code?: string;
    name: string;
    label: string;
    members?: Member[];
    description: string;
    full_description: string;
    is_deleted?: boolean;
    reason_for_deletion: string;
    organization_codes?: string[];
}

export interface BasicCommitteeDTO {
    code?: string;
    name: string;
}

export interface Member {
    code: string;
    role: string;
}
