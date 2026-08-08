import "./style.css";
import heroImg from "./assets/hero.png";

// Importing an asset exercises the inline-assets pipeline in develop-inline mode:
// after build the <img> src must resolve from the base64 asset map, not a file.
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <h1>vite-game-forge example</h1>
  <img src="${heroImg}" width="170" height="179" alt="hero" />
  <button id="counter" type="button">count is 0</button>
`;

const button = document.querySelector<HTMLButtonElement>("#counter")!;
let count = 0;
button.addEventListener("click", () => {
  button.textContent = `count is ${++count}`;
});
