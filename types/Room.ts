import { Player } from "./Player";

export interface Room {
    code: string;
    players: Player[];
    gameState: any;
}
