package com.mihogar.controller;

import com.mihogar.entity.Tag;
import com.mihogar.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagRepository tagRepo;

    @GetMapping
    public ResponseEntity<List<Tag>> listAll() {
        return ResponseEntity.ok(tagRepo.findAllByOrderByCategoriaAscNombreAsc());
    }
}
