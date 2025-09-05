package com.example.todo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.todo.model.Todo;

import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {
    List<Todo> findByTodoItemContaining(String search);
    List<Todo> findByCompleted(String status);
    List<Todo> findByTodoItemContainingAndCompleted(String search, String status);
}
