import { setupEmailWorker } from "./workers/emailWorker";
import { setupFilterWorker } from "./workers/filterWorker";
export const setupAllWorkers = () => {
  console.log("Setting up all workers...");
  setupEmailWorker();
  setupFilterWorker();
  console.log("All workers have been set up.");
};
