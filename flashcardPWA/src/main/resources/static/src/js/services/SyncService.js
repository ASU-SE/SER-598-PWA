export class SyncService {
  constructor(dbManager, apiService) {
    this.dbManager = dbManager;
    this.apiService = apiService;
    this.syncStatus = document.querySelector(".sync-status");
    this.initializeOnlineListener();
  }

  updateSyncStatus(message) {
    if (!this.syncStatus) {
      this.syncStatus = document.querySelector(".sync-status");
    }
    if (this.syncStatus) {
      this.syncStatus.textContent = message;
    }
  }

  async syncWithServer() {
    if (!navigator.onLine) {
      this.updateSyncStatus("Offline - Changes will sync when online");
      return;
    }

    const queue = await this.dbManager.getAllFromStore("syncQueue");
    console.log("Processing sync queue:", queue);

    if (queue.length === 0) {
      this.updateSyncStatus("Online - All synced");
      return;
    }

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      try {
        this.updateSyncStatus(`Syncing ${i + 1} of ${queue.length}`);
        console.log("Processing item:", item);

        switch (item.operation) {
          case "create":
            await this.apiService.saveCard(item.data);
            break;
          case "update":
            await this.apiService.updateCard(item.data);
            break;
          case "delete":
            await this.apiService.deleteCard(item.data.id);
            break;
        }

        await this.dbManager.deleteFromStore("syncQueue", item.id);
        console.log(`Successfully processed item ${i + 1} of ${queue.length}`);

        if (i === queue.length - 1) {
          this.updateSyncStatus("Online - All synced");
        }
      } catch (error) {
        console.error("Failed to process sync item:", error);
        if (!navigator.onLine) {
          this.updateSyncStatus("Lost connection - Will retry when online");
          break;
        } else {
          this.updateSyncStatus("Sync error - Will retry");
        }
      }
    }
  }

  async queueForSync(operation, data) {
    const queueItem = {
      operation,
      data,
      timestamp: new Date().toISOString(),
    };

    await this.dbManager.saveToStore("syncQueue", queueItem);
    console.log("Queued for sync:", queueItem);

    const queue = await this.dbManager.getAllFromStore("syncQueue");

    if (navigator.onLine) {
      this.updateSyncStatus(`Processing ${queue.length} pending items...`);
      await this.syncWithServer();
    } else {
      this.updateSyncStatus(`Offline - ${queue.length} changes pending`);
    }
  }

  async initializeOnlineListener() {
    window.addEventListener("online", async () => {
      const queue = await this.dbManager.getAllFromStore("syncQueue");
      if (queue.length > 0) {
        this.updateSyncStatus(`Back online - Syncing ${queue.length} items`);
        await this.syncWithServer();
      } else {
        this.updateSyncStatus("Online - All synced");
      }
    });

    window.addEventListener("offline", async () => {
      const queue = await this.dbManager.getAllFromStore("syncQueue");
      this.updateSyncStatus(`Offline - ${queue.length} changes pending`);
    });

    // Set initial status
    if (navigator.onLine) {
      const queue = await this.dbManager.getAllFromStore("syncQueue");
      if (queue.length > 0) {
        this.updateSyncStatus(`Online - ${queue.length} items pending sync`);
      } else {
        this.updateSyncStatus("Online - All synced");
      }
    } else {
      const queue = await this.dbManager.getAllFromStore("syncQueue");
      this.updateSyncStatus(`Offline - ${queue.length} changes pending`);
    }
  }

  async performInitialSync() {
    if (!navigator.onLine) {
      console.log("Offline - Initial sync skipped");
      this.updateSyncStatus("Offline - Initial sync skipped");
      return;
    }

    try {
      console.log("Starting initial sync...");
      this.updateSyncStatus("Starting initial sync...");

      // Get all cards from IndexedDB
      console.log("Fetching local cards...");
      const localCards = await this.dbManager.getAllFromStore("cards");
      console.log("Local cards:", localCards);

      // Get all cards from server
      console.log("Fetching server cards...");
      const serverCards = await this.apiService.fetchCards();
      console.log("Server cards:", serverCards);

      const serverCardIds = new Set(serverCards.map((card) => card.id));
      const cardsToSync = localCards.filter(
        (card) => !serverCardIds.has(card.id)
      );
      console.log("Cards needing sync:", cardsToSync);

      if (cardsToSync.length > 0) {
        this.updateSyncStatus(`Found ${cardsToSync.length} cards to sync`);

        for (const card of cardsToSync) {
          console.log("Queueing card for sync:", card);
          await this.queueForSync("create", card);
        }

        console.log("Starting server sync...");
        await this.syncWithServer();
        this.updateSyncStatus("Initial sync complete");
      } else {
        console.log("No cards need syncing");
        this.updateSyncStatus("All cards up to date");
      }
    } catch (error) {
      console.error("Initial sync failed:", error);
      if (!navigator.onLine) {
        this.updateSyncStatus("Connection lost - Will retry when online");
      } else {
        // Check if it's a network error
        if (
          error instanceof TypeError &&
          error.message.includes("Failed to fetch")
        ) {
          this.updateSyncStatus("Cannot reach server - Check connection");
        } else {
          this.updateSyncStatus(`Sync error: ${error.message}`);
        }
      }
    }
  }
}
