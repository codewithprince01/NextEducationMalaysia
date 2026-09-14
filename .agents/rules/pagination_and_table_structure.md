# Rule: Table Pagination, Sr. No., and ID Columns

## Guideline
All data tables across the Admin Dashboard (`admin-app`) MUST adhere to the following structure:

1. **Pagination**:
   - Paginate data tables displaying **20 records per page** by default (`itemsPerPage = 20`).
   - Use the shared `<Pagination ... />` component from `@/components/common/Pagination`.
   - Reset `currentPage` to `1` whenever search or filter criteria change.
   - Show entry range (e.g. `Showing 1 to 20 of 150 entries`) and page numbers (`Prev`, `1`, `2`, `3`, `Next`).

2. **Sr. No. Column (Serial Number)**:
   - First table header must be **`Sr. No.`**.
   - Calculate serial number for current page: `(currentPage - 1) * itemsPerPage + index + 1`.

3. **ID Column**:
   - Second table header must be **`ID`** (displaying database primary key e.g., `#17`).
