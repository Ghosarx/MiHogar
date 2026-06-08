package com.mihogar.service;

import com.mihogar.dto.response.ChatDTO;
import com.mihogar.dto.response.MessageDTO;
import com.mihogar.entity.Chat;
import com.mihogar.entity.Message;
import com.mihogar.entity.Property;
import com.mihogar.entity.User;
import com.mihogar.exception.BadRequestException;
import com.mihogar.exception.NotFoundException;
import com.mihogar.repository.ChatRepository;
import com.mihogar.repository.MessageRepository;
import com.mihogar.repository.PropertyRepository;
import com.mihogar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepo;
    private final MessageRepository messageRepo;
    private final UserRepository userRepo;
    private final PropertyRepository propertyRepo;

    public List<ChatDTO> getMisChats(String correo) {
        User me = findUser(correo);
        return chatRepo.findByUser(me.getId()).stream()
                .map(c -> toDTO(c, me.getId()))
                .toList();
    }

    @Transactional
    public ChatDTO iniciarChat(String correo, Long propiedadId) {
        User me = findUser(correo);
        Property prop = propertyRepo.findById(propiedadId)
                .orElseThrow(() -> new NotFoundException("Propiedad no encontrada."));

        User owner = prop.getOwner();
        if (owner.getId().equals(me.getId())) {
            throw new BadRequestException("No puedes iniciar un chat con tu propia propiedad.");
        }

        Chat chat = chatRepo.findExistingChat(me.getId(), owner.getId(), propiedadId)
                .orElseGet(() -> chatRepo.save(Chat.builder()
                        .usuario1(me)
                        .usuario2(owner)
                        .propiedad(prop)
                        .build()));

        return toDTO(chat, me.getId());
    }

    public List<MessageDTO> getMensajes(String correo, Long chatId) {
        User me = findUser(correo);
        Chat chat = findChat(chatId, me.getId());
        return messageRepo.findByChatIdOrderByEnviadoEnAsc(chat.getId()).stream()
                .map(this::toMessageDTO)
                .toList();
    }

    @Transactional
    public MessageDTO enviarMensaje(String correo, Long chatId, String contenido) {
        User me = findUser(correo);
        Chat chat = findChat(chatId, me.getId());
        Message msg = messageRepo.save(Message.builder()
                .chat(chat)
                .remitente(me)
                .contenido(contenido)
                .build());
        return toMessageDTO(msg);
    }

    @Transactional
    public void marcarLeidos(String correo, Long chatId) {
        User me = findUser(correo);
        findChat(chatId, me.getId());
        messageRepo.markAllAsRead(chatId, me.getId());
    }

    public long countNoLeidos(String correo) {
        User me = findUser(correo);
        return messageRepo.countUnreadForUser(me.getId());
    }

    private User findUser(String correo) {
        return userRepo.findByCorreo(correo)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado."));
    }

    private Chat findChat(Long chatId, Long userId) {
        Chat chat = chatRepo.findById(chatId)
                .orElseThrow(() -> new NotFoundException("Chat no encontrado."));
        if (!chat.getUsuario1().getId().equals(userId) && !chat.getUsuario2().getId().equals(userId)) {
            throw new BadRequestException("No tienes acceso a este chat.");
        }
        return chat;
    }

    private ChatDTO toDTO(Chat c, Long myId) {
        User otro = c.getUsuario1().getId().equals(myId) ? c.getUsuario2() : c.getUsuario1();
        List<Message> msgs = messageRepo.findByChatIdOrderByEnviadoEnAsc(c.getId());
        Message last = msgs.isEmpty() ? null : msgs.get(msgs.size() - 1);
        long noLeidos = msgs.stream().filter(m -> !m.getLeido() && !m.getRemitente().getId().equals(myId)).count();

        return ChatDTO.builder()
                .id(c.getId())
                .otroUsuarioId(otro.getId())
                .otroUsuarioNombre(otro.getNombre())
                .otroUsuarioApellido(otro.getApellido())
                .otroUsuarioFoto(otro.getFotoPerfil())
                .propiedadId(c.getPropiedad() != null ? c.getPropiedad().getId() : null)
                .propiedadTitulo(c.getPropiedad() != null ? c.getPropiedad().getTitulo() : null)
                .ultimoMensaje(last != null ? last.getContenido() : null)
                .ultimoMensajeEn(last != null ? last.getEnviadoEn() : null)
                .noLeidos(noLeidos)
                .creadoEn(c.getCreadoEn())
                .build();
    }

    private MessageDTO toMessageDTO(Message m) {
        return MessageDTO.builder()
                .id(m.getId())
                .remitenteId(m.getRemitente().getId())
                .remitenteNombre(m.getRemitente().getNombre())
                .contenido(m.getContenido())
                .leido(m.getLeido())
                .enviadoEn(m.getEnviadoEn())
                .build();
    }
}
