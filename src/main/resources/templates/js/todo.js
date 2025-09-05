// Sample data for demonstration
let todos = [
    { id: 1, todoItem: "Complete project proposal", priority: "High", category: "Work", dueDate: "2023-12-15", completed: "No", notes: "Send to manager for review" },
    { id: 2, todoItem: "Buy groceries", priority: "Medium", category: "Shopping", dueDate: "2023-12-10", completed: "No", notes: "Milk, eggs, bread, fruits" },
    { id: 3, todoItem: "Schedule doctor appointment", priority: "Medium", category: "Health", dueDate: "2023-12-05", completed: "Yes", notes: "Annual checkup" },
    { id: 4, todoItem: "Call mom", priority: "Low", category: "Personal", dueDate: "2023-12-20", completed: "No", notes: "Ask about Christmas plans" },
    { id: 5, todoItem: "Finish reading book", priority: "Low", category: "Personal", dueDate: "2023-12-25", completed: "No", notes: "Only 3 chapters left" }
];

let nextId = 6;

// Initialize date pickers
document.addEventListener('DOMContentLoaded', function() {
    // Due date in add modal
    flatpickr("#dueDate", {
        dateFormat: "Y-m-d",
        minDate: "today"
    });
    
    // Due date filter
    flatpickr("#dueDateFilter", {
        dateFormat: "Y-m-d",
        mode: "range",
        onChange: function(selectedDates, dateStr, instance) {
            filterTodos();
        }
    });
    
    // Initialize popovers
    $('[data-toggle="popover"]').popover({
        trigger: 'hover',
        placement: 'top'
    });
    
    // Render initial todos
    renderTodos();
    
    // Initialize notifications
    initNotifications();
});

