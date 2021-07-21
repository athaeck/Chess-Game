namespace ChessGame {
    import f = FudgeCore;
    export class TimeController {
        private _currentUseTime: number;
        private _remainTime: number;
        private _count: boolean = false;
        constructor() {
            this._currentUseTime = 0;
            // FetchMaxTime();
        }
        public StartTimer(): void {
            this._count = true;
            console.log("hit");
        }
        public StoppTimer(): void {
            this._count = false;
            this._remainTime = this._remainTime - this._currentUseTime;
            this._currentUseTime = 0;
        }
        public Count(): void {
            if (this._count) {
                this._currentUseTime++;
            }
            console.log(this._currentUseTime);

        }
        public IsEnoughRemianTime(): boolean {
            return this._remainTime > 0 ? true : false;
        }
    }
}