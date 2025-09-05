package com.example.todo.service;

import org.springframework.stereotype.Service;

import com.example.todo.model.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public void initiatePasswordReset(String email) {
        User user = userService.findByEmail(email);
        if (user != null) {
            String resetToken = UUID.randomUUID().toString();
            user.setResetToken(resetToken);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
            userService.saveUser(user);
            
            sendResetEmail(user.getEmail(), resetToken);
        }
    }
    
    public boolean validateResetToken(String token) {
        User user = userService.findByResetToken(token);
        return user != null && user.getResetTokenExpiry() != null && 
               user.getResetTokenExpiry().isAfter(LocalDateTime.now());
    }
    
    public void resetPassword(String token, String newPassword) {
        User user = userService.findByResetToken(token);
        if (user != null && user.getResetTokenExpiry() != null && 
            user.getResetTokenExpiry().isAfter(LocalDateTime.now())) {
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userService.saveUser(user);
        } else {
            throw new RuntimeException("Invalid or expired reset token");
        }
    }
    
    private void sendResetEmail(String email, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Password Reset Request");
        message.setText("To reset your password, click the link below:\n\n"
                + "http://localhost:8080/reset-password?token=" + token + "\n\n"
                + "This link will expire in 1 hour.");
        
        mailSender.send(message);
    }
}