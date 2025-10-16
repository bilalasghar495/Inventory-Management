export interface IProductDetailModel {
    id        : number;
    title     : string;
    status    : string;
    image     : IProductImageModel;
    created_at: string;
    variants  : IProductVariantModel[];
}

export interface IProductImageModel {
    src       : string;
    alt       : string | null;
    created_at: string;
}

export interface IProductVariantModel {
    inventory_quantity    : number;
    old_inventory_quantity: number;
    price                 : string;
    sku                   : string | null;
}

