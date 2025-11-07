import { UrgencyLevelEnum } from "../shared/enums";

// Flattened Model for Display (used in component)
export interface IProductDetailModel {
    // Basic product info
    productId                          : string;
    productName                        : string;
    productImage                       : string;
    variantId                          : number;
    variantName                        : string;
    
    // Inventory management fields
    availableStock                     : number;
    totalInventory                     : number;
    incomingStock                      : number;
    
    // Sales data
    sevenDaysRangeSales                : number;
    fourteenDaysRangeSales             : number;
    thirtyDaysRangeSales               : number;

    perDaySoldSevenDaysRange           : number;
    perDaySoldFourteenDaysRange        : number;
    perDaySoldThirtyDaysRange          : number;

    recommendedAverageStock            : number;
    recommendedRestockSevenDaysRange   : number;
    recommendedRestockFourteenDaysRange: number;
    recommendedRestockThirtyDaysRange  : number;

    urgencyLevel                       : UrgencyLevelEnum;
    sku                                : string;
}

// API Response Model (from backend) - matches the actual restock prediction API
export interface IProductApiResponse {
    // Basic product info
    productId                          : string;
    productName                        : string;
    productImage                       : string;
    variantId                          : number;
    variantName                        : string;
    
    // Inventory management fields
    availableStock                     : number;
    totalInventory                     : number;
    incomingStock                      : number;
    
    // Sales data
    sevenDaysRangeSales                : number;
    fourteenDaysRangeSales             : number;
    thirtyDaysRangeSales               : number;

    perDaySoldSevenDaysRange           : number;
    perDaySoldFourteenDaysRange        : number;
    perDaySoldThirtyDaysRange          : number;
    perDaySoldLongRange                : number;
    
    // Reorder recommendations
    recommendedAverageStock            : number;
    recommendedRestockSevenDaysRange   : number;
    recommendedRestockFourteenDaysRange: number;
    recommendedRestockThirtyDaysRange  : number;

    urgencyLevel                       : UrgencyLevelEnum;
    sku                                : string;
}

export interface IShopDataModel {
    shopDomain: string;
}