export class UIManager {
  private button: HTMLElement;

  constructor() {
    this.listenToMouseMovement();
    this.button = document.createElement("button");
    this.initFullscreenButton();
  }

  private initFullscreenButton() {
    document.body.appendChild(this.button);
    this.button.textContent = "Fullscreen";
    this.button.style.zIndex = "100";
    this.button.style.position = "absolute";
    this.button.style.display = "none";
    this.button.onclick = () => {
      document.body.requestFullscreen();
    };
  }

  private listenToMouseMovement() {
    let mouseMoveTimeout: number;

    document.addEventListener("mousemove", () => {
      clearTimeout(mouseMoveTimeout);
      this.button.style.display = "block";
      mouseMoveTimeout = window.setTimeout(() => {
        this.button.style.display = "none";
      }, 2000); // Hide the button after 2 seconds of no mouse movement
    });
  }
}
