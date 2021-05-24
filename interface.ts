namespace ChessGame {
    export interface Movement {
        _fieldsX: number;
        _fieldsZ: number;
        _scaling: number;
        _movementBackwards: boolean;
        _movementSidewards: boolean;
    }
    export interface Movements {
        [key: string]: Movement;
    }
    export interface Attack{

    }
    export interface ChessPlayerSetting{
        _movement: Movement,
    }
}