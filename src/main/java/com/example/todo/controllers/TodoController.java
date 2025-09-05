package com.example.todo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import com.example.todo.model.Todo;
import com.example.todo.repository.TodoRepository;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Controller
public class TodoController {

    @Autowired
    TodoRepository todoRepository; // Injecting the repository to access database operations

    /**
     * Redirects the root URL "/" to the main todos page.
     */
    @GetMapping("/")
    public String home() {
        return "redirect:/todos";
    }

    /**
     * Displays the list of todos with optional search and status filtering.
     *
     * @param search Optional search term to filter todos by name.
     * @param status Optional status filter ("Yes", "No", or "all").
     * @param model  Model object to pass data to the view.
     * @return Thymeleaf template "todos".
     */
    @GetMapping("/todos")
    public String todos(@RequestParam(value = "search", required = false) String search,
                        @RequestParam(value = "status", required = false) String status,
                        Model model) {

        // Get currently authenticated user's name
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        model.addAttribute("username", auth.getName());

        List<Todo> todos;

        // Apply search and/or status filters
        if (search != null && !search.isEmpty()) {
            if (status != null && !status.isEmpty() && !status.equals("all")) {
                todos = todoRepository.findByTodoItemContainingAndCompleted(search, status);
            } else {
                todos = todoRepository.findByTodoItemContaining(search);
            }
        } else if (status != null && !status.isEmpty() && !status.equals("all")) {
            todos = todoRepository.findByCompleted(status);
        } else {
            todos = todoRepository.findAll(); // Fetch all todos if no filter is applied
        }

        // Add todos and current filters to the model
        model.addAttribute("todos", todos);
        model.addAttribute("currentSearch", search != null ? search : "");
        model.addAttribute("currentStatus", status != null ? status : "all");

        // Add notification data (pending count, overdue todos)
        model.addAllAttributes(getNotificationData());

        return "todos";
    }

    /**
     * Handles creating a new todo item.
     *
     * @param todoItem Description of the todo.
     * @param status   Completion status ("Yes" or "No").
     * @param priority Optional priority (High, Medium, Low).
     * @param category Optional category (Work, Personal, etc.).
     * @param dueDate  Optional due date.
     * @param notes    Optional notes.
     * @param model    Model object.
     * @return Redirect to the todos page with success query param.
     */
    @PostMapping("/todoNew")
    public String add(@RequestParam String todoItem,
                      @RequestParam String status,
                      @RequestParam(required = false) String priority,
                      @RequestParam(required = false) String category,
                      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate,
                      @RequestParam(required = false) String notes,
                      Model model) {

        Todo todo = new Todo(todoItem, status);

        if (priority != null) todo.setPriority(priority);
        if (category != null) todo.setCategory(category);
        if (dueDate != null) todo.setDueDate(dueDate);
        if (notes != null) todo.setNotes(notes);

        todoRepository.save(todo); // Save the new todo
        return "redirect:/todos?success";
    }

    /**
     * Deletes a todo by its ID.
     *
     * @param id    ID of the todo to delete.
     * @param model Model object.
     * @return Redirect to the todos page with success query param.
     */
    @PostMapping("/todoDelete/{id}")
    public String delete(@PathVariable long id, Model model) {
        todoRepository.deleteById(id);
        return "redirect:/todos?success";
    }

    /**
     * Toggles the completion status of a todo item.
     *
     * @param id    ID of the todo to update.
     * @param model Model object.
     * @return Redirect to the todos page with success query param.
     */
    @PostMapping("/todoUpdate/{id}")
    public String update(@PathVariable long id, Model model) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        // Toggle completion status
        if ("Yes".equals(todo.getCompleted())) {
            todo.setCompleted("No");
        } else {
            todo.setCompleted("Yes");
        }

        todoRepository.save(todo);
        return "redirect:/todos?success";
    }

    /**
     * Provides notification data for all views:
     * - Count of pending todos
     * - List of overdue todos
     *
     * @return Map with keys "pendingCount" and "overdueTodos".
     */
    @ModelAttribute("notificationData")
    public Map<String, Object> getNotificationData() {
        Map<String, Object> notificationData = new HashMap<>();

        List<Todo> todos = todoRepository.findAll();

        // Count of pending todos (completed = "No")
        long pendingCount = todos.stream()
                .filter(todo -> "No".equals(todo.getCompleted()))
                .count();
        notificationData.put("pendingCount", pendingCount);

        // List of overdue todos (not completed and dueDate is before today)
        List<Todo> overdueTodos = todos.stream()
                .filter(todo -> "No".equals(todo.getCompleted()))
                .filter(todo -> todo.getDueDate() != null)
                .filter(todo -> todo.getDueDate().isBefore(LocalDate.now()))
                .collect(Collectors.toList());
        notificationData.put("overdueTodos", overdueTodos);

        return notificationData;
    }
}
