const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:8081');
});

// TC-001: Create a todo
test('should create a new todo item', async ({ page }) => {
  const input = page.locator('.new-todo');
  
  await input.fill('Buy coffee');
  await input.press('Enter');
  
  const todoItem = page.locator('.todo-list li');
  await expect(todoItem).toHaveCount(1);
  await expect(todoItem).toContainText('Buy coffee');
  await expect(input).toHaveValue('');
});

// TC-002: Edit a todo
test('should edit an existing todo item', async ({ page }) => {
  // First create a todo
  await page.locator('.new-todo').fill('Buy coffee');
  await page.locator('.new-todo').press('Enter');
  
  // Double click to edit
  await page.locator('.todo-list li label').dblclick();
  
  // Clear and type new text
  const editInput = page.locator('.todo-list li .edit');
  await editInput.fill('Buy tea');
  await editInput.press('Enter');
  
  // Verify updated text
  await expect(page.locator('.todo-list li label')).toContainText('Buy tea');
});

// TC-003: Delete a todo
test('should delete a todo item', async ({ page }) => {
  // Create a todo first
  await page.locator('.new-todo').fill('Buy coffee');
  await page.locator('.new-todo').press('Enter');
  
  // Hover to reveal delete button
  await page.locator('.todo-list li').hover();
  
  // Click delete button
  await page.locator('.todo-list li .destroy').click();
  
  // Verify todo is gone
  await expect(page.locator('.todo-list li')).toHaveCount(0);
});

// TC-004: Mark a todo as complete
test('should mark a todo as completed', async ({ page }) => {
  await page.locator('.new-todo').fill('Read a book');
  await page.locator('.new-todo').press('Enter');

  // Click the toggle checkbox
  await page.locator('.todo-list li .toggle').click();

  // Item should have the 'completed' class
  await expect(page.locator('.todo-list li')).toHaveClass(/completed/);
});

// TC-005: Unmark a completed todo (toggle back to active)
test('should unmark a completed todo back to active', async ({ page }) => {
  await page.locator('.new-todo').fill('Go for a walk');
  await page.locator('.new-todo').press('Enter');

  const toggle = page.locator('.todo-list li .toggle');

  // Mark complete then unmark
  await toggle.click();
  await toggle.click();

  // Item should no longer have 'completed' class
  await expect(page.locator('.todo-list li')).not.toHaveClass(/completed/);
});

// TC-006: Filter by Active shows only incomplete todos
test('should show only active todos when Active filter is selected', async ({ page }) => {
  await page.locator('.new-todo').fill('Active task');
  await page.locator('.new-todo').press('Enter');
  await page.locator('.new-todo').fill('Completed task');
  await page.locator('.new-todo').press('Enter');

  // Complete the second todo
  await page.locator('.todo-list li:nth-child(2) .toggle').click();

  // Click the Active filter
  await page.locator('.filters a', { hasText: 'Active' }).click();

  // Only the active todo should be visible
  const visibleItems = page.locator('.todo-list li');
  await expect(visibleItems).toHaveCount(1);
  await expect(visibleItems).toContainText('Active task');
});

// TC-007: Filter by Completed shows only completed todos
test('should show only completed todos when Completed filter is selected', async ({ page }) => {
  await page.locator('.new-todo').fill('Active task');
  await page.locator('.new-todo').press('Enter');
  await page.locator('.new-todo').fill('Completed task');
  await page.locator('.new-todo').press('Enter');

  // Complete the second todo
  await page.locator('.todo-list li:nth-child(2) .toggle').click();

  // Click the Completed filter
  await page.locator('.filters a', { hasText: 'Completed' }).click();

  // Only the completed todo should be visible
  const visibleItems = page.locator('.todo-list li');
  await expect(visibleItems).toHaveCount(1);
  await expect(visibleItems).toContainText('Completed task');
});

