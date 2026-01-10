package com.bookbridge.controller;

import com.bookbridge.model.ContactMessage;
import com.bookbridge.service.ContactMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ContactMessageController {

    @Autowired
    private ContactMessageService contactMessageService;

    @PostMapping("/contact")
    public ResponseEntity<?> submitContactMessage(@RequestBody ContactMessage message) {
        try {
            ContactMessage savedMessage = contactMessageService.saveMessage(message);
            return ResponseEntity.ok(Map.of("message", "Message sent successfully", "data", savedMessage));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to send message: " + e.getMessage()));
        }
    }

    @GetMapping("/organization/contact-messages")
    public ResponseEntity<?> getAllMessages() {
        return ResponseEntity.ok(contactMessageService.getAllMessages());
    }

    @GetMapping("/organization/contact-messages/unread-count")
    public ResponseEntity<?> getUnreadCount() {
        return ResponseEntity.ok(Map.of("count", contactMessageService.getUnreadMessageCount()));
    }

    @PutMapping("/organization/contact-messages/mark-read")
    public ResponseEntity<?> markAllAsRead() {
        contactMessageService.markAllAsRead();
        return ResponseEntity.ok(Map.of("message", "All messages marked as read"));
    }
}
