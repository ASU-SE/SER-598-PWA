export class FlashcardManager {
  constructor(apiService) {
    this.apiService = apiService;
    this.cards = [];
    this.currentCardIndex = 0;
    this.cardContainer = document.querySelector("#card-wrapper");

    this.initializeButtons();
    this.initializeCardClick();
    this.loadCards();
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

  initializeCardClick() {
    this.cardContainer.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (card) {
        card.classList.toggle("flipped");
      }
    });
  }

  async loadCards() {
    try {
      const cards = await this.apiService.fetchCards();
      this.cards = cards || [];
      this.renderCards();
      console.log("Loaded cards:", this.cards);
    } catch (error) {
      console.error("Failed to load cards:", error);
      alert("Failed to load cards. Please try again.");
    }
  }

  async createCard(frontContent = "Front", backContent = "Back") {
    const card = {
      front: frontContent,
      back: backContent,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    try {
      const savedCard = await this.apiService.saveCard(card);
      this.cards.push(savedCard);
      this.currentCardIndex = this.cards.length - 1;
      this.renderCards();
    } catch (error) {
      console.error("Failed to create card:", error);
      alert("Failed to create card. Please try again.");
    }
  }

  async deleteCard(cardId) {
    if (confirm("Are you sure you want to delete this card?")) {
      try {
        await this.apiService.deleteCard(cardId);

        const cardIndex = this.cards.findIndex((card) => card.id === cardId);
        if (cardIndex !== -1) {
          this.cards.splice(cardIndex, 1);
        }

        if (this.cards.length === 0) {
          this.currentCardIndex = 0;
        } else if (this.currentCardIndex >= this.cards.length) {
          this.currentCardIndex = this.cards.length - 1;
        }

        this.renderCards();
      } catch (error) {
        console.error("Failed to delete card:", error);
        alert("Failed to delete card. Please try again.");
      }
    }
  }

  renderCards() {
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

    const deleteButtons = this.cardContainer.querySelectorAll(".delete-button");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        this.deleteCard(currentCard.id);
      });
    });
  }

  addNewCard() {
    const front = prompt("Enter front content:");
    const back = prompt("Enter back content:");
    if (front && back) {
      this.createCard(front, back);
    }
  }

  previousCard() {
    if (this.cards.length > 0) {
      this.currentCardIndex =
        (this.currentCardIndex - 1 + this.cards.length) % this.cards.length;
      this.renderCards();
    }
  }

  nextCard() {
    if (this.cards.length > 0) {
      this.currentCardIndex = (this.currentCardIndex + 1) % this.cards.length;
      this.renderCards();
    }
  }
}
