import "cross-fetch/polyfill";
import { StockQueueEntry, StockTransformation } from "./StockTransformation";
interface InventoryLevelUpdate {
    available: number;
    inventory_item_id: number;
    location_id: number;
}
export declare class ShopifyStockTransformation implements StockTransformation {
    transformToStockImportData(input: any, configuration: any, callback: (stockQueueElement?: StockQueueEntry) => Promise<void>): Promise<void>;
    validateInput(input: any): boolean;
    validateQueryResultData(data: any): boolean;
    stockQueueElement(inventoryLevelUpdate: InventoryLevelUpdate, resultData: any, stockLocationId: string): StockQueueEntry;
}
export {};
