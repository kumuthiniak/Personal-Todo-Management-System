package com.example.todo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
public class Todo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String todoItem;
    private String completed;

    // New fields
    private String priority;  // High, Medium, Low
    private String category;  // Work, Personal, Health, etc.
    private LocalDate dueDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // REQUIRED: No-argument constructor for JPA
    public Todo() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor for creating new todos
    public Todo(String todoItem, String completed) {
        this();
        this.todoItem = todoItem;
        this.completed = completed;
        this.priority = "Medium";   // Default priority
        this.category = "General";  // Default category
    }

    // Full constructor
    public Todo(String todoItem, String completed, String priority, String category,
                LocalDate dueDate, String notes) {
        this();
        this.todoItem = todoItem;
        this.completed = completed;
        this.priority = priority;
        this.category = category;
        this.dueDate = dueDate;
        this.notes = notes;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTodoItem() {
        return todoItem;
    }

    public void setTodoItem(String todoItem) {
        this.todoItem = todoItem;
        this.updatedAt = LocalDateTime.now();
    }

    public String getCompleted() {
        return completed;
    }

    public void setCompleted(String completed) {
        this.completed = completed;
        this.updatedAt = LocalDateTime.now();
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
        this.updatedAt = LocalDateTime.now();
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
        this.updatedAt = LocalDateTime.now();
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "Todo{" +
                "id=" + id +
                ", todoItem='" + todoItem + '\'' +
                ", completed='" + completed + '\'' +
                ", priority='" + priority + '\'' +
                ", category='" + category + '\'' +
                ", dueDate=" + dueDate +
                ", notes='" + notes + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
