package com.prototype.arpartment_managing.service;

import javax.mail.*;
import javax.mail.internet.*;
import java.util.Properties;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final String SENDER_EMAIL = "trunghieu310705@gmail.com";
    private static final String SENDER_PASSWORD = "zapj fxet dafl bbbo"; // Sử dụng mật khẩu ứng dụng nếu có bật 2FA

    public void sendOTPViaEmail(String recipientEmail, String otp) throws MessagingException {
        Properties properties = new Properties();
        properties.put("mail.smtp.host", "smtp.gmail.com");
        properties.put("mail.smtp.port", "587");
        properties.put("mail.smtp.auth", "true");
        properties.put("mail.smtp.starttls.enable", "true");

        Session session = Session.getInstance(properties, new javax.mail.Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(SENDER_EMAIL, SENDER_PASSWORD);
            }
        });

        String subject = "Your OTP Code";
        String body = "Your OTP code is: " + otp;

        Message message = new MimeMessage(session);
        message.setFrom(new InternetAddress(SENDER_EMAIL));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipientEmail));
        message.setSubject(subject);
        message.setText(body);

        try {
            Transport.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
            throw new MessagingException("Error sending email: " + e.getMessage());
        }
    }
}
