# YelloCaps Backend

## Scripts

```bash
# Development (with auto-reload)
npm start

# Production
npm run prod
```

## Project Structure

```
backend/
├── controller/       # Business logic
├── model/           # MongoDB schemas
├── router/          # API routes
├── middleware/      # Auth, validation
├── utils/           # Validation schemas, helpers
├── uploads/         # File uploads
└── server.js        # Entry point
```

## Adding New Feature

1. Create model in `model/`
2. Create controller in `controller/`
3. Create routes in `router/`
4. Register routes in `server.js`
5. Add validation schema in `utils/validationSchemas.js`

## Environment Variables

See `.env.example` for required variables.
