declare namespace ChessGame {
    import f = FudgeCore;
    class CameraController extends f.ComponentScript {
        private _transformComponent;
        private _user;
        constructor(userType: UserType);
        get TransformComponent(): f.ComponentTransform;
        UpdatePosition(currentChessFigure: f.ComponentTransform): void;
        Translate(amount: number): void;
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
        private _timerOn;
        private _life;
        constructor(name: string, mass: number, pysicsType: f.PHYSICS_TYPE, colliderType: f.COLLIDER_TYPE, group: f.PHYSICS_GROUP, place: f.Node, user: ChessPlayer);
        SetPlace(place: f.Node): void;
        GetPlace(): f.Node;
        MoveFigure(movementController: MovementController): void;
        DeleteMovementController(): void;
        GetChessFigureMovement(): ChessPlayerSetting;
        UpdateInitScale(): void;
        GetUser(): ChessPlayer;
        SetDeathTimer(): void;
        private HandleMoveData;
    }
}
declare namespace ChessGame {
    import f = FudgeCore;
    class ChessPlayer {
        private _chessFigures;
        private _type;
        private _timeController;
        private _graveYard;
        private _name;
        constructor(chessFigures: f.Node, type: UserType, timeController: TimeController, name: string);
        get name(): string;
        GetFigures(): ChessFigure[];
        GetTimeController(): TimeController;
        GetPlayerType(): UserType;
        RemoveFigure(figure: f.Node): void;
        AddFigure(figure: ChessFigure): void;
    }
}
declare namespace ChessGame {
    import f = FudgeCore;
    class CollisionController extends f.ComponentScript {
        private _hit;
        constructor();
        Remove(): void;
        private Created;
        private HandleCollision;
    }
}
declare namespace ChessGame {
    class DataController {
        private static _instance;
        private _chessFigureSetting;
        private _chessFigures;
        private _gameSetting;
        private constructor();
        static get Instance(): DataController;
        GetMovementData(name: string): Promise<ChessPlayerSetting>;
        GetSound(type: SoundType): Promise<SoundData>;
        GetGameSetting(): Promise<Setting>;
    }
}
declare namespace ChessGame {
    import f = FudgeCore;
    class DuellController {
        private _cameraController;
        private _duell;
        private _originPosition;
        private _battleGround;
        private _endStatus;
        constructor(cameraController: CameraController, duell: Duell);
        get BattleGround(): f.Node;
        get End(): boolean;
        HandleInput(): void;
    }
}
declare namespace ChessGame {
    enum UserType {
        PLAYER = "player",
        ENEMY = "enemy"
    }
    enum SoundType {
        SELECT_FIGURE = "SELECT_FIGURE",
        SELECT_FIELD = "SELECT_FIELD",
        HIT = "HIT",
        ATMO = "ATMO",
        TIME = "TIME",
        MOVE = "MOVE"
    }
    enum SettingType {
        Sound = "Sound",
        Time = "Time",
        SoundSetting = "SoundSetting",
        Input = "Input"
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
    interface GameEnd {
        _winner: string;
    }
    class GameController {
        private _inputController;
        private _currentUser;
        private _chessPlayer;
        private _playerTimeController;
        private _root;
        private _soundController;
        private _duellMode;
        private _duellController;
        private _cameraController;
        private _checkmate;
        private _finished;
        private _winner;
        constructor(chessPlayer: ChessPlayers, places: f.Node[], cameraController: CameraController, selctionController: SelectionControl, root: f.Graph);
        get finished(): boolean;
        get winner(): GameEnd;
        HandleGame(): void;
        HandleFinishMove(): void;
        WatchEndGame(): void;
        WatchCheckmate(): void;
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
        private _attackIndex;
        private _selection;
        private _isMovement;
        private _isCheckmate;
        private _gameController;
        constructor(places: f.Node[], player: ChessPlayers, cameraController: CameraController, selectionControl: SelectionControl, user: UserType, gameController: GameController);
        set Checkmate(value: boolean);
        get Checkmate(): boolean;
        UpdateCurrentUser(user: UserType): void;
        GetCurrentUser(): UserType;
        HandleInput(): void;
        GetChessFigureMovements(currentPlayer: UserType, chessFigureIndex: number, isMovement?: boolean): AvailableMovment;
        private Move;
        private HandleSoundController;
        private HandleSelectionControl;
        private CheckIfValidIndex;
        private HandleCameraPosition;
        private ShowSelection;
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
        private _enemyOnTheWay;
        private _collidingEnemy;
        constructor();
        get EnemyOnTheWay(): boolean;
        get CollidingEnemy(): ChessFigure;
        Init(target: f.ComponentTransform, places: f.Node[], name: string): void;
        EndMovement(): void;
        private Start;
        private HandleMove;
        private CheckIfEnemyOccupyWay;
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
    import f = FudgeCore;
    class Projectile extends GameObject {
        private _target;
        private _speed;
        constructor(target: f.Vector3);
        Move(): void;
        private HandleCollision;
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
        private _type;
        private _setting;
        private _soundSettings;
        private _soundComponent;
        constructor(type: SoundType);
        Delete(): void;
        private FetchData;
        private Created;
    }
}
declare namespace ChessGame {
    class State {
        private static _instance;
        private activeUser;
        private constructor();
        static get Instance(): State;
        set SetUser(user: UserType);
        get User(): UserType;
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
        checkmate: string;
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
    import f = FudgeCore;
    interface Movement {
        _fieldsX: number;
        _fieldsZ: number;
        _scalable: boolean;
        _initScale: boolean;
    }
    interface Attack {
        _fieldsX: number;
        _fieldsZ: number;
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
    interface SoundData {
        name: string;
        volume: number;
        loop: boolean;
    }
    type Sound = {
        [key in SoundType]: SoundData;
    };
    type Setting = {
        [key in SettingType]: any;
    };
    interface SoundSetting {
        withSound: boolean;
    }
    interface Input {
        mouseLock: boolean;
    }
    type Duell = {
        [key in UserType]: ChessFigure;
    };
    interface AvailableMovment {
        _movements: f.ComponentTransform[];
        _attacks: f.ComponentTransform[];
    }
}
