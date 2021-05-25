namespace ChessGame {
  import ƒui = FudgeUserInterface;

  class GameState extends ƒ.Mutable {
    // public hits: number = 0;
    public time: number = 120;
    public player: string = "player";
    public currentTime: number = 0;
    protected reduceMutator(_mutator: ƒ.Mutator): void {/* */ }
  }

  export let gameState: GameState = new GameState();

  export class Hud {
    private static controller: ƒui.Controller;

    public static start(): void {
      let domHud: HTMLDivElement = document.querySelector("div#ui-wrapper");
      Hud.controller = new ƒui.Controller(gameState, domHud);
      Hud.controller.updateUserInterface();
    }
  }
}