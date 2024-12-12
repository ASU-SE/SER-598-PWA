package com.flashcards.flashcardPWA.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flashcards.flashcardPWA.model.Flashcard;

public interface FlashcardRepository extends JpaRepository<Flashcard, UUID> {
}
