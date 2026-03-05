export interface CellItem {
    productId: string;
    quantity: number;
}

export interface Cell {
    row: number;
    column: number;
    level: number;
    items: CellItem[];
}

export interface Warehouse {
    id: string;
    cells: Cell[];
}