// TC-008: Filter by All shows every todo regardless of status
test('should show all todos when All filter is selected', async ({ page }) => {
  await page.locator('.new-todo').fill('Task one');
  await page.locator('.new-todo').press('Enter');
  await page.locator('.new-todo').fill('Task two');
  await page.locator('.new-todo').press('Enter');

  // Complete the first todo
  await page.locator('.todo-list li:nth-child(1) .toggle').click();

  // Switch to Completed then back to All
  await page.locator('.filters a', { hasText: 'Completed' }).click();
  await page.locator('.filters a', { hasText: 'All' }).click();

  // Both todos should be visible
  await expect(page.locator('.todo-list li')).toHaveCount(2);
});

// TC-009: Clear Completed button removes only completed todos
test('should clear completed todos and leave active ones intact', async ({ page }) => {
  await page.locator('.new-todo').fill('Keep me');
  await page.locator('.new-todo').press('Enter');
  await page.locator('.new-todo').fill('Delete me');
  await page.locator('.new-todo').press('Enter');

  // Complete the second todo
  await page.locator('.todo-list li:nth-child(2) .toggle').click();

  // Click Clear completed
  await page.locator('.clear-completed').click();

  // Only the active todo should remain
  const remainingItems = page.locator('.todo-list li');
  await expect(remainingItems).toHaveCount(1);
  await expect(remainingItems).toContainText('Keep me');
});

// TC-010: Clear Completed button is hidden when no todos are completed
test('should not show Clear Completed button when no todos are completed', async ({ page }) => {
  await page.locator('.new-todo').fill('Pending task');
  await page.locator('.new-todo').press('Enter');

  // Clear completed button should not be visible
  await expect(page.locator('.clear-completed')).toBeHidden();
});

// TC-011: Empty state — footer and todo list are hidden with no todos
test('should not display footer or todo list when there are no todos', async ({ page }) => {
  // On a fresh load there should be no list items
  await expect(page.locator('.todo-list li')).toHaveCount(0);

  // The footer (item count, filters) should not be visible
  await expect(page.locator('.footer')).toBeHidden();
});

// TC-012: Whitespace-only input should not create a todo
test('should not create a todo when input contains only whitespace', async ({ page }) => {
  const input = page.locator('.new-todo');

  // Enter a whitespace-only value
  await input.fill('   ');
  await input.press('Enter');

  // No todo should be created
  await expect(page.locator('.todo-list li')).toHaveCount(0);
});

// TC-013: Pressing Escape during edit should cancel and revert to original text
test('should revert to original text when Escape is pressed during edit', async ({ page }) => {
  await page.locator('.new-todo').fill('Original text');
  await page.locator('.new-todo').press('Enter');

  // Enter edit mode
  await page.locator('.todo-list li label').dblclick();

  // Type new text but cancel with Escape
  const editInput = page.locator('.todo-list li .edit');
  await editInput.fill('Abandoned edit');
  await editInput.press('Escape');

  // Label should show the original text
  await expect(page.locator('.todo-list li label')).toContainText('Original text');
});

// TC-014: Toggle-all chevron marks all todos complete; clicking again unmarks all
test('should toggle all todos complete and then back to active', async ({ page }) => {
  await page.locator('.new-todo').fill('Task one');
  await page.locator('.new-todo').press('Enter');
  await page.locator('.new-todo').fill('Task two');
  await page.locator('.new-todo').press('Enter');

  const toggleAll = page.locator('.toggle-all');

  // Mark all complete
  await toggleAll.click();
  const allItems = page.locator('.todo-list li');
  await expect(allItems.nth(0)).toHaveClass(/completed/);
  await expect(allItems.nth(1)).toHaveClass(/completed/);

  // Unmark all
  await toggleAll.click();
  await expect(allItems.nth(0)).not.toHaveClass(/completed/);
  await expect(allItems.nth(1)).not.toHaveClass(/completed/);
});

