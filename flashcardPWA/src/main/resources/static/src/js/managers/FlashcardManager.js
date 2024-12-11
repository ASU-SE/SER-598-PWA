import { ReminderManager } from "./ReminderManager.js";

export class FlashcardManager {
  constructor(dbManager, apiService, syncService) {
    this.dbManager = dbManager;
    this.apiService = apiService;
    this.syncService = syncService;
    this.cards = [];
    this.currentCardIndex = 0;
    this.cardContainer = document.querySelector("#card-wrapper");
    this.reminderManager = new ReminderManager();

    //sync
    this.syncStatus = document.createElement("div");
    this.syncStatus.className = "sync-status";
    document.querySelector("#main-container").appendChild(this.syncStatus);
    // Listen for online/offline events
    window.addEventListener("online", () => {
      this.syncStatus.textContent = "Online - Syncing...";
      this.syncStatus.className = "sync-status online";
    });

    window.addEventListener("offline", () => {
      this.syncStatus.textContent = "Offline - Changes will sync when online";
      this.syncStatus.className = "sync-status offline";
    });

    // Set initial status
    this.updateSyncStatus();

    this.initializeButtons();
    this.initializeCardClick();
    this.initialize();
  }

  async initialize() {
    try {
      // First load cards
      await this.loadCards();

      // Then perform initial sync if we're online
      if (navigator.onLine) {
        await this.syncService.performInitialSync();
      }
    } catch (error) {
      console.error("Initialization failed:", error);
    }
  }

  updateSyncStatus() {
    if (navigator.onLine) {
      this.syncStatus.textContent = "Online";
      this.syncStatus.className = "sync-status online";
    } else {
      this.syncStatus.textContent = "Offline - Changes will sync when online";
      this.syncStatus.className = "sync-status offline";
    }
  }

  initializeButtons() {
    document
      .querySelector("#add button")
      .addEventListener("click", () => this.addNewCard());

    document
      .querySelector(".left-arrow")
      .addEventListener("click", () => this.previousCard());

    document
      .querySelector(".right-arrow")
      .addEventListener("click", () => this.nextCard());
  }

  previousCard() {
    if (this.cards.length > 0) {
      this.currentCardIndex =
        (this.currentCardIndex - 1 + this.cards.length) % this.cards.length;
      this.renderCards();
    }
  }

  async loadCards() {
    try {
      const cards = await this.dbManager.getAllFromStore("cards");
      this.cards = cards || [];
      this.renderCards(); // Make sure this is being called
      console.log("Loaded cards:", this.cards); // Add this for debugging
    } catch (error) {
      console.error("Failed to load cards:", error);
    }
  }

  async createCard(frontContent = "Front", backContent = "Back") {
    console.log("Creating new card:", { frontContent, backContent });
    const card = {
      front: frontContent,
      back: backContent,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    try {
      console.log("Saving card to IndexedDB:", card);
      await this.dbManager.saveToStore("cards", card);

      this.cards.push(card);
      this.renderCards();

      console.log("Queueing card for sync:", card);
      await this.syncService.queueForSync("create", card);

      this.currentCardIndex = this.cards.length - 1;
      console.log("Card creation complete");
    } catch (error) {
      console.error("Failed to create card:", error);
      alert("Failed to create card. Please try again.");
    }
  }
  initializeCardClick() {
    // Delegate click event to card-wrapper to handle dynamically created cards
    this.cardContainer.addEventListener("click", (e) => {
      // Find the closest parent with class 'card'
      const card = e.target.closest(".card");
      if (card) {
        card.classList.toggle("flipped");
      }
    });
  }

  renderCards() {
    console.log("Rendering cards:", this.cards);
    this.cardContainer.innerHTML = "";

    if (this.cards.length === 0) {
      this.cardContainer.innerHTML = `
            <div class="card">
                <div class="card-inner">
                    <div class="card-front">Add a card to start</div>
                    <div class="card-back">Click + to add</div>
                </div>
            </div>
            <div class="card-counter">0/0</div>
        `;
      return;
    }

    const currentCard = this.cards[this.currentCardIndex];
    const deleteButtonHTML = `
        <button class="delete-button" aria-label="Delete card">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
        </button>
    `;

    this.cardContainer.innerHTML = `
        <div class="card" data-id="${currentCard.id}">
            <div class="card-inner">
                <div class="card-front">
                    ${deleteButtonHTML}
                    ${currentCard.front}
                </div>
                <div class="card-back">
                    ${deleteButtonHTML}
                    ${currentCard.back}
                </div>
            </div>
        </div>
        <div class="card-counter">${this.currentCardIndex + 1}/${
      this.cards.length
    }</div>
    `;

    // Add event listeners for both delete buttons
    const deleteButtons = this.cardContainer.querySelectorAll(".delete-button");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent card flip when clicking delete
        this.deleteCard(currentCard.id);
      });
    });
  }

  async deleteCard(cardId) {
    if (confirm("Are you sure you want to delete this card?")) {
      try {
        // Remove from local array
        const cardIndex = this.cards.findIndex((card) => card.id === cardId);
        if (cardIndex !== -1) {
          this.cards.splice(cardIndex, 1);
        }

        // Remove from IndexedDB
        await this.dbManager.deleteFromStore("cards", cardId);

        // Queue for sync with server
        await this.syncService.queueForSync("delete", { id: cardId });

        // Update current card index if necessary
        if (this.cards.length === 0) {
          this.currentCardIndex = 0;
        } else if (this.currentCardIndex >= this.cards.length) {
          this.currentCardIndex = this.cards.length - 1;
        }

        // Re-render cards
        this.renderCards();
      } catch (error) {
        console.error("Failed to delete card:", error);
        alert("Failed to delete card. Please try again.");
      }
    }
  }

  addNewCard() {
    const front = prompt("Enter front content:");
    const back = prompt("Enter back content:");
    if (front && back) {
      this.createCard(front, back);
    }
  }

  flipCurrentCard() {
    const card = document.querySelector(".card");
    card.classList.toggle("flipped");
  }

  nextCard() {
    if (this.cards.length > 0) {
      this.currentCardIndex = (this.currentCardIndex + 1) % this.cards.length;
      this.renderCards();
    }
  }
}
