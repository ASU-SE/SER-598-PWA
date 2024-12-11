export class ApiService {
  constructor(baseUrl = "http://localhost:8080/api") {
    this.baseUrl = baseUrl;
  }

  // Transform frontend format (front/back) to backend format (question/answer)
  _transformCardToBackend(card) {
    // Add debugging
    console.log("Transforming card to backend format:", card);
    const backendCard = {
      id: card.id,
      question: card.front,
      answer: card.back,
    };
    console.log("Transformed card:", backendCard);
    return backendCard;
  }
  // Transform backend format (question/answer) to frontend format (front/back)
  _transformCardFromBackend(card) {
    return {
      id: card.id,
      front: card.question,
      back: card.answer,
      timestamp: new Date().toISOString(),
    };
  }

  async fetchCards() {
    const response = await fetch(`${this.baseUrl}/flashcards`);
    if (!response.ok) throw new Error("Failed to fetch cards");
    const cards = await response.json();
    return cards.map((card) => this._transformCardFromBackend(card));
  }

  async saveCard(flashcard) {
    const backendCard = this._transformCardToBackend(flashcard);
    console.log("Sending to backend:", backendCard); // Debug log

    const response = await fetch(`${this.baseUrl}/flashcards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendCard),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Server response:", errorData);
      throw new Error("Failed to save card");
    }

    const savedCard = await response.json();
    return this._transformCardFromBackend(savedCard);
  }

  async updateCard(card) {
    const backendCard = this._transformCardToBackend(card);
    const response = await fetch(`${this.baseUrl}/flashcards/${card.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendCard),
    });
    if (!response.ok) throw new Error("Failed to update card");
    const updatedCard = await response.json();
    return this._transformCardFromBackend(updatedCard);
  }

  async deleteCard(cardId) {
    const response = await fetch(`${this.baseUrl}/flashcards/${cardId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Server response:", errorData);
      throw new Error("Failed to delete card");
    }
  }
}
