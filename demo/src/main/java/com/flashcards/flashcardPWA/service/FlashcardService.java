package com.flashcards.flashcardPWA.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.flashcards.flashcardPWA.model.Flashcard;
import com.flashcards.flashcardPWA.repository.FlashcardRepository;

import java.util.List;
import java.util.UUID;

@Service
public class FlashcardService {
    @Autowired
    private FlashcardRepository repository;

    public List<Flashcard> getAllFlashcards() {
        return repository.findAll();
    }

    public Flashcard getFlashcardById(UUID id) {
        return repository.findById(id).orElse(null);
    }

    public Flashcard createFlashcard(Flashcard flashcard) {
        return repository.save(flashcard);
    }

    public Flashcard updateFlashcard(UUID id, Flashcard updatedFlashcard) {
        if (repository.existsById(id)) {
            updatedFlashcard.setId(id);
            return repository.save(updatedFlashcard);
        }
        return null;
    }

    public boolean deleteFlashcard(UUID id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }

}