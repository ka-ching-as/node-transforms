export interface StockQueueEntry {
    product_id: string;
    variant_id: string | null;
    location_id: string;
    count: number;
}
export interface StockTransformation {
    transformToStockImportData(input: any, configuration: any, callback: (stockQueueElement: any) => Promise<void>): Promise<void>;
}
