package com.bookbridge.service;

import com.bookbridge.model.ContactMessage;
import com.bookbridge.repository.ContactMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContactMessageService {

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    public ContactMessage saveMessage(ContactMessage message) {
        return contactMessageRepository.save(message);
    }

    public List<ContactMessage> getAllMessages() {
        return contactMessageRepository.findAllByOrderByCreatedAtDesc();
    }

    public long getUnreadMessageCount() {
        return contactMessageRepository.countByIsReadFalse();
    }

    public void markAllAsRead() {
        List<ContactMessage> messages = contactMessageRepository.findAll();
        messages.forEach(msg -> msg.setRead(true));
        contactMessageRepository.saveAll(messages);
    }
}
