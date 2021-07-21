namespace ChessGame {
    import f = FudgeCore;
    export interface Movement {
        _fieldsX: number;
        _fieldsZ: number;
        _scalable: boolean;
        _initScale: boolean;
    }
    export interface Attack {
        _fieldsX: number;
        _fieldsZ: number;
    }
    export interface ChessPlayerSetting {
        _movement: Movement[];
        _attack: Attack[];
    }
    export interface ChessPlayerSettings {
        [key: string]: ChessPlayerSetting;
    }
    export type ChessPlayers = {
        [key in UserType]: ChessPlayer;
    };
    export interface SoundData {
        name: string;
        volume: number;
        loop: boolean;
    }
    export type Sound = {
        [key in SoundType]: SoundData;
    };
    export type Setting = {
        [key in SettingType]: any
    };
    export interface SoundSetting {
        withSound: boolean;
    }
    export interface Input {
        mouseLock: boolean;
    }
    export type Duell = {
        [key in UserType]: ChessFigure;
    };
    export interface AvailableMovment {
        _movements: f.ComponentTransform[];
        _attacks: f.ComponentTransform[];
    }
}