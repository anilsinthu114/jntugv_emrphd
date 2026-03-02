## Packages
framer-motion | Page transitions and high-quality glassmorphism animations
date-fns | Human-readable date formatting for the admin dashboard
lucide-react | Beautiful, consistent icons for the UI
clsx | Utility for conditional CSS classes
tailwind-merge | Utility for merging tailwind classes

## Notes
- The application uses a strictly dark-themed glassmorphism aesthetic.
- Registration submits `multipart/form-data` to `/api/users/register` because of file uploads (fee receipt, registration details).
- Admin routes are protected. `/api/auth/admin/login` returns a JWT token which is stored in `localStorage` as `adminToken`.
- API calls to `/api/users` and `/api/users/export` require the `Authorization: Bearer <token>` header.
- The export endpoint `/api/users/export` returns a Blob (e.g., Excel file) which is handled client-side for downloading.
