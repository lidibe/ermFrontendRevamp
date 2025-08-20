export interface Kri
{
    id: string;
    riskAreaId: string;
    key: string;
    name: string;
    description: string | null;
    nature: string;
    frequency: string;
    tl: string;
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
