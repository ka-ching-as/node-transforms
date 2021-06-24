import "cross-fetch/polyfill";
import { StockQueueEntry, StockTransformation } from "./StockTransformation";
interface InventoryLevelUpdate {
    available: number;
    inventory_item_id: number;
    location_id: number;
    product_id: string;
    variant_id?: string;
}
export declare class ShopifyStockTransformation implements StockTransformation {
    transformToStockImportData(input: any, configuration: any): Promise<StockQueueEntry | undefined>;
    validateInput(input: any): boolean;
    stockQueueElement(inventoryLevelUpdate: InventoryLevelUpdate, stockLocationId: string): StockQueueEntry;
}
export {};
