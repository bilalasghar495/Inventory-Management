// Flattened Model for Display (used in component)
export interface IProductDetailModel {
    // Basic product info
    productId        : string;
    productName      : string;
    productImage     : string;
    variantId        : number;
    variantName      : string;
    
    // Inventory management fields
    availableStock   : number;
    totalInventory   : number;
    incomingStock    : number;
    
    // Sales data
    shortRangeSales  : number;
    longRangeSales   : number;
    perDaySoldShortRange: number;
    perDaySoldLongRange : number;
    
    // Reorder recommendations
    recommendedAverageStock     : number;
    recommendedRestockShortRange: number;
    recommendedRestockLongRange : number;
}

// API Response Model (from backend) - matches the actual restock prediction API
export interface IProductApiResponse {
    // Basic product info
    productId        : string;
    productName      : string;
    productImage     : string;
    variantId        : number;
    variantName      : string;
    
    // Inventory management fields
    availableStock   : number;
    totalInventory   : number;
    incomingStock    : number;
    
    // Sales data
    shortRangeSales  : number;
    longRangeSales   : number;
    perDaySoldShortRange: number;
    perDaySoldLongRange : number;
    
    // Reorder recommendations
    recommendedAverageStock     : number;
    recommendedRestockShortRange: number;
    recommendedRestockLongRange : number;
}