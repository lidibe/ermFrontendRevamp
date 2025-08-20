
export interface RiskAreaData {
    id: string;
    riskAreaId: string;
    riskAreaName: string;
    month: string;
    year: string;
    weight: number;
    quantitativeScore: number;
    qualitativeScore: number;
    quantitativeWeight: number;
    qualitativeWeight: number;
    description: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    data: any;
}

export interface RiskAreaDataPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
