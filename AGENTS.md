# Architecture rules
- Report lists, dashboard data and exports must paginate within the API row cap, with a stable ID tie-breaker and no silent page-count cutoff, so totals include all authorized records.
- EPS monitoring uses server-validated opaque sessions and service-role-only access logs, independently of platform Auth; shared passwords must never reach client source or storage.
- Reuse the monitoring renderer with a configurable relay URL for both entry paths so navigation, nested frames and refresh behavior stay consistent.