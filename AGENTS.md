# Architecture rules
- Validate every applicable checklist step and cabinet before submission; progress percentages are not a substitute for required-field validation.
- Removing a photo from a form only removes its draft reference; never delete shared storage evidence before a report edit is committed.
- Persist the report editing target alongside the checklist draft so reloads cannot turn an edit into a new report.
- Report lists, dashboard data and exports must paginate within the API row cap, with a stable ID tie-breaker and no silent page-count cutoff, so totals include all authorized records.
- EPS monitoring uses server-validated opaque sessions and service-role-only access logs, independently of platform Auth; shared passwords must never reach client source or storage.
- Reuse the monitoring renderer with a configurable relay URL for both entry paths so navigation, nested frames and refresh behavior stay consistent.