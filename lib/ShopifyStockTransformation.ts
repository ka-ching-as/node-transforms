// tslint:disable-next-line:no-import-side-effect
import "cross-fetch/polyfill"
import * as _ from "lodash"
import * as path from "path"
import ApolloClient, { gql } from "apollo-boost"
import { StockQueueEntry, StockTransformation } from "./StockTransformation"

interface InventoryLevelUpdate {
    available: number
    inventory_item_id: number
    location_id: number
    product_id: string
    variant_id?: string
}

export class ShopifyStockTransformation implements StockTransformation {
    async transformToStockImportData(input: any, configuration: any): Promise<StockQueueEntry | undefined> {
        console.info(`Transforming Shopify inventory level update: ${JSON.stringify(input)}`)

        if (!this.validateInput(input)) {
            console.error(`Shopify stock input not valid: ${JSON.stringify(input)}`)
            return undefined
        }

        const inventoryLevelUpdate = input as InventoryLevelUpdate

        const stockLocationId = configuration.stock_location_map[`${inventoryLevelUpdate.location_id}`]
        if (!stockLocationId) {
            console.error(`Unknown location id: ${inventoryLevelUpdate.location_id}`)
            return undefined
        }

        try {
            const queueElement = this.stockQueueElement(inventoryLevelUpdate, stockLocationId)
            console.info(`Resulting stock queue element: ${JSON.stringify(queueElement)}`)
            return queueElement
        } catch (error) {
            console.log(error)
            return undefined
        }
    }

    /* Example structure
    {
    "inventory_item_id": 17864432713779,
    "location_id": 15312158771,
    "available": 0,
    "updated_at": "2019-04-11T13:12:26-04:00",
    "admin_graphql_api_id": "gid://shopify/InventoryLevel/14943944755?inventory_item_id=17864432713779"
    } */
    validateInput(input: any): boolean {
        if (_.isNil(input) || !_.isObject(input)) {
            return false
        }
        const inventoryIdValid = (input as any).inventory_item_id && typeof ((input as any).inventory_item_id) === "number"
        const locationIdValid = (input as any).location_id && typeof ((input as any).location_id) === "number"
        const availableValid = (input as any).available !== undefined && typeof ((input as any).available) === "number"
        return inventoryIdValid && locationIdValid && availableValid
    }

    stockQueueElement(inventoryLevelUpdate: InventoryLevelUpdate, stockLocationId: string): StockQueueEntry {
        const result: StockQueueEntry = {} as StockQueueEntry
        result.count = inventoryLevelUpdate.available
        result.location_id = stockLocationId
        result.product_id = inventoryLevelUpdate.product_id
        if (inventoryLevelUpdate.variant_id !== undefined) {
            result.variant_id = inventoryLevelUpdate.variant_id
        }
        return result
    }
}