# YelloCaps Frontend

## Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   └── admin-panel/  # Admin components
│   ├── context/          # React contexts
│   ├── pages/            # Page components
│   ├── worker/           # Worker-specific components
│   ├── App.jsx           # Root component
│   └── main.jsx          # Entry point
├── public/              # Static assets
└── index.html
```

## Key Components

- **SocketContext**: Real-time notifications
- **CartContext**: Shopping cart state
- **ProtectedRoute**: Route guards

## Adding New Page

1. Create component in `src/pages/`
2. Add route in `App.jsx`
3. Update navigation if needed
