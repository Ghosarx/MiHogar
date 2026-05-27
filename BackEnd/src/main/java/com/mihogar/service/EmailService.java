package com.mihogar.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendPasswordResetCode(String to, String nombre, String codigo) {
        String html = """
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
              <h2 style="color:#1a1a2e;">Recuperación de contraseña — MiHogar</h2>
              <p>Hola <strong>%s</strong>,</p>
              <p>Usa el siguiente código para restablecer tu contraseña.
                 Es válido durante <strong>15 minutos</strong>.</p>
              <div style="text-align:center;margin:32px 0;">
                <span style="font-size:40px;font-weight:bold;letter-spacing:10px;
                             color:#4f46e5;background:#f3f4f6;padding:16px 24px;
                             border-radius:8px;">%s</span>
              </div>
              <p style="color:#6b7280;font-size:13px;">
                Si no solicitaste este correo, ignóralo.
              </p>
            </div>
            """.formatted(nombre, codigo);

        try {
            var msg = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("Tu código de recuperación — MiHogar");
            helper.setText(html, true);
            mailSender.send(msg);
        } catch (MessagingException e) {
            // Loguear y no relanzar para no revelar si el correo existe
            System.err.println("Error enviando email a " + to + ": " + e.getMessage());
        }
    }

    @Async
    public void sendPropertyRejected(String to, String nombre, String tituloPropiedad, String motivo) {
        String html = """
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
              <h2 style="color:#dc2626;">Publicación rechazada</h2>
              <p>Hola <strong>%s</strong>,</p>
              <p>Lamentablemente tu publicación <strong>"%s"</strong> no fue aprobada.</p>
              <p><strong>Motivo:</strong> %s</p>
              <p>Puedes editar y volver a publicarla en cualquier momento.</p>
            </div>
            """.formatted(nombre, tituloPropiedad, motivo);

        try {
            var msg = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("Publicación rechazada — MiHogar");
            helper.setText(html, true);
            mailSender.send(msg);
        } catch (MessagingException e) {
            System.err.println("Error enviando email: " + e.getMessage());
        }
    }
}
