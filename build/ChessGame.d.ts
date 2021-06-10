declare namespace ChessGame {
    import f = FudgeCore;
    class CameraController extends f.ComponentScript {
        private _transformComponent;
        private x;
        private _user;
        constructor(userType: UserType);
        UpdatePosition(currentChessFigure: f.ComponentTransform): void;
        UpdatePlayer(currentPlayer: UserType): void;
        private Created;
    }
}
declare namespace ChessGame {
    import f = FudgeCore;
    class GameObject extends f.Node {
        constructor(name: string, mass: number, type: f.PHYSICS_TYPE, collider: f.COLLIDER_TYPE, groupe: f.PHYSICS_GROUP, mesh: f.Mesh);
    }
}
declare namespace ChessGame {
    import f = FudgeCore;
    class ChessFigure extends GameObject {
        private _place;
        private _user;
        private _move;
        constructor(name: string, mass: number, pysicsType: f.PHYSICS_TYPE, colliderType: f.COLLIDER_TYPE, group: f.PHYSICS_GROUP, place: f.Node, user: ChessPlayer);
        SetPlace(place: f.Node): void;
        GetPlace(): f.Node;
        MoveFigure(movementController: MovementController): void;
        DeleteMovementController(): void;
        GetChessFigureMovement(): ChessPlayerSetting;
        UpdateInitScale(): void;
        GetUser(): ChessPlayer;
        private HandleMoveData;
    }
}
declare namespace ChessGame {
    import f = FudgeCore;
    class ChessPlayer {
        private _chessFigures;
        private _type;
        private _timeController;
        constructor(chessFigures: f.Node, type: UserType, timeController: TimeController);
        GetFigures(): ChessFigure[];
        GetTimeController(): TimeController;
        GetPlayerType(): UserType;
        RemoveFigure(figure: f.Node): void;
        AddFigure(figure: ChessFigure): void;
    }
}
declare namespace ChessGame {
    class DataController {
        private static _instance;
        private _chessFigureSetting;
        private constructor();
        static get Instance(): DataController;
        GetMovementData(name: string): Promise<ChessPlayerSetting>;
    }
}
declare namespace ChessGame {
    enum UserType {
        PLAYER = "player",
        ENEMY = "enemy"
    }
    enum SoundType {
        SELECT_CHESSFIGURE = "select-chessfigure",
        SELECT_FIELD = "select-field",
        COLLISION = "collision"
    }
}
declare namespace ChessGame {
    import f = FudgeCore;
    interface Player {
        _rigidbody: f.ComponentRigidbody;
        _avatar: f.Node;
    }
    interface Camera {
        _node: f.Node;
        _componentCamera: f.ComponentCamera;
    }
    class GameController {
        private _inputController;
        private _currentUser;
        private _chessPlayer;
        private _playerTimeController;
        constructor(chessPlayer: ChessPlayers, places: f.Node[], cameraController: CameraController, selctionController: SelectionControl);
        HandleGame(): void;
        private HandleFinishMove;
    }
}
declare namespace ChessGame {
    import f = FudgeCore;
    class InputController {
        private _places;
        private _player;
        private _cameraController;
        private _currentPlayer;
        private _currentChessFigureIndex;
        private _clickable;
        private _selectionControl;
        private _movementIndex;
        private _movements;
        private _attacks;
        private _isMovement;
        private x;
        private _selectionFinished;
        constructor(places: f.Node[], player: ChessPlayers, cameraController: CameraController, selectionControl: SelectionControl, user: UserType);
        UpdateCurrentUser(user: UserType): void;
        GetCurrentUser(): UserType;
        GetSelectionState(): boolean;
        HandleInput(): void;
        private Move;
        private HandleSoundController;
        private HandleSelectionControl;
        private CheckIfValidIndex;
        private HandleCameraPosition;
        private ShowSelection;
        private GetChessFigureMovements;
        private PressTimerReset;
        private SelectTimerReset;
    }
}
declare namespace ChessGame {
    import f = FudgeCore;
    class MovementController extends f.ComponentScript {
        private _start;
        private _target;
        private _places;
        private _name;
        private _body;
        private _parent;
        constructor(target: f.ComponentTransform, places: f.Node[], name: string);
        private Start;
        private Move;
    }
}
declare namespace ChessGame {
    class MovementSelection extends GameObject {
        constructor();
        private HandleRemove;
    }
}
declare namespace ChessGame {
    import f = FudgeCore;
    class PlaceController extends f.ComponentScript {
        private _chessFigure;
        constructor(chessFigure?: ChessFigure);
        GetChessFigure(): ChessFigure;
        SetChessFigure(chessFigure?: ChessFigure): void;
        IsChessFigureNull(): boolean;
        RemoveChessFigure(): void;
    }
}
declare namespace ChessGame {
    class SelectionControl extends GameObject {
        constructor();
    }
}
declare namespace ChessGame {
    import f = FudgeCore;
    class SoundController extends f.ComponentScript {
        private _volume;
        private _soundFileName;
        constructor(soundName: string);
        private Created;
    }
}
declare namespace ChessGame {
    class TimeController {
        private _currentUseTime;
        private _remainTime;
        private _count;
        constructor();
        StartTimer(): void;
        StoppTimer(): void;
        Count(): void;
        IsEnoughRemianTime(): boolean;
    }
}
declare namespace ChessGame {
    import f = FudgeCore;
    class GameState extends f.Mutable {
        time: number;
        player: string;
        currentTime: number;
        protected reduceMutator(_mutator: f.Mutator): void;
    }
    export let gameState: GameState;
    export class Hud {
        private static controller;
        static start(): void;
    }
    export {};
}
declare namespace ChessGame {
    function Round(number: number, place: number): number;
}
declare namespace ChessGame {
    interface Movement {
        _fieldsX: number;
        _fieldsZ: number;
        _scalable: boolean;
        _initScale: boolean;
    }
    interface Attack {
        _fieldsX: number;
        _fieldsZ: number;
        _scalable: boolean;
    }
    interface ChessPlayerSetting {
        _movement: Movement[];
        _attack: Attack[];
    }
    interface ChessPlayerSettings {
        [key: string]: ChessPlayerSetting;
    }
    type ChessPlayers = {
        [key in UserType]: ChessPlayer;
    };
}