// TC-015: Item counter shows correct singular and plural wording
test('should display correct singular and plural item count', async ({ page }) => {
  // Add first todo — expect singular
  await page.locator('.new-todo').fill('First task');
  await page.locator('.new-todo').press('Enter');
  await expect(page.locator('.todo-count')).toContainText('1 item left');

  // Add second todo — expect plural
  await page.locator('.new-todo').fill('Second task');
  await page.locator('.new-todo').press('Enter');
  await expect(page.locator('.todo-count')).toContainText('2 items left');
});

// TC-016: Editing a todo to an empty string should delete it
test('should delete a todo when edited to an empty string', async ({ page }) => {
  await page.locator('.new-todo').fill('To be erased');
  await page.locator('.new-todo').press('Enter');

  // Enter edit mode and clear the text
  await page.locator('.todo-list li label').dblclick();
  const editInput = page.locator('.todo-list li .edit');
  await editInput.fill('');
  await editInput.press('Enter');

  // Todo should be removed from the list
  await expect(page.locator('.todo-list li')).toHaveCount(0);
});

// TC-017: Adding a todo with leading/trailing whitespace should trim it on save
test('should trim leading and trailing whitespace from a new todo', async ({ page }) => {
  const input = page.locator('.new-todo');

  await input.fill('  Trimmed todo  ');
  await input.press('Enter');

  // Label text should be trimmed
  await expect(page.locator('.todo-list li label')).toContainText('Trimmed todo');
});

// TC-018: Double-clicking a todo label should enter edit mode
test('should enter edit mode when a todo label is double-clicked', async ({ page }) => {
  await page.locator('.new-todo').fill('Editable todo');
  await page.locator('.new-todo').press('Enter');

  // Double-click the label
  await page.locator('.todo-list li label').dblclick();

  // The list item should have the 'editing' class and the edit input should be visible
  await expect(page.locator('.todo-list li')).toHaveClass(/editing/);
  await expect(page.locator('.todo-list li .edit')).toBeVisible();
});

// TC-019: Adding multiple todos should update the item count correctly after each addition
test('should update item count correctly as multiple todos are added', async ({ page }) => {
  const todoCount = page.locator('.todo-count');

  await page.locator('.new-todo').fill('Todo one');
  await page.locator('.new-todo').press('Enter');
  await expect(todoCount).toContainText('1 item left');

  await page.locator('.new-todo').fill('Todo two');
  await page.locator('.new-todo').press('Enter');
  await expect(todoCount).toContainText('2 items left');

  await page.locator('.new-todo').fill('Todo three');
  await page.locator('.new-todo').press('Enter');
  await expect(todoCount).toContainText('3 items left');
});

// TC-020: Completing all todos individually should cause toggle-all checkbox to become checked
test('should check the toggle-all checkbox when all todos are individually completed', async ({ page }) => {
  await page.locator('.new-todo').fill('Task one');
  await page.locator('.new-todo').press('Enter');
  await page.locator('.new-todo').fill('Task two');
  await page.locator('.new-todo').press('Enter');

  // Complete each todo individually
  await page.locator('.todo-list li:nth-child(1) .toggle').click();
  await page.locator('.todo-list li:nth-child(2) .toggle').click();

  // Toggle-all checkbox should now be checked
  await expect(page.locator('.toggle-all')).toBeChecked();
});

// TC-021: Todos are not persisted after page reload (no localStorage support)
test('should not persist todos after page reload', async ({ page }) => {
  await page.locator('.new-todo').fill('First');
  await page.locator('.new-todo').press('Enter');
  await page.locator('.new-todo').fill('Second');
  await page.locator('.new-todo').press('Enter');
  await page.locator('.new-todo').fill('Third');
  await page.locator('.new-todo').press('Enter');

  // Reload the page
  await page.reload();

  // Todos should not persist — list should be empty
  await expect(page.locator('.todo-list li')).toHaveCount(0);
});

// TC-022: Input field should be empty after a new todo is submitted
test('should clear the input field after submitting a new todo', async ({ page }) => {
  const input = page.locator('.new-todo');

  await input.fill('Clear me after submit');
  await input.press('Enter');

  // Input should be empty
  await expect(input).toHaveValue('');
});
