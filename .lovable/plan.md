
## Fix: Lightbox Photo Controls Not Working in Auditoria OS

### Problem
When viewing photos from the Auditoria OS detail modal, the Lightbox controls (zoom in, zoom out, rotate, close) do not respond to clicks. This happens because:

- The `AuditoriaDetailModal` uses a Radix `Dialog`, which renders its content via a **React portal** attached to `document.body`
- The `Lightbox` is a simple `fixed` div rendered as a sibling to the Dialog in JSX, but without a portal -- so it ends up **behind** the Dialog's portal layer in the DOM
- Even though the Lightbox has `z-index: 100`, the Dialog portal's stacking context blocks pointer events from reaching it

### Solution
Wrap the Lightbox component's output in a **React portal** (`ReactDOM.createPortal`) to `document.body`, ensuring it renders at the top of the DOM tree, above the Radix Dialog portal.

### Changes

**File: `src/components/ui/lightbox.tsx`**
- Import `createPortal` from `react-dom`
- Wrap the entire Lightbox render output in `createPortal(..., document.body)`
- This ensures the Lightbox always sits above any Radix Dialog overlay, regardless of where it's used

This is a single-file, minimal change that fixes the issue globally for all usages of the Lightbox component.
