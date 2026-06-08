package com.mihogar.controller;

import com.mihogar.dto.request.ReviewRequest;
import com.mihogar.dto.response.ReviewResponse;
import com.mihogar.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/api/properties/{id}/reviews")
    public ResponseEntity<List<ReviewResponse>> getReviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviews(id));
    }

    @PostMapping("/api/properties/{id}/reviews")
    public ResponseEntity<ReviewResponse> crearReview(
            @PathVariable Long id,
            @RequestBody @Valid ReviewRequest req,
            Authentication auth
    ) {
        return ResponseEntity.status(201).body(reviewService.crearReview(id, auth.getName(), req));
    }

    @DeleteMapping("/api/reviews/{id}")
    public ResponseEntity<Void> eliminarReview(@PathVariable Long id, Authentication auth) {
        reviewService.eliminarReview(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
