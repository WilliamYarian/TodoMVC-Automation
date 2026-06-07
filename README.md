# TodoMVC Automation

Playwright test suite for the React implementation of TodoMVC.

## Description

17 test cases covering:
- Creating todos
- Editing and deleting todos
- Marking todos complete/incomplete
- Filtering by All, Active, and Completed
- Clearing completed todos
- Edge cases: whitespace input, Escape to cancel edit, toggle-all, item counter, edit-to-delete, trim whitespace

## Installation

```bash
npm install
npx playwright install
```

## Running the Tests

```bash
npx playwright test
```

## Tech Stack

- [Playwright](https://playwright.dev/)
- Node.js
- React TodoMVC

## Author

William Yarian
