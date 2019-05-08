export interface StockTransformation {
    transformToStockImportData(input: any, configuration: any, callback: (stockData: any) => Promise<void>): Promise<void> 
}

export class IdentityStockTransformation implements StockTransformation {
    async transformToStockImportData(input: any, configuration: any, callback: (stockData: any) => Promise<void>): Promise<void> {
        await callback(input)
    }
}