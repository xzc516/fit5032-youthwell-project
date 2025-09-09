# YouthWell – Youth Mental Health & Wellbeing Web App

YouthWell is a Vue 3 web application that supports youth mental health through a community forum and resources map. It demonstrates modern Vue 3 practices, responsive UI, form validations, dynamic data flow, basic authentication, role-based access control, and essential security hygiene.

## Tech Stack
- Vue 3 (Composition API, `<script setup>`)
- Vite 7
- Vue Router 4
- Pinia (state management)
- Bootstrap 5 (CDN) + small custom CSS
- Local Storage (client persistence)

## Key Features
- Authentication: Login/Register, persisted to localStorage
- Role-based access: `user` and `admin`, route guards with per-route roles
- Forum: create posts, star rating with aggregated average per post, detail modal
- Validations: required, min/max length, username format, password complexity, numeric range
- Dynamic data: posts rendered from reactive state, ratings aggregated per user, persisted & restored
- Responsive UI: optimized for <576px, 576–768px, 992–1200px, >1400px
- Security basics: input sanitization (XSS), demo-grade password hashing

## Project Structure (high level)
```
src/
  App.vue                # Navbar, auth status, layout container
  main.js                # App bootstrap
  router/index.js        # Routes + guards (requiresAuth, roles)
  stores/auth.js         # Auth store (Pinia), persistence, basic sanitization
  views/
    ForumView.vue        # Post form + list + rating + detail modal
    MapView.vue          # Resource map placeholder + filters UI
    LoginView.vue        # Login form
    RegisterView.vue     # Register form (role selectable)
```

## Getting Started
```bash
npm install
npm run dev
```
Open the printed local URL in your browser.

## Default Accounts
- Admin (seeded): `admin` / `admin123`
- You can register additional users (role: user/admin)

## Routes
- `/login` – login page
- `/register` – registration page
- `/forum` – protected, forum with post creation, aggregated rating, detail modal (roles: user/admin)
- `/map` – protected, resources map placeholder (roles: admin only)

## Validations (examples)
- Title: required, 3–50 chars
- Content: required, min 10 chars
- Rating: numeric 1–5

Feedback uses Bootstrap validation styles with inline messages.

## Dynamic Data & Persistence
- Posts live in a reactive Pinia/Vue state and are rendered with `v-for`
- Changes (create/rate) are watched and saved to localStorage
- On app load, posts are restored from localStorage if present

## Responsiveness
Built with Bootstrap grid and utilities. Tested across breakpoints:
- <576px (phones)
- 576–768px (small tablets)
- 992–1200px (laptops)
- >1400px (large screens)

## Security Notes
- Basic input sanitization to mitigate XSS in usernames/content
- Demo-grade password hashing (educational). For production use Web Crypto / server-side auth

## Scripts
```bash
npm run dev       # start dev server
npm run build     # production build
npm run preview   # preview production build
npm run lint      # eslint with --fix
npm run format    # prettier format src/
```

## License
For academic use (FIT5032 Assignment). Adjust as needed.
