import { ProductStatusEnum, UrgencyLevelEnum } from "../shared/enums";

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

    // Date range specific fields
    totalSales                         : number;
    soldPerDay                         : number;
    recommendedRestock                 : number;

    urgencyLevel                       : UrgencyLevelEnum;
    status                             : ProductStatusEnum;
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

    // Date range specific fields
    totalSales                         : number;
    soldPerDay                         : number;
    recommendedRestock                 : number;

    urgencyLevel                       : UrgencyLevelEnum;
    status                             : ProductStatusEnum;
    sku                                : string;
}

export interface IShopDataModel {
    shopDomain: string;
}

// Export payload interface for CSV export
export interface IExportProductData {
    productImage                       : string;
    productId                          : string | number;
    productName                        : string;
    variantId                          : number;
    variantName                        : string;
    sku                                : string | null;
    status                             : string;
    sevenDaysRangeSales                : number;
    fourteenDaysRangeSales             : number;
    thirtyDaysRangeSales               : number;
    perDaySoldSevenDaysRange           : number;
    perDaySoldFourteenDaysRange        : number;
    perDaySoldThirtyDaysRange          : number;
    availableStock                     : number;
    incomingStock                      : number;
    totalInventory                     : number;
    recommendedRestockSevenDaysRange   : number;
    recommendedRestockFourteenDaysRange: number;
    recommendedRestockThirtyDaysRange  : number;
    recommendedAverageStock            : number;
    urgencyLevel                       : string;
}
