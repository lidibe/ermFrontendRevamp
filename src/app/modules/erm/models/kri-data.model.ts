
export interface KriData {
    id: string;
    kriNum: string;
    kriName: string;
    thresholdId: string;
    nature: string;
    frequency: string;
    bau: number;
    trigger: string;
    rLimit: number;
    triggerMinDir: string;
    triggerMaxDir: string;
    triggerMin: number;
    triggerMax: number;
    month: string;
    year: string;
    value: number;
    comments: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}


export interface KriDataPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