// Render todos to the table
function renderTodos() {
    const tbody = document.getElementById('todoTableBody');
    tbody.innerHTML = '';
    
    if (todos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No todos found. Add your first todo!</td></tr>';
        document.getElementById('todoCount').textContent = '0 items';
        return;
    }
    
    todos.forEach(todo => {
        const row = document.createElement('tr');
        const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const isOverdue = dueDate && dueDate < today && todo.completed === 'No';
        
        row.setAttribute('data-todo-item', todo.todoItem);
        row.setAttribute('data-status', todo.completed);
        row.setAttribute('data-priority', todo.priority);
        row.setAttribute('data-category', todo.category);
        row.setAttribute('data-due-date', todo.dueDate);
        row.setAttribute('data-notes', todo.notes);
        
        if (todo.completed === 'Yes') {
            row.classList.add('table-success');
        }
        
        let dueDateText = '';
        if (dueDate) {
            dueDateText = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        
        row.innerHTML = `
            <th scope="row">${todo.id}</th>
            <td class="todo-item">${todo.todoItem} ${todo.notes ? '<span class="notes-popover" data-toggle="popover" data-content="' + todo.notes + '" title="Notes">📝</span>' : ''}</td>
            <td>
                <span class="badge ${todo.priority === 'High' ? 'badge-danger' : todo.priority === 'Medium' ? 'badge-warning' : 'badge-success'}">${todo.priority}</span>
            </td>
            <td>
                ${todo.category ? `<span class="badge badge-info category-badge">${todo.category}</span>` : ''}
            </td>
            <td>
                ${dueDate ? `<span class="due-date ${isOverdue ? 'overdue' : ''}">${dueDateText}</span>` : ''}
            </td>
            <td>
                <span class="badge ${todo.completed === 'Yes' ? 'badge-success' : 'badge-warning'}">${todo.completed === 'Yes' ? 'Completed' : 'Pending'}</span>
            </td>
            <td class="no-print action-buttons">
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-outline-primary btn-sm" onclick="toggleTodoStatus(${todo.id})">
                        ${todo.completed === 'No' ? 'Mark Complete' : 'Mark Incomplete'}
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-sm" onclick="deleteTodo(${todo.id})">
                        Delete
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    document.getElementById('todoCount').textContent = todos.length + ' items';
    
    // Update notifications
    updatePendingCount();
    checkForOverdueTodos();
}

// Add a new todo
function addNewTodo() {
    const todoItem = document.getElementById('todoItem').value;
    const priority = document.getElementById('priority').value;
    const category = document.getElementById('category').value;
    const dueDate = document.getElementById('dueDate').value;
    const notes = document.getElementById('notes').value;
    const status = document.getElementById('status').value;
    
    if (!todoItem) {
        showCustomNotification('error', 'Validation Error', 'Todo item is required!');
        return;
    }
    
    const newTodo = {
        id: nextId++,
        todoItem,
        priority,
        category,
        dueDate,
        completed: status,
        notes
    };
    
    todos.push(newTodo);
    renderTodos();
    
    // Show success message
    showCustomNotification('success', 'Success', 'Todo added successfully!');
    
    // Close modal
    $('#addTodoModal').modal('hide');
    
    // Reset form
    document.getElementById('addTodoForm').reset();
}

// Toggle todo status
function toggleTodoStatus(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = todo.completed === 'Yes' ? 'No' : 'Yes';
        renderTodos();
        
        showCustomNotification('success', 'Status Updated', `Todo marked as ${todo.completed === 'Yes' ? 'completed' : 'pending'}`);
    }
}

// Delete a todo
function deleteTodo(id) {
    if (confirm('Are you sure you want to delete this todo?')) {
        todos = todos.filter(t => t.id !== id);
        renderTodos();
        
        showCustomNotification('success', 'Deleted', 'Todo deleted successfully!');
    }
}

// Filter todos
function filterTodos() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const dueDateFilter = document.getElementById('dueDateFilter').value;
    const overdueFilter = document.getElementById('overdueFilter').checked;
    
    const rows = document.querySelectorAll('#todoTableBody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        if (row.cells.length === 1) return; // Skip the "no todos" row
        
        const todoItem = row.getAttribute('data-todo-item').toLowerCase();
        const status = row.getAttribute('data-status');
        const priority = row.getAttribute('data-priority');
        const category = row.getAttribute('data-category');
        const dueDate = row.getAttribute('data-due-date');
        
        let matchesSearch = searchText === '' || todoItem.includes(searchText);
        let matchesStatus = statusFilter === 'all' || status === statusFilter;
        let matchesPriority = priorityFilter === 'all' || priority === priorityFilter;
        let matchesCategory = categoryFilter === 'all' || category === categoryFilter;
        let matchesDueDate = dueDateFilter === '' || dueDateMatchesFilter(dueDate, dueDateFilter);
        let matchesOverdue = !overdueFilter || isOverdue(dueDate, status);
        
        if (matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesDueDate && matchesOverdue) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update the todo count
    document.getElementById('todoCount').textContent = visibleCount + ' items';
}

// Clear filters
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('priorityFilter').value = 'all';
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('dueDateFilter').value = '';
    document.getElementById('overdueFilter').checked = false;
    
    filterTodos();
}

// Show alert
function showAlert(type, message) {
    const alert = type === 'success' ? document.getElementById('successAlert') : document.getElementById('errorAlert');
    alert.querySelector('.alert-message').textContent = message;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 3000);
}

// Update the print date
function updatePrintDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('printDate').textContent = now.toLocaleDateString('en-US', options);
}

// Print function
function printTodos() {
    updatePrintDate();
    window.print();
}

// Check if due date matches the filter
function dueDateMatchesFilter(dueDate, filterValue) {
    if (!dueDate || dueDate === 'null') return false;
    
    try {
        const dates = filterValue.split(' to ');
        const dueDateObj = new Date(dueDate);
        
        if (dates.length === 1) {
            // Single date
            const filterDate = new Date(dates[0]);
            return dueDateObj.toDateString() === filterDate.toDateString();
        } else if (dates.length === 2) {
            // Date range
            const startDate = new Date(dates[0]);
            const endDate = new Date(dates[1]);
            endDate.setHours(23, 59, 59, 999); // End of the day
            return dueDateObj >= startDate && dueDateObj <= endDate;
        }
    } catch (e) {
        console.error('Error parsing dates:', e);
    }
    
    return false;
}

// Check if a todo is overdue
function isOverdue(dueDate, status) {
    if (status === 'Yes' || !dueDate || dueDate === 'null') return false;
    
    try {
        const dueDateObj = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return dueDateObj < today;
    } catch (e) {
        console.error('Error checking overdue:', e);
        return false;
    }
}

// Custom notification function
function showCustomNotification(type, title, message) {
    const notificationContainer = document.getElementById('customNotifications');
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    
    // Set icon based on type
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    
    notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <p class="notification-message">${message}</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.classList.add('hide'); setTimeout(() => { this.parentElement.remove() }, 300);">×</button>
    `;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Check for overdue todos periodically
function checkForOverdueTodos() {
    const now = new Date();
    
    todos.forEach(todo => {
        const dueDateStr = todo.dueDate;
        const status = todo.completed;
        const todoItem = todo.todoItem;
        
        if (status === 'No' && dueDateStr) {
            try {
                const dueDate = new Date(dueDateStr);
                if (dueDate < now) {
                    // This todo is overdue
                    const formattedDate = dueDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                    });
                    
                    showCustomNotification(
                        'warning',
                        'Overdue Todo',
                        `"${todoItem}" was due on ${formattedDate}`
                    );
                }
            } catch (e) {
                console.error('Error parsing date:', e);
            }
        }
    });
}

// Update pending count
function updatePendingCount() {
    const pendingCount = todos.filter(todo => todo.completed === 'No').length;
    document.getElementById('pendingCount').textContent = pendingCount;
    
    // Update the badge in the card header too
    document.getElementById('todoCount').textContent = `${pendingCount} pending, ${todos.length} total`;
}

// Initialize notifications
function initNotifications() {
    // Update pending count on page load
    updatePendingCount();
    
    // Check for overdue todos every minute
    checkForOverdueTodos();
    setInterval(checkForOverdueTodos, 60000);
}

// Add event listener for beforeprint to update the date
window.addEventListener('beforeprint', updatePrintDate);