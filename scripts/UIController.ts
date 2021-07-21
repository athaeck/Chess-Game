namespace ChessGame {
  import fui = FudgeUserInterface;
  import f = FudgeCore;
  class GameState extends f.Mutable {
    public time: number = 120;
    public player: string = "";
    public currentTime: number = 0;
    public checkmate: string = "";
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