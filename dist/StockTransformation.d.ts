export interface StockTransformation {
    transformToStockImportData(input: any, configuration: any, callback: (stockData: any) => Promise<void>): Promise<void>;
}
export declare class IdentityStockTransformation implements StockTransformation {
    transformToStockImportData(input: any, configuration: any, callback: (stockData: any) => Promise<void>): Promise<void>;
}
