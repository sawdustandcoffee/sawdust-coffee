# Sawdust & Coffee Woodworking Website

A full-stack e-commerce website for Sawdust & Coffee Woodworking, a family-owned woodworking business in Wareham, Massachusetts.

## Business Information

- **Business Name:** Sawdust & Coffee Woodworking
- **Location:** Wareham, Massachusetts (Gateway to Cape Cod)
- **Phone:** 774-836-4958
- **Team:** Paul Neri, Jason Neri, Patrick Willett
- **Tagline:** "Make Cool Sh!t"

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (navigation)
- Axios (API calls)
- React Context API (Auth & Cart state management)
- react-helmet-async (SEO meta tags)
- ErrorBoundary (error handling)

### Backend
- Laravel 11
- PHP 8.3
- MySQL 8.0
- Laravel Sanctum (SPA authentication)
- Stripe PHP SDK (payment processing)

### DevOps
- Docker (MySQL container)
- Git (version control)

### Deployment Target
- Standard LAMP stack (Linux, Apache, MySQL, PHP)

## Project Structure

```
sawdust-coffee/
├── backend/                    # Laravel application
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/   # API controllers
│   │   │   ├── Middleware/    # Custom middleware
│   │   │   └── Requests/      # Form request validation
│   │   ├── Models/            # Eloquent models
│   │   └── Services/          # Business logic
│   ├── database/
│   │   ├── migrations/        # Database migrations
│   │   ├── seeders/           # Database seeders
│   │   └── factories/         # Model factories
│   ├── routes/
│   │   ├── api.php            # API routes
│   │   └── web.php            # Web routes
│   ├── tests/                 # PHPUnit tests
│   └── storage/               # File storage
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── context/           # React context providers
│   │   ├── services/          # API service functions
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Utility functions
│   └── public/                # Static assets
├── docker-compose.yml         # Docker configuration
├── FEATURES.md                # Feature checklist
├── claude-progress.txt        # Development progress log
└── README.md                  # This file
```

## Getting Started

### Prerequisites

- PHP 8.3 or higher
- Composer
- Node.js 18 or higher
- npm
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sawdust-coffee
   ```

2. **Start Docker containers (MySQL)**
   ```bash
   docker-compose up -d
   ```

3. **Backend Setup**
   ```bash
   cd backend

   # Install dependencies
   composer install

   # Copy environment file
   cp .env.example .env

   # Generate application key
   php artisan key:generate

   # Update .env with database credentials (already configured)
   # DB_CONNECTION=mysql
   # DB_HOST=127.0.0.1
   # DB_PORT=3306
   # DB_DATABASE=sawdust_coffee
   # DB_USERNAME=sawdust
   # DB_PASSWORD=sawdust_secret

   # Run migrations
   php artisan migrate

   # Seed database (when seeders are available)
   php artisan db:seed

   # Start development server
   php artisan serve
   # Backend will be available at http://localhost:8000
   ```

4. **Frontend Setup**
   ```bash
   cd frontend

   # Install dependencies
   npm install

   # Start development server
   npm run dev
   # Frontend will be available at http://localhost:5173
   ```

5. **Configure Stripe** (for payment processing)
   - Sign up for a Stripe account at https://stripe.com
   - Get your test API keys from the Stripe dashboard
   - Add them to `backend/.env`:
     ```
     STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
     STRIPE_SECRET_KEY=sk_test_your_secret_key
     STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
     ```
   - Also add the publishable key to `frontend/.env`:
     ```
     VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
     ```

### Running Tests

**Backend Tests (PHPUnit)**
```bash
cd backend
php artisan test
```

**Frontend Tests (Vitest)**
```bash
cd frontend
npm test
```

**Linting**
```bash
# Backend (Laravel Pint)
cd backend
./vendor/bin/pint

# Frontend (ESLint)
cd frontend
npm run lint
```

## Development Workflow

This project is designed for incremental development across multiple sessions. Each session should:

1. **Assess** - Read `claude-progress.txt` to understand current state
2. **Plan** - Identify the next feature from `FEATURES.md`
3. **Implement** - Build one feature at a time
4. **Verify** - Run tests and manually verify
5. **Document** - Update progress files and commit changes

### Git Workflow

```bash
# Make changes to code

# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat(products): add product CRUD API endpoints"

# Push to remote (when applicable)
git push
```

**Commit Message Format:**
- `feat(scope): description` - New feature
- `fix(scope): description` - Bug fix
- `test(scope): description` - Add tests
- `docs(scope): description` - Documentation
- `refactor(scope): description` - Code refactoring

## API Endpoints

### Authentication
- `POST /api/login` - Admin login
- `POST /api/logout` - Admin logout
- `GET /api/user` - Get authenticated user

### Products
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/{id}` - Update product (admin)
- `DELETE /api/products/{id}` - Delete product (admin)

