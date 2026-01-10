package com.bookbridge.config;

import com.bookbridge.model.Book;
import com.bookbridge.model.User;
import com.bookbridge.repository.BookRepository;
import com.bookbridge.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, BookRepository bookRepository,
            BCryptPasswordEncoder passwordEncoder) {
        return args -> {
            // Check if data already exists
            if (userRepository.count() > 0) {
                System.out.println("Database already has data, skipping initialization");
                return;
            }

            System.out.println("Initializing database with sample data...");

            // Create admin user
            User admin = new User();
            admin.setFullName("Admin User");
            admin.setEmail("admin@bookbridge.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setUserType(User.UserType.ADMIN);
            admin.setStatus(User.UserStatus.ACTIVE);
            admin.setIsVerified(true);
            admin.setCreatedAt(LocalDateTime.now());
            admin = userRepository.save(admin);
            System.out.println("Created admin user: admin@bookbridge.com / admin123");

            // Create individual user
            User user1 = new User();
            user1.setFullName("John Doe");
            user1.setEmail("john@example.com");
            user1.setPassword(passwordEncoder.encode("password123"));
            user1.setUserType(User.UserType.INDIVIDUAL);
            user1.setStatus(User.UserStatus.ACTIVE);
            user1.setIsVerified(true);
            user1.setLocation("Kathmandu");
            user1.setPhone("9841234567");
            user1.setCreatedAt(LocalDateTime.now());
            user1 = userRepository.save(user1);
            System.out.println("Created user: john@example.com / password123");

            // Create sample products
            createBook(bookRepository, user1, "Cozy Baby Blanket", "Lunasu Crochet",
                    "Handcrafted soft wool blanket for babies", Book.BookCategory.BLANKET,
                    Book.BookCondition.EXCELLENT, Book.ListingType.SELL, new BigDecimal("1200.00"), "Kathmandu");

            createBook(bookRepository, user1, "Rose Crochet Bouquet", "Lunasu Crochet",
                    "Everlasting red roses bouquet", Book.BookCategory.BOUQUET,
                    Book.BookCondition.EXCELLENT, Book.ListingType.SELL, new BigDecimal("850.00"), "Lalitpur");

            createBook(bookRepository, user1, "Sunflowers Set", "Lunasu Crochet",
                    "Beautiful sunflowers for home decor", Book.BookCategory.FLOWERS,
                    Book.BookCondition.NEW, Book.ListingType.SELL, new BigDecimal("450.00"), "Bhaktapur");

            createBook(bookRepository, admin, "Cute Bunny Amigurumi", "Lunasu Crochet",
                    "Adorable handmade stuffed bunny", Book.BookCategory.AMIGURUMI,
                    Book.BookCondition.EXCELLENT, Book.ListingType.SELL, new BigDecimal("600.00"), "Kathmandu");

            createBook(bookRepository, admin, "Heart Pattern Keyring", "Lunasu Crochet",
                    "Small heart keyring for gifts", Book.BookCategory.KEYRINGS,
                    Book.BookCondition.NEW, Book.ListingType.SELL, new BigDecimal("150.00"), "Pokhara");

            createBook(bookRepository, user1, "Summer Crochet Dress", "Lunasu Crochet",
                    "Stylish handmade dress for summer", Book.BookCategory.DRESS,
                    Book.BookCondition.EXCELLENT, Book.ListingType.SELL, new BigDecimal("2500.00"), "Kathmandu");

            createBook(bookRepository, admin, "Custom Keyring Set", "Lunasu Crochet",
                    "Set of 3 personalized keyrings", Book.BookCategory.KEYRINGS,
                    Book.BookCondition.NEW, Book.ListingType.SELL, new BigDecimal("400.00"), "Lalitpur");

            createBook(bookRepository, user1, "Flower Pot Decor", "Lunasu Crochet",
                    "Mini crochet flowers in a pot", Book.BookCategory.FLOWERS,
                    Book.BookCondition.EXCELLENT, Book.ListingType.SELL, new BigDecimal("350.00"), "Kathmandu");

            System.out.println("Database initialization complete! Created 8 sample books.");
        };
    }

    private void createBook(BookRepository bookRepository, User user, String title, String author,
            String description, Book.BookCategory category, Book.BookCondition condition,
            Book.ListingType listingType, BigDecimal price, String location) {
        Book book = new Book();
        book.setTitle(title);
        book.setAuthor(author);
        book.setDescription(description);
        book.setCategory(category);
        book.setCondition(condition);
        book.setListingType(listingType);
        book.setPrice(price);
        book.setLocation(location);
        book.setUser(user);
        book.setStatus(Book.BookStatus.AVAILABLE);
        book.setCreatedAt(LocalDateTime.now());
        book.setViewCount(0);
        book.setInterestCount(0);
        // Use placehold.co for reliable placeholder images
        book.setBookImage("https://placehold.co/200x300/1a1a2e/eee?text=" + title.replace(" ", "+"));
        bookRepository.save(book);
    }
}
