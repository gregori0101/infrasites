

# Fix: Technician Dropdown Not Populating

## Problem
The technician select dropdown shows no options because of a response field name mismatch. The `get-technician-emails` edge function returns `{ technicians: [...] }`, but the `AuditoriaCreateDialog.tsx` and `AuditoriaGestorView.tsx` components read `data.emails` instead of `data.technicians`.

## Solution
Update both components to read `data.technicians` instead of `data.emails`.

## Technical Changes

### 1. `src/components/auditoria/AuditoriaCreateDialog.tsx` (line 43-44)
- Change `data?.emails` to `data?.technicians`
- Change `data.emails.map(...)` to `data.technicians.map(...)`

### 2. `src/components/auditoria/AuditoriaGestorView.tsx` (line ~42-44)
- Change `fnData?.emails` to `fnData?.technicians`
- Change `fnData.emails.forEach(...)` to `fnData.technicians.forEach(...)`

No database or edge function changes needed -- the backend is correct, only the frontend references the wrong property name.
