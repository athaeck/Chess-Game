import ƒ = FudgeCore;
import ƒAid = FudgeAid;
declare namespace FudgeAid {
}
declare namespace FudgeAid {
    /**
     * Abstract class supporting versious arithmetical helper functions
     */
    abstract class Arith {
        /**
         * Returns one of the values passed in, either _value if within _min and _max or the boundary being exceeded by _value
         */
        static clamp<T>(_value: T, _min: T, _max: T, _isSmaller?: (_value1: T, _value2: T) => boolean): T;
    }
}
declare namespace FudgeAid {
    /**
     * Within a given precision, an object of this class finds the parameter value at which a given function
     * switches its boolean return value using interval splitting (bisection).
     * Pass the type of the parameter and the type the precision is measured in.
     */
    class ArithBisection<Parameter, Epsilon> {
        /** The left border of the interval found */
        left: Parameter;
        /** The right border of the interval found */
        right: Parameter;
        /** The function value at the left border of the interval found */
        leftValue: boolean;
        /** The function value at the right border of the interval found */
        rightValue: boolean;
        private function;
        private divide;
        private isSmaller;
        /**
         * Creates a new Solver
         * @param _function A function that takes an argument of the generic type <Parameter> and returns a boolean value.
         * @param _divide A function splitting the interval to find a parameter for the next iteration, may simply be the arithmetic mean
         * @param _isSmaller A function that determines a difference between the borders of the current interval and compares this to the given precision
         */
        constructor(_function: (_t: Parameter) => boolean, _divide: (_left: Parameter, _right: Parameter) => Parameter, _isSmaller: (_left: Parameter, _right: Parameter, _epsilon: Epsilon) => boolean);
        /**
         * Finds a solution with the given precision in the given interval using the functions this Solver was constructed with.
         * After the method returns, find the data in this objects properties.
         * @param _left The parameter on one side of the interval.
         * @param _right The parameter on the other side, may be "smaller" than [[_left]].
         * @param _epsilon The desired precision of the solution.
         * @param _leftValue The value on the left side of the interval, omit if yet unknown or pass in if known for better performance.
         * @param _rightValue The value on the right side of the interval, omit if yet unknown or pass in if known for better performance.
         * @throws Error if both sides of the interval return the same value.
         */
        solve(_left: Parameter, _right: Parameter, _epsilon: Epsilon, _leftValue?: boolean, _rightValue?: boolean): void;
        toString(): string;
    }
}
declare namespace FudgeAid {
    import ƒ = FudgeCore;
    class CameraOrbit extends ƒ.Node {
        readonly axisRotateX: ƒ.Axis;
        readonly axisRotateY: ƒ.Axis;
        readonly axisDistance: ƒ.Axis;
        protected translator: ƒ.Node;
        protected rotatorX: ƒ.Node;
        private maxRotX;
        private minDistance;
        private maxDistance;
        constructor(_cmpCamera: ƒ.ComponentCamera, _distanceStart?: number, _maxRotX?: number, _minDistance?: number, _maxDistance?: number);
        get cmpCamera(): ƒ.ComponentCamera;
        get nodeCamera(): ƒ.Node;
        set distance(_distance: number);
        get distance(): number;
        set rotationY(_angle: number);
        get rotationY(): number;
        set rotationX(_angle: number);
        get rotationX(): number;
        rotateY(_delta: number): void;
        rotateX(_delta: number): void;
        positionCamera(_posWorld: ƒ.Vector3): void;
        hndAxisOutput: EventListener;
    }
}
declare namespace FudgeAid {
    import ƒ = FudgeCore;
    class CameraOrbitMovingFocus extends CameraOrbit {
        readonly axisTranslateX: ƒ.Axis;
        readonly axisTranslateY: ƒ.Axis;
        readonly axisTranslateZ: ƒ.Axis;
        constructor(_cmpCamera: ƒ.ComponentCamera, _distanceStart?: number, _maxRotX?: number, _minDistance?: number, _maxDistance?: number);
        translateX(_delta: number): void;
        translateY(_delta: number): void;
        translateZ(_delta: number): void;
        hndAxisOutput: EventListener;
    }
}
declare namespace FudgeAid {
    enum IMAGE_RENDERING {
        AUTO = "auto",
        SMOOTH = "smooth",
        HIGH_QUALITY = "high-quality",
        CRISP_EDGES = "crisp-edges",
        PIXELATED = "pixelated"
    }
    /**
     * Adds comfort methods to create a render canvas
     */
    class Canvas {
        static create(_fillParent?: boolean, _imageRendering?: IMAGE_RENDERING, _width?: number, _height?: number): HTMLCanvasElement;
    }
}
declare namespace FudgeAid {
    import ƒ = FudgeCore;
    class Node extends ƒ.Node {
        private static count;
        constructor(_name?: string, _transform?: ƒ.Matrix4x4, _material?: ƒ.Material, _mesh?: ƒ.Mesh);
        private static getNextName;
        get mtxMeshPivot(): ƒ.Matrix4x4;
        deserialize(_serialization: ƒ.Serialization): Promise<ƒ.Serializable>;
    }
}
declare namespace FudgeAid {
    import ƒ = FudgeCore;
    class NodeArrow extends Node {
        private static internalResources;
        constructor(_name: string, _color: ƒ.Color);
        private static createInternalResources;
        set color(_color: ƒ.Color);
    }
}
declare namespace FudgeAid {
    import ƒ = FudgeCore;
    class NodeCoordinateSystem extends Node {
        constructor(_name?: string, _transform?: ƒ.Matrix4x4);
    }
}
declare namespace FudgeAid {
}
declare namespace FudgeAid {
    /**
     * Handles the animation cycle of a sprite on a [[Node]]
     */
    class NodeSprite extends ƒ.Node {
        private static mesh;
        framerate: number;
        private cmpMesh;
        private cmpMaterial;
        private animation;
        private frameCurrent;
        private direction;
        private timer;
        constructor(_name: string);
        private static createInternalResource;
        setAnimation(_animation: SpriteSheetAnimation): void;
        /**
         * Show a specific frame of the sequence
         */
        showFrame(_index: number): void;
        /**
         * Show the next frame of the sequence or start anew when the end or the start was reached, according to the direction of playing
         */
        showFrameNext: (_event: ƒ.EventTimer) => void;
        /**
         * Sets the direction for animation playback, negativ numbers make it play backwards.
         */
        setFrameDirection(_direction: number): void;
    }
}
declare namespace FudgeAid {
    import ƒ = FudgeCore;
    /**
     * Describes a single frame of a sprite animation
     */
    class SpriteFrame {
        rectTexture: ƒ.Rectangle;
        mtxPivot: ƒ.Matrix4x4;
        mtxTexture: ƒ.Matrix3x3;
        timeScale: number;
    }
    /**
     * Holds SpriteSheetAnimations in an associative hierarchical array
     */
    interface SpriteSheetAnimations {
        [key: string]: SpriteSheetAnimation | SpriteSheetAnimations;
    }
    /**
     * Handles a series of [[SpriteFrame]]s to be mapped onto a [[MeshSprite]]
     * Contains the [[MeshSprite]], the [[Material]] and the spritesheet-texture
     */
    class SpriteSheetAnimation {
        frames: SpriteFrame[];
        name: string;
        spritesheet: ƒ.CoatTextured;
        constructor(_name: string, _spritesheet: ƒ.CoatTextured);
        /**
         * Stores a series of frames in this [[Sprite]], calculating the matrices to use in the components of a [[NodeSprite]]
         */
        generate(_rects: ƒ.Rectangle[], _resolutionQuad: number, _origin: ƒ.ORIGIN2D): void;
        /**
         * Add sprite frames using a grid on the spritesheet defined by a rectangle to start with, the number of frames,
         * the resolution which determines the size of the sprites mesh based on the number of pixels of the texture frame,
         * the offset from one cell of the grid to the next in the sequence and, in case the sequence spans over more than one row or column,
         * the offset to move the start rectangle when the margin of the texture is reached and wrapping occurs.
         */
        generateByGrid(_startRect: ƒ.Rectangle, _frames: number, _resolutionQuad: number, _origin: ƒ.ORIGIN2D, _offsetNext: ƒ.Vector2, _offsetWrap?: ƒ.Vector2): void;
        private createFrame;
    }
}
declare namespace FudgeAid {
    import ƒ = FudgeCore;
    class ComponentStateMachine<State> extends ƒ.ComponentScript implements StateMachine<State> {
        stateCurrent: State;
        stateNext: State;
        instructions: StateMachineInstructions<State>;
        transit(_next: State): void;
        act(): void;
    }
}
/**
 * State machine offers a structure and fundamental functionality for state machines
 * <State> should be an enum defining the various states of the machine
 */
