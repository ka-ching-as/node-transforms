export interface StockQueueEntry {
    product_id: string;
    variant_id?: string;
    location_id: string;
    count: number;
}
export interface StockTransformation {
    transformToStockImportData(input: any, configuration: any): Promise<StockQueueEntry | undefined>;
}
