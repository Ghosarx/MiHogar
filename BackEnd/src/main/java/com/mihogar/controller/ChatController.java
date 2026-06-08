package com.mihogar.controller;

import com.mihogar.dto.request.SendMessageRequest;
import com.mihogar.dto.response.ChatDTO;
import com.mihogar.dto.response.MessageDTO;
import com.mihogar.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping
    public ResponseEntity<List<ChatDTO>> getMisChats(@AuthenticationPrincipal String correo) {
        return ResponseEntity.ok(chatService.getMisChats(correo));
    }

    @PostMapping("/iniciar")
    public ResponseEntity<ChatDTO> iniciarChat(
            @AuthenticationPrincipal String correo,
            @RequestParam Long propiedadId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chatService.iniciarChat(correo, propiedadId));
    }

    @GetMapping("/{chatId}/mensajes")
    public ResponseEntity<List<MessageDTO>> getMensajes(
            @AuthenticationPrincipal String correo,
            @PathVariable Long chatId) {
        return ResponseEntity.ok(chatService.getMensajes(correo, chatId));
    }

    @PostMapping("/{chatId}/mensajes")
    public ResponseEntity<MessageDTO> enviarMensaje(
            @AuthenticationPrincipal String correo,
            @PathVariable Long chatId,
            @Valid @RequestBody SendMessageRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chatService.enviarMensaje(correo, chatId, req.getContenido()));
    }

    @PostMapping("/{chatId}/leer")
    public ResponseEntity<Void> marcarLeidos(
            @AuthenticationPrincipal String correo,
            @PathVariable Long chatId) {
        chatService.marcarLeidos(correo, chatId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/no-leidos")
    public ResponseEntity<Map<String, Long>> countNoLeidos(@AuthenticationPrincipal String correo) {
        return ResponseEntity.ok(Map.of("count", chatService.countNoLeidos(correo)));
    }
}
