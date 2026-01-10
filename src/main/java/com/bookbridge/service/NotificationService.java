package com.bookbridge.service;

import com.bookbridge.model.*;
import com.bookbridge.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification createNotification(User user, String title, String message,
            Notification.NotificationType type) {
        Notification notification = new Notification(user, title, message, type);
        return notificationRepository.save(notification);
    }

    public Notification createNotification(User user, String title, String message, Notification.NotificationType type,
            Book book, Order order) {
        Notification notification = new Notification(user, title, message, type, book, order);
        return notificationRepository.save(notification);
    }

    public void notifySellerBookOrdered(Book book, Order order, User buyer) {
        User seller = book.getUser();
        String title = "Your Book Has Been Ordered!";
        String message = String.format(
                "Great news! Your book '%s' has been ordered by %s. " +
                        "Order #%s. Please submit your book to our nearest pickup point within 48 hours. " +
                        "You'll receive payment once the book is transferred to the buyer.",
                book.getTitle(),
                buyer.getFullName(),
                order.getOrderNumber());

        createNotification(seller, title, message, Notification.NotificationType.ORDER, book, order);
    }

    public void notifySellerBookPickedUp(Book book, Order order) {
        User seller = book.getUser();
        String title = "Book Picked Up Successfully!";
        String message = String.format(
                "Your book '%s' has been picked up from the pickup point. " +
                        "Payment of Rs. %s will be processed within 24 hours.",
                book.getTitle(),
                book.getPrice());

        createNotification(seller, title, message, Notification.NotificationType.PAYMENT, book, order);
    }

    public void notifySellerPaymentProcessed(Book book, Order order) {
        User seller = book.getUser();
        String title = "Payment Processed!";
        String message = String.format(
                "Payment of Rs. %s for your book '%s' has been processed and credited to your account.",
                book.getPrice(),
                book.getTitle());

        createNotification(seller, title, message, Notification.NotificationType.PAYMENT, book, order);
    }

    public void notifyOrgPaymentCleared(User organization, Order order) {
        String title = "Payment Cleared for Order #" + order.getOrderNumber();
        String message = String.format(
                "The platform has cleared the payment for your books in order #%s. " +
                        "The funds should be available in your account now.",
                order.getOrderNumber());
        createNotification(organization, title, message, Notification.NotificationType.PAYMENT, null, order);
    }

    public void notifyBuyerBookDelivered(Book book, Order order) {
        User buyer = order.getUser();
        String title = "Your Book Has Been Delivered!";
        String message = String.format(
                "Your order for '%s' has been delivered successfully. " +
                        "Order #%s. Enjoy your book!",
                book.getTitle(),
                order.getOrderNumber());

        createNotification(buyer, title, message, Notification.NotificationType.DELIVERY, book, order);
    }

    public void notifyBuyerOrderConfirmed(Order order) {
        User buyer = order.getUser();
        String title = "Order Confirmed!";
        String message = String.format(
                "Your order #%s has been successfully placed. " +
                        "We'll notify you once your books are ready for delivery.",
                order.getOrderNumber());

        createNotification(buyer, title, message, Notification.NotificationType.ORDER, null, order);
    }

    public void notifyBuyerOrderStatusChanged(Order order) {
        User buyer = order.getUser();
        String title = "Order Status Updated";
        String message = String.format(
                "The status of your order #%s has been updated to: %s.",
                order.getOrderNumber(),
                order.getStatus());

        createNotification(buyer, title, message, Notification.NotificationType.ORDER, null, order);
    }

    public void notifyBuyerDeliveryStatusChanged(Order order) {
        User buyer = order.getUser();
        String title = "Delivery Status Updated";
        String message = String.format(
                "The delivery status of your order #%s has been updated to: %s.",
                order.getOrderNumber(),
                order.getDeliveryStatus());

        createNotification(buyer, title, message, Notification.NotificationType.DELIVERY, null, order);
    }

    @Autowired
    private UserService userService;

    public void notifyAdminOrderPickupConfirmed(Order order, User organization) {
        System.out.println("DEBUG: notifyAdminOrderPickupConfirmed called for order " + order.getOrderNumber());
        List<User> admins = userService.getUsersByType(User.UserType.ADMIN);
        System.out.println("DEBUG: Found " + admins.size() + " admin users.");

        String location = organization != null ? organization.getLocation() : "Unknown";
        String title = "Pickup Confirmed";
        String message = String.format(
                "the pickup has been confirmed please come for the pickup address: %s (Order #%s)",
                location,
                order.getOrderNumber());

        for (User admin : admins) {
            System.out.println(
                    "DEBUG: Sending notification to admin: " + admin.getEmail() + " (ID: " + admin.getId() + ")");
            createNotification(admin, title, message, Notification.NotificationType.ORDER, null, order);
        }
    }

    public void notifyAdminOrderPickupCancelled(Order order, User organization) {
        System.out.println("DEBUG: notifyAdminOrderPickupCancelled called for order " + order.getOrderNumber());
        List<User> admins = userService.getUsersByType(User.UserType.ADMIN);

        String location = organization != null ? organization.getLocation() : "Unknown";
        String title = "Pickup Cancelled";
        String message = String.format(
                "the order pickup has been canceled for address: %s (Order #%s)",
                location,
                order.getOrderNumber());

        for (User admin : admins) {
            createNotification(admin, title, message, Notification.NotificationType.ORDER, null, order);
        }
    }

    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Page<Notification> getUserNotificationsPaged(User user, Pageable pageable) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }

    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(user, false);
    }

    public Long getUnreadNotificationCount(User user) {
        return notificationRepository.countUnreadNotificationsByUser(user);
    }

    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notification.markAsRead();
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(User user) {
        List<Notification> unreadNotifications = getUnreadNotifications(user);
        for (Notification notification : unreadNotifications) {
            notification.markAsRead();
        }
        notificationRepository.saveAll(unreadNotifications);
    }

    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    public void deleteAllNotifications(User user) {
        notificationRepository.deleteByUser(user);
    }
}