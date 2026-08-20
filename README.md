# OpenJio

A static, mobile-first group-buying prototype for household essentials.

## Features
- Browse active community group buys
- See retail price, group price and savings
- Track progress towards supplier quantity targets
- Add products and quantities to a basket
- Choose a community collection hub
- Create a reservation and collection code
- View reservations
- Use a simple admin dashboard to mark orders as collected
- Persists prototype data in the browser with localStorage
- No backend or payment system required

## Run locally
Open `index.html` in a browser.

For the best local development experience, use a simple local server such as VS Code's Live Server extension.

## Deploy to GitHub Pages
1. Create a new GitHub repository.
2. Upload all files in this folder.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`.
6. Save.
7. GitHub will provide the public site address.

## Important
This is a prototype. Reservations are stored only in each browser's localStorage, so different users do not share orders yet. A real pilot would need a backend/database.