### Gallery
- `GET /api/gallery` - List gallery items
- `GET /api/gallery/{id}` - Get single gallery item
- `POST /api/gallery` - Create gallery item (admin)
- `PUT /api/gallery/{id}` - Update gallery item (admin)
- `DELETE /api/gallery/{id}` - Delete gallery item (admin)

### Orders
- `GET /api/orders` - List orders (admin)
- `GET /api/orders/{id}` - Get order details (admin)
- `POST /api/orders` - Create order (Stripe webhook)
- `PUT /api/orders/{id}` - Update order status (admin)

### Checkout
- `POST /api/checkout/session` - Create Stripe checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks

### Forms
- `POST /api/contact` - Submit contact form
- `POST /api/quotes` - Submit quote request

### Content
- `GET /api/content` - Get site content
- `PUT /api/content/{key}` - Update content (admin)

## Environment Variables

See `backend/.env.example` for all required environment variables.

**Critical Variables:**
- `APP_KEY` - Laravel application key
- `DB_*` - Database credentials
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (frontend)

## Deployment

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
# Built files will be in frontend/dist/
```

**Backend:**
```bash
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### LAMP Stack Deployment

1. Upload files to web server
2. Point Apache document root to `backend/public/`
3. Configure `.htaccess` for Laravel
4. Set proper file permissions
5. Create MySQL database and user
6. Run migrations: `php artisan migrate --force`
7. Configure environment variables
8. Set up SSL certificate (Let's Encrypt recommended)
9. Configure Stripe webhooks to point to your domain

### Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] Initial admin user created
- [ ] Stripe webhook endpoint configured
- [ ] SSL certificate active
- [ ] File upload permissions correct
- [ ] Error logging configured
- [ ] Backups scheduled
- [ ] Performance tested
- [ ] Security headers configured

## Testing Stripe Integration

### Test Cards
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Requires auth:** 4000 0025 0000 3155

### Webhook Testing
Use Stripe CLI to test webhooks locally:
```bash
stripe login
stripe listen --forward-to localhost:8000/api/stripe/webhook
```

## Code Standards

### Laravel/PHP
- Follow PSR-12 coding standards
- Use Laravel Pint for code formatting
- Keep controllers thin, use Services for business logic
- Use Form Request classes for validation
- Use API Resources for JSON responses
- Write feature tests for all endpoints

### React/TypeScript
- Functional components with hooks only
- Strict TypeScript (no `any` without justification)
- Component files: `ComponentName.tsx`
- Custom hooks for reusable logic
- Tailwind for all styling (no inline styles, no CSS files)
- Keep components small and focused

## Production Optimizations

The application includes several production-ready optimizations:

### SEO Optimization
- **react-helmet-async** - Dynamic meta tags for all pages
- **robots.txt** - Search engine crawling directives
- **Open Graph & Twitter Cards** - Social media sharing optimization
- **Semantic HTML** - Proper heading hierarchy and structure
- **Custom 404 page** - User-friendly error handling

### Performance
- **Lazy loading images** - All product, gallery, and cart images load lazily
- **Code splitting** - React Router automatic code splitting
- **Optimized build** - Vite production builds with minification
- **Laravel caching** - Config, route, and view caching in production

### Security
- **Security Headers Middleware** - Comprehensive HTTP security headers:
  - `X-Content-Type-Options: nosniff` - Prevent MIME type sniffing
  - `X-Frame-Options: SAMEORIGIN` - Clickjacking protection
  - `X-XSS-Protection` - XSS protection for legacy browsers
  - `Referrer-Policy` - Control referrer information
  - `Strict-Transport-Security` - HSTS (HTTPS enforcement)
  - `Content-Security-Policy` - CSP with Stripe integration support
  - `Permissions-Policy` - Feature policy restrictions
- **Rate Limiting** - API throttling (60 req/min reads, 10 req/min writes)
- **CSRF Protection** - Laravel Sanctum CSRF tokens
- **SQL Injection Protection** - Eloquent ORM parameterized queries
- **XSS Protection** - React automatic escaping

### Error Handling
- **ErrorBoundary** - Catches React errors gracefully
- **Custom 404 page** - Branded not found experience
- **Production error hiding** - Detailed errors only in development
- **API error responses** - Consistent JSON error format

## Features

See [FEATURES.md](FEATURES.md) for a comprehensive checklist of all planned features.

## Development Progress

See [claude-progress.txt](claude-progress.txt) for detailed progress logs and session history.

## Support

For questions or issues during development, refer to:
- Laravel Documentation: https://laravel.com/docs/11.x
- React Documentation: https://react.dev
- Stripe Documentation: https://stripe.com/docs
- Tailwind CSS Documentation: https://tailwindcss.com/docs

## License

Private project for Sawdust & Coffee Woodworking. All rights reserved.

## Contact

**Sawdust & Coffee Woodworking**
- Phone: 774-836-4958
- Location: Wareham, Massachusetts
- Website: [To be deployed]
