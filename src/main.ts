import { DeviceManager } from "./core/device-manager";
import "./style.css";
import typescriptLogo from "./typescript.svg";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
  <button id="connectButton">Connect to Device</button>
    <h1>WattsUp!</h1>
    <div class="logos">
      <a href="https://www.typescriptlang.org/" target="_blank">
        <img src="${typescriptLogo}" class="logo typescript" alt="TypeScript logo" />
      </a>
    </div>
  </div>
`;

const deviceManager = new DeviceManager();
document.querySelector<HTMLButtonElement>("#connectButton")!.onclick =
  async () => {
    try {
      const device = await deviceManager.connect("heartRate");
      console.log("Connected to device:", device);
    } catch (error) {
      console.error("Error connecting to device:", error);
    }
  };
