export interface HttpHeaders {
    [header: string]: string | string[];
}
export interface ProductTransformation {
    isDeletionRequest(headers: HttpHeaders, body: any): boolean;
    productIdForDeletion(input: any): string;
    transformProduct(input: any): any;
    transformRepoProduct(input: any, channels: string[], markets: string[]): any;
}
