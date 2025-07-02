export interface Card {
    id: string;
    symbol: string;
    suit: string;
    color: string;
    type?: string; // for extensibility
    [key: string]: any;
}
