package com.flashcards.flashcardPWA.model;

import java.util.UUID;

import jakarta.persistence.*;

@Entity
public class Flashcard {
	@Id
	@Column(columnDefinition = "VARCHAR(36)")
	private UUID id;
	private String question;
	private String answer;

	public Flashcard() {
	}

	// Constructor
	public Flashcard(String question, String answer) {
		this.question = question;
		this.answer = answer;
	}

	// Getters and Setters
	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public String getQuestion() {
		return question;
	}

	public void setQuestion(String question) {
		this.question = question;
	}

	public String getAnswer() {
		return answer;
	}

	public void setAnswer(String answer) {
		this.answer = answer;
	}

}
