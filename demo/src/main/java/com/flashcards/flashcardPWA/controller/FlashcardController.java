package com.flashcards.flashcardPWA.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.flashcards.flashcardPWA.model.Flashcard;
import com.flashcards.flashcardPWA.service.FlashcardService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/flashcards")
public class FlashcardController {

    @Autowired
    private FlashcardService service;

    // Get all flashcards
    @GetMapping
    public ResponseEntity<List<Flashcard>> getAllFlashcards() {
        List<Flashcard> flashcards = service.getAllFlashcards();
        return ResponseEntity.ok(flashcards);
    }

    // Get a flashcard by id
    @GetMapping("/{id}")
    public ResponseEntity<Flashcard> getFlashcardById(@PathVariable UUID id) {
        Flashcard flashcard = service.getFlashcardById(id);
        if (flashcard != null) {
            return ResponseEntity.ok(flashcard);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Create a new flashcard
    @PostMapping
    public ResponseEntity<?> createFlashcard(@RequestBody Flashcard flashcard) {
        try {
            if (flashcard.getQuestion() == null || flashcard.getAnswer() == null) {
                return ResponseEntity
                        .badRequest()
                        .body("Question and answer are required");
            }

            if (flashcard.getId() == null) {
                return ResponseEntity
                        .badRequest()
                        .body("ID is required");
            }

            Flashcard createdFlashcard = service.createFlashcard(flashcard);
            return ResponseEntity.ok(createdFlashcard);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body("Error creating flashcard: " + e.getMessage());
        }
    }

    // Update an existing flashcard
    @PutMapping("/{id}")
    public ResponseEntity<Flashcard> updateFlashcard(@PathVariable UUID id, @RequestBody Flashcard updatedFlashcard) {
        Flashcard flashcard = service.updateFlashcard(id, updatedFlashcard);
        if (flashcard != null) {
            return ResponseEntity.ok(flashcard);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Deleting a flashcard
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlashcard(@PathVariable UUID id) {
        boolean isDeleted = service.deleteFlashcard(id);
        if (isDeleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
