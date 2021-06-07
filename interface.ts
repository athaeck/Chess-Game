namespace ChessGame {
    import f = FudgeCore;
    export interface Movement {
        _fieldsX: number;
        _fieldsZ: number;
        _scalable: boolean;
        // _movementBackwards: boolean;
        _initScale: boolean;
    }
    export interface Attack {
        _fieldsX: number;
        _fieldsZ: number;
        _scalable: boolean;
        // _movementBackwards: boolean;
    }
    export interface ChessPlayerSetting {
        _movement:  Movement[];
        _attack:  Attack[];
    }
    export interface ChessPlayerSettings {
        [key: string]: ChessPlayerSetting;
    }
    export type ChessPlayer = {
        [key in UserType]: f.Node;
    };
}