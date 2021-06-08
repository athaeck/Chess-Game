namespace ChessGame {
  import fui = FudgeUserInterface;

  class GameState extends f.Mutable {
    // public hits: number = 0;
    public time: number = 120;
    public player: string = "player";
    public currentTime: number = 0;
    protected reduceMutator(_mutator: f.Mutator): void {/* */ }
  }

  export let gameState: GameState = new GameState();

  export class Hud {
    private static controller: fui.Controller;

    public static start(): void {
      let domHud: HTMLDivElement = document.querySelector("div#ui-wrapper");
      Hud.controller = new fui.Controller(gameState, domHud);
      Hud.controller.updateUserInterface();
    }
  }
}