declare namespace FudgeAid {
    /** Format of methods to be used as transitions or actions */
    type StateMachineMethod<State> = (_machine: StateMachine<State>) => void;
    /** Type for maps associating a state to a method */
    type StateMachineMapStateToMethod<State> = Map<State, StateMachineMethod<State>>;
    /** Interface mapping a state to one action multiple transitions */
    interface StateMachineMapStateToMethods<State> {
        action: StateMachineMethod<State>;
        transitions: StateMachineMapStateToMethod<State>;
    }
    /**
     * Core functionality of the state machine, holding solely the current state and, while in transition, the next state,
     * the instructions for the machine and comfort methods to transit and act.
     */
    export class StateMachine<State> {
        stateCurrent: State;
        stateNext: State;
        instructions: StateMachineInstructions<State>;
        transit(_next: State): void;
        act(): void;
    }
    /**
     * Set of instructions for a state machine. The set keeps all methods for dedicated actions defined for the states
     * and all dedicated methods defined for transitions to other states, as well as default methods.
     * Instructions exist independently from StateMachines. A statemachine instance is passed as parameter to the instruction set.
     * Multiple statemachine-instances can thus use the same instruction set and different instruction sets could operate on the same statemachine.
     */
    export class StateMachineInstructions<State> extends Map<State, StateMachineMapStateToMethods<State>> {
        /** Define dedicated transition method to transit from one state to another*/
        setTransition(_current: State, _next: State, _transition: StateMachineMethod<State>): void;
        /** Define dedicated action method for a state */
        setAction(_current: State, _action: StateMachineMethod<State>): void;
        /** Default transition method to invoke if no dedicated transition exists, should be overriden in subclass */
        transitDefault(_machine: StateMachine<State>): void;
        /** Default action method to invoke if no dedicated action exists, should be overriden in subclass */
        actDefault(_machine: StateMachine<State>): void;
        /** Invoke a dedicated transition method if found for the current and the next state, or the default method */
        transit(_current: State, _next: State, _machine: StateMachine<State>): void;
        /** Invoke the dedicated action method if found for the current state, or the default method */
        act(_current: State, _machine: StateMachine<State>): void;
        /** Find the instructions dedicated for the current state or create an empty set for it */
        private getStateMethods;
    }
    export {};
}
declare namespace FudgeAid {
    class Viewport {
        static create(_branch: ƒ.Node): ƒ.Viewport;
        static expandCameraToInteractiveOrbit(_viewport: ƒ.Viewport, _showFocus?: boolean, _speedCameraRotation?: number, _speedCameraTranslation?: number, _speedCameraDistance?: number): CameraOrbit;
    }
}
declare namespace ChessGame {
    import f = FudgeCore;
    class CameraController extends f.ComponentScript {
        private _transformComponent;
        private _user;
        constructor(userType: UserType);
        get TransformComponent(): f.ComponentTransform;
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
        constructor(chessFigures: f.Node, type: UserType, timeController: TimeController);
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
        private _surface;
        private _cameraController;
        private _duell;
        private _originPosition;
        private _battleGround;
        constructor(surface: f.Node, cameraController: CameraController, duell: Duell);
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
        constructor(chessPlayer: ChessPlayers, places: f.Node[], cameraController: CameraController, selctionController: SelectionControl, root: f.Graph);
        HandleGame(): void;
        private HandleFinishMove;
        private WatchCheckmate;
        private HandleMovements;
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
        private _movements;
        private _attacks;
        private _isMovement;
        private _isCheckmate;
        private _selectionFinished;
        constructor(places: f.Node[], player: ChessPlayers, cameraController: CameraController, selectionControl: SelectionControl, user: UserType);
        get Checkmate(): boolean;
        get CurrentDuell(): Duell;
        UpdateCurrentUser(user: UserType): void;
        GetCurrentUser(): UserType;
        GetSelectionState(): boolean;
        HandleInput(): void;
        private IsCheckmate;
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
}
