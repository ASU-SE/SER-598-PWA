import { FlashcardManager } from "./managers/FlashcardManager.js";
import { ApiService } from "./services/ApiService.js";

class App {
  async initialize() {

    // Initialize services and managers
    const apiService = new ApiService();
    this.flashcardManager = new FlashcardManager(apiService);
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  const app = new App();
  window.app = app; // Make app instance globally accessible
  await app.initialize();
});
