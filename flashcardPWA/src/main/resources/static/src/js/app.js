import { FlashcardManager } from "./managers/FlashcardManager.js";
import { ApiService } from "./services/ApiService.js";

class App {
  async initialize() {
    // Initialize Service Worker
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

// Backend connection test function
async function testBackend() {
  try {
    const apiService = new ApiService();

    // Test creating a card
    const newCard = await apiService.saveCard({
      id: crypto.randomUUID(), // Add ID generation
      front: "Test Question",
      back: "Test Answer",
      timestamp: new Date().toISOString(), // Add timestamp
    });
    console.log("Created card:", newCard);

    // Test fetching all cards
    const cards = await apiService.fetchCards();
    console.log("All cards:", cards);

    // Reload cards in FlashcardManager
    const app = window.app;
    await app.flashcardManager.loadCards();

    alert("Backend connection successful! Check console for details.");
  } catch (error) {
    console.error("Backend test failed:", error);
    alert("Backend connection failed: " + error.message);
  }
}

// Make test function globally accessible
window.testBackend = testBackend;
