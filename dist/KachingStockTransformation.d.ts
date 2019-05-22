import { StockTransformation } from "./StockTransformation";
export declare class KachingStockTransformation implements StockTransformation {
    transformToStockImportData(input: any, configuration: any, callback: (stockQueueElement: any) => Promise<void>): Promise<void>;
}
