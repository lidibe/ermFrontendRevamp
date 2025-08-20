export interface SummaryData
{
    id: string;
    riskAreaId: string;
    riskAreaName: string;
    month: string;
    year: string;
    comments: string | null;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

export interface RiskArea
{

    id: string;
    code: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    status: string;
}
