namespace ChessGame {
    export class State {
        private static _instance: State;

        private activeUser: UserType;

        private constructor() {
            
        }

        public static get Instance(): State {
            return this._instance || (this._instance = new this());
        }

        public set SetUser(user: UserType) {
            this.activeUser = user;
        }
        public get User(): UserType{
            return this.activeUser;
        }
    }
}