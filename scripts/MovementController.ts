namespace ChessGame {
    import f = FudgeCore;
    export class MovementController extends f.ComponentScript {
        private _start: f.ComponentTransform;
        private _target: f.ComponentTransform;
        private _places: f.Node[];
        private _name: string;
        private _body: f.ComponentRigidbody;
        private _parent: ChessFigure;
        private _enemyOnTheWay: boolean = false;
        private _collidingEnemy: ChessFigure;
        constructor() {
            super();
            this.singleton = true;
            this.addEventListener(f.EVENT.COMPONENT_ADD, this.Start.bind(this));
        }
        public get EnemyOnTheWay(): boolean {
            return this._enemyOnTheWay;
        }
        public get CollidingEnemy(): ChessFigure {
            return this._collidingEnemy;
        }
        public Init(target: f.ComponentTransform, places: f.Node[], name: string): void {
            this._name = name;
            this._target = target;
            this._places = places;
        }
        public EndMovement(): void {
            this._enemyOnTheWay = false;
            this._collidingEnemy = null;
            this._body.physicsType = f.PHYSICS_TYPE.KINEMATIC;
            this._body.mass = 1;
            this._body.restitution = 0.5;
            this.getContainer().getComponent(CollisionController).Remove();
            this.getContainer().removeComponent(this);
        }
        private Start(): void {
            this._parent = this.getContainer() as ChessFigure;
            this._body = this._parent.getComponent(f.ComponentRigidbody);
            this._start = this._parent.GetPlace().getComponent(f.ComponentTransform);
            this._parent.addComponent(new CollisionController());
            this.CheckIfEnemyOccupyWay();
            this.HandleMove();
        }
        private HandleMove(): void {
            this._parent.addComponent(new SoundController(SoundType.MOVE));
            this._body.physicsType = f.PHYSICS_TYPE.DYNAMIC;
            this._body.mass = 50;
            this._body.restitution = 0;
            const toTranslate: f.Vector3 = new f.Vector3(this._target.mtxLocal.translation.x - this._start.mtxLocal.translation.x, 0, this._target.mtxLocal.translation.z - this._start.mtxLocal.translation.z);
            switch (this._name) {
                case "Bauer":
                    this._parent.UpdateInitScale();
                    break;
                default:
                    break;
            }
            this._body.translateBody(toTranslate);
            const newPlaceController: PlaceController = this._target.getContainer().getComponent(PlaceController);
            const currentPlaceController: PlaceController = this._parent.GetPlace().getComponent(PlaceController);
            currentPlaceController.RemoveChessFigure();
            newPlaceController.SetChessFigure(this._parent);
        }
        private CheckIfEnemyOccupyWay(): void {
            const targetVector: f.Vector3 = this._target.mtxLocal.translation;
            for (const place of this._places) {
                const transform: f.ComponentTransform = place.getComponent(f.ComponentTransform);
                if (Round(transform.mtxLocal.translation.x, 10) === Round(targetVector.x, 10) && Round(transform.mtxLocal.translation.z, 10) === Round(targetVector.z, 10)) {
                    const placeController: PlaceController = place.getComponent(PlaceController);
                    const chessFigure: ChessFigure = placeController.GetChessFigure();
                    if (chessFigure) {
                        if (this._parent.GetUser().GetPlayerType() !== chessFigure.GetUser().GetPlayerType()) {

                            // this._enemyOnTheWay = true;
                            // chessFigure.getComponent(f.ComponentRigidbody).physicsType = f.PHYSICS_TYPE.DYNAMIC;
                            // chessFigure.getComponent(f.ComponentRigidbody).friction = 0;
                            // this._collidingEnemy = chessFigure;
                            this._parent.addComponent(new SoundController(SoundType.HIT));
                            chessFigure.GetUser().RemoveFigure(chessFigure);
                        }
                    }
                }
            }
        }
    }
}