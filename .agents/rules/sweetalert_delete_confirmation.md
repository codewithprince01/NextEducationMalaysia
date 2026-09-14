# Rule: SweetAlert2 Confirmation on Delete Operations

## Guideline
Every single delete action across all modules in the Admin Dashboard (`admin-app`) MUST use **SweetAlert2** (`confirmDelete()` from `@/lib/swal`) to prompt for user confirmation.

## Mandatory Implementation Pattern
1. **Never use standard browser `window.confirm()` or `confirm()`**.
2. Always import `confirmDelete` from `@/lib/swal`:
   ```typescript
   import { confirmDelete } from '@/lib/swal';
   ```
3. Use the async `confirmDelete(title, text)` pattern inside `handleDelete`:
   ```typescript
   const handleDelete = async (id: number, itemTitle: string) => {
     const isConfirmed = await confirmDelete(
       'Delete Item Title?',
       `Are you sure you want to delete "${itemTitle}"? This action cannot be undone.`
     );
     if (!isConfirmed) return;

     // Proceed with API call...
   };
   ```
4. Confirm button must be colored rose-600 (`#e11d48`) with warning icon.
