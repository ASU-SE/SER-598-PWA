import { FlashcardManager } from "./managers/FlashcardManager.js";
import { DatabaseManager } from "./managers/DatabaseManager.js";
import { ApiService } from "./services/ApiService.js";
import { SyncService } from "./services/SyncService.js";

class App {
  async initialize() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", async () => {
        try {
          const registration = await navigator.serviceWorker.register(
            "./service-worker.js"
          );
          console.log("ServiceWorker registered:", registration.scope);
        } catch (error) {
          console.error("ServiceWorker registration failed:", error);
        }
      });
    }

    const dbManager = new DatabaseManager();
    await dbManager.initializeDb();

    const apiService = new ApiService();
    const syncService = new SyncService(dbManager, apiService);

    this.flashcardManager = new FlashcardManager(
      dbManager,
      apiService,
      syncService
    );
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App();
  window.app = app;
  await app.initialize();
});

async function testBackend() {
  try {
    const apiService = new ApiService();
    // Test creating a card
    const newCard = await apiService.saveCard({
      front: "Test Question",
      back: "Test Answer",
    });
    console.log("Created card:", newCard);

    // Test fetching all cards
    const cards = await apiService.fetchCards();
    console.log("All cards:", cards);

    // Get the FlashcardManager instance and update its cards
    const app = window.app; // Make sure your App instance is accessible
    await app.flashcardManager.loadCards(); // This will reload cards and update UI

    alert("Backend connection successful! Check console for details.");
  } catch (error) {
    console.error("Backend test failed:", error);
    alert("Backend connection failed: " + error.message);
  }
}

window.testBackend = testBackend; // Make it accessible globally
