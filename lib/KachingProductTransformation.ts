import { HttpHeaders, ProductTransformation } from "./ProductTransformation"

export class KachingProductTransformation implements ProductTransformation {
    isDeletionRequest(headers: HttpHeaders, body: any): boolean {
        return false
    }
    
    /**
     * @Method: Outputs and returns 'Hello, World!'.
     * @Param {}
     * @Return {string}
     */
    transformProduct(input: any): any {
        return {}
    }

    transformRepoProduct(input: any, channels: string[], markets: string[]): any {
        return {}
    }

    productIdForDeletion(input: any): string {
        const requiredFields = ["id"]

        for (const field of requiredFields) {
            if (!input[field]) {
                throw new Error(`Missing field '${field}'`)
            }
        }
        return input.id
    }
}
