import "cross-fetch/polyfill";
import { StockTransformation } from "./StockTransformation";
interface StockQueueEntry {
    product_id: string;
    variant_id: string | null;
    location_id: string;
    count: number;
}
interface InventoryLevelUpdate {
    available: number;
    inventory_item_id: number;
    location_id: number;
}
export declare class ShopifyStockTransformation implements StockTransformation {
    transformToStockImportData(input: any, configuration: any, callback: (stockData: any) => Promise<void>): Promise<void>;
    validateInput(input: any): boolean;
    validateQueryResultData(data: any): boolean;
    stockQueueElement(inventoryLevelUpdate: InventoryLevelUpdate, resultData: any, stockLocationId: string): StockQueueEntry;
}
export {};
