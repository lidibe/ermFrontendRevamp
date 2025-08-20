
export interface RiskArea {
    id: string;
    code: string;
    name: string;
    description: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

export interface RiskAreaPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
