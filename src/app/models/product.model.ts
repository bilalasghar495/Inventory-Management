// Flattened Model for Display (used in component)
export interface IProductDetailModel {
    id               : number;
    title            : string;
    productType      : string;
    status           : string;
    image            : string;
    variantTitle     : string;
    price            : string;
    sku              : string | null;
    inventoryQuantity: number;
    oldInventoryQuantity: number;
}

// API Response Model (from backend)
export interface IProductApiResponse {
    id         : number;
    title      : string;
    productType: string;
    status     : string;
    imageUrl   : string;
    variants   : IProductVariantModel[];
    options    : IProductOptionModel[];
}

export interface IProductVariantModel {
    id                   : number;
    productId            : number;
    imageSrc?            : string;
    title                : string;
    price                : string;
    sku                  : string | null;
    inventoryQuantity    : number;
    oldInventoryQuantity : number;
}

export interface IProductOptionModel {
    id        : number;
    productId : number;
    name      : string;
    values    : string[];
}

