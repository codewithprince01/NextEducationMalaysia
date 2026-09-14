# Rule: Automatic Position / Display Order Increment

Whenever creating or initializing an item in a module or sub-module with a `position` or `display position order` field:
1. **Default Position Calculation**:
   - For new entries, the `position` field MUST default to the next sequential number based on the current count of items in that module or category (`items.length + 1`).
   - When fetching or switching items/categories in a form, automatically update the default `position` to `count + 1` if the user is in Add mode (not editing an existing record).
2. **On Reset / Clear**:
   - When resetting the form or switching active categories/tabs, set `position` to `current_items.length + 1`.
