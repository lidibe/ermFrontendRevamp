
export interface Threshold {
    id: string;
    kriId: string;
    bau: number;
    trigger: string;
    rLimit: number;
    triggerMinDir: string;
    triggerMaxDir: string;
    triggerMax: number;
    triggerMin: number;
    month: string;
    year: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

export interface ThresholdPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
