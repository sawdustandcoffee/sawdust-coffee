# Sawdust & Coffee Woodworking - Feature Checklist

This document tracks all features and implementation tasks for the Sawdust & Coffee Woodworking e-commerce website.

**Legend:**
- `[ ]` Not started
- `[~]` In progress
- `[x]` Completed

---

## Phase 1: Foundation & Infrastructure

### 1.1 Project Setup
- [x] Laravel 11 project initialized with sanctum, cors configured
- [x] React + Vite + TypeScript project initialized
- [x] Tailwind CSS configured with custom color palette (woodworking aesthetic)
- [x] Docker compose with MySQL 8.0 container
- [x] Environment variables documented in .env.example
- [ ] Basic folder structure and architecture documented
- [x] Install Laravel Sanctum package
- [x] Configure CORS for SPA
- [x] Configure Sanctum SPA authentication settings
- [x] Install Stripe PHP SDK
- [x] Add additional npm packages (react-router-dom, axios, react-query, etc.)

### 1.2 Database Schema
- [x] Users table (admins only for now)
- [x] Products table (name, slug, description, price, inventory, active, featured)
- [x] Product Images table (product_id, path, alt_text, sort_order, is_primary)
- [x] Product Categories table (name, slug, description)
- [x] Product Variants table (product_id, name, price_modifier, inventory)
- [x] Gallery Items table (title, description, category, image_path, featured)
- [x] Orders table (order_number, customer_email, customer_name, status, total, stripe_session_id)
- [x] Order Items table (order_id, product_id, variant_id, quantity, price_at_purchase)
- [x] Quote Requests table (name, email, phone, project_type, description, status)
- [x] Site Content table (key, value, type) - for editable content blocks
- [x] Contact Form Submissions table (name, email, phone, message, status)
- [x] All migrations created and tested
- [ ] Database seeders for initial data
- [ ] Factory classes for testing

### 1.3 Authentication System
- [ ] Admin login page (React)
- [ ] Laravel Sanctum SPA authentication configured
- [ ] Protected admin routes middleware
- [ ] Login/logout functionality working
- [ ] Session persistence across page refreshes
- [ ] CSRF protection configured
- [ ] AuthContext in React for managing auth state
- [ ] Protected route component in React
- [ ] Redirect to login if unauthenticated
- [ ] Create initial admin user seeder

---

## Phase 2: Admin Dashboard

### 2.1 Admin Layout & Navigation
- [ ] Admin dashboard layout with sidebar navigation
- [ ] Dashboard home with quick stats (orders, products, quote requests)
- [ ] Responsive design for tablet/desktop admin use
- [ ] Navigation menu items (Dashboard, Products, Gallery, Orders, Quotes, Content)
- [ ] User profile dropdown with logout
- [ ] Mobile-friendly navigation

### 2.2 Product Management
- [ ] Products list view with search and filters
- [ ] Pagination for products list
- [ ] Create new product form (all fields)
- [ ] Edit product form with current data pre-populated
- [ ] Delete product with confirmation modal
- [ ] Image upload with drag-and-drop support
- [ ] Multiple images per product with sort order
- [ ] Set primary/featured image
- [ ] Product variants management (e.g., size options)
- [ ] Add/edit/delete product variants
- [ ] Category assignment (multi-select)
- [ ] Toggle product active/inactive status
- [ ] Toggle product as featured
- [ ] Rich text editor for product descriptions
- [ ] Form validation (frontend and backend)
- [ ] Success/error notifications
- [ ] Product slug auto-generation from name

### 2.3 Gallery Management
- [ ] Gallery items list view
- [ ] Grid/masonry preview of gallery items
- [ ] Upload new gallery image with metadata
- [ ] Edit gallery item details
- [ ] Delete gallery item with confirmation
- [ ] Bulk upload support
- [ ] Category/tag assignment for filtering
- [ ] Toggle featured status
- [ ] Image preview before upload
- [ ] Image optimization on upload

### 2.4 Order Management
- [ ] Orders list with status filters (pending, paid, shipped, completed)
- [ ] Order detail view (customer info, items, totals)
- [ ] Update order status dropdown
- [ ] Order search by email or order number
- [ ] Pagination for orders list
- [ ] Print order details functionality
- [ ] Order date filtering
- [ ] Total revenue display
- [ ] Export orders to CSV

### 2.5 Quote Requests Management
- [ ] Quote requests list view
- [ ] View quote request details modal
- [ ] Mark as responded/closed
- [ ] Delete old requests
- [ ] Filter by status (new, responded, closed)
- [ ] Search quote requests
- [ ] Email reply integration (optional)
- [ ] Add internal notes to quote requests

### 2.6 Content Management
- [ ] Edit homepage hero text and CTA
- [ ] Edit about page content
- [ ] Edit services and pricing text
- [ ] Edit contact information
- [ ] WYSIWYG or markdown editor for longer content
- [ ] Image upload for content sections
- [ ] Preview content changes
- [ ] Save and publish workflow
- [ ] Edit team member bios
- [ ] Edit business hours

---

## Phase 3: Public Website - Static Pages

### 3.1 Layout & Navigation
- [ ] Header with logo, navigation menu, cart icon with count
- [ ] Mobile-responsive hamburger menu
- [ ] Footer with contact info, social links, copyright
- [ ] Consistent page layout wrapper
- [ ] Sticky header on scroll
- [ ] Active navigation state
- [ ] Breadcrumb navigation
- [ ] Logo image/design
- [ ] Social media links configuration

### 3.2 Home Page
- [ ] Hero section with headline, tagline, CTA button
- [ ] Featured products section (grid of 3-4 products)
- [ ] Services overview section
- [ ] About snippet with link to full about page
- [ ] Recent gallery highlights
- [ ] Call-to-action for custom quotes
- [ ] Testimonials section (optional)
- [ ] Hero background image or video
- [ ] Scroll animations
- [ ] Mobile-responsive design

### 3.3 About Page
- [ ] Company story section
- [ ] Team member bios (Paul, Jason, Patrick)
- [ ] Team member photos
- [ ] Workshop/process photos
- [ ] Values or mission statement
- [ ] Timeline or history section
- [ ] Contact CTA at bottom
- [ ] Mobile-responsive design

### 3.4 Services Page
- [ ] List of services with descriptions:
  - [ ] Slab Flattening/Planing
  - [ ] Custom CNC Signs & Work
  - [ ] Laser Engraving
  - [ ] Live Edge Furniture (tables, desks, countertops)
  - [ ] Custom Epoxy Designs
  - [ ] Cornhole Boards & Scoreboards
  - [ ] Custom Cabinetry
  - [ ] 3D Printing & Design
  - [ ] Screen Printing
- [ ] Pricing info where applicable
- [ ] CTA to request quote for each service
- [ ] Service icons or images
- [ ] Grid layout for services
- [ ] Mobile-responsive design

### 3.5 Contact Page
- [ ] Contact form (name, email, phone, message)
- [ ] Form validation (frontend and backend)
- [ ] Success/error feedback
- [ ] Business location (Wareham, MA)
- [ ] Phone number: 774-836-4958
- [ ] Business hours (if applicable)
- [ ] Optional: embedded Google map
- [ ] Social media links
- [ ] Email address display
- [ ] Form submission to database
- [ ] Email notification on form submission
- [ ] reCAPTCHA or spam protection

### 3.6 Quote Request Page
- [ ] Detailed form for custom work requests
- [ ] Project type selection (dropdown)
- [ ] Description textarea
- [ ] Optional file upload for reference images
- [ ] Form submission to database
- [ ] Email notification to admin
- [ ] Success page/message after submission
- [ ] Form validation (frontend and backend)
- [ ] File type and size validation
- [ ] Expected timeline selection
- [ ] Budget range selection (optional)

---

## Phase 4: Gallery

### 4.1 Gallery Page
- [ ] Masonry or grid layout for images
- [ ] Category/tag filtering
- [ ] Lightbox view on image click
- [ ] Image navigation in lightbox (prev/next)
- [ ] Image title and description in lightbox
- [ ] Lazy loading for performance
- [ ] Responsive grid (1 col mobile, 2-3 tablet, 4 desktop)
- [ ] Load more or pagination
- [ ] Featured projects section
- [ ] Filter animations
- [ ] Search gallery items
- [ ] Sort options (newest, featured)

---

## Phase 5: E-Commerce Shop

### 5.1 Product Catalog
- [ ] Shop page with product grid
- [ ] Category filtering sidebar/dropdown
- [ ] Search functionality
- [ ] Sort options (price low-high, high-low, newest)
- [ ] Pagination or infinite scroll
- [ ] Product card component (image, name, price, quick add to cart)
- [ ] Sale/featured badge on products
- [ ] Out of stock indicator
- [ ] Responsive grid layout
- [ ] Loading states
- [ ] Empty state for no products

### 5.2 Product Detail Page
- [ ] Large product images with gallery/carousel
- [ ] Product name, price, description
- [ ] Variant selection (if applicable)
- [ ] Quantity selector
- [ ] Add to cart button
- [ ] Stock/availability indicator
- [ ] Related products section
- [ ] Product specifications table
- [ ] Share buttons
- [ ] Breadcrumb navigation
- [ ] Image zoom on hover/click
- [ ] Reviews section (future phase)

### 5.3 Shopping Cart
- [ ] Cart sidebar or page
- [ ] List cart items with images, names, quantities, prices
- [ ] Update quantity
- [ ] Remove item
- [ ] Cart subtotal calculation
- [ ] Persist cart in localStorage
- [ ] Sync cart to backend for checkout
- [ ] Empty cart state
- [ ] Continue shopping link
- [ ] Checkout button
- [ ] Cart icon badge with count
- [ ] Slide-in cart drawer
- [ ] Shipping estimate (if applicable)

### 5.4 Checkout Flow
- [ ] Cart review before checkout
- [ ] Customer info collection (email, name, shipping address)
- [ ] Create Stripe Checkout Session (backend)
- [ ] Redirect to Stripe Checkout
- [ ] Success page after payment
- [ ] Cancel/back to cart handling
- [ ] Order created in database on successful payment (webhook)
- [ ] Loading state during redirect
- [ ] Error handling for failed checkout
- [ ] Order summary display
- [ ] Shipping options (if applicable)

### 5.5 Stripe Integration
- [ ] Stripe PHP SDK installed and configured
- [ ] Create Checkout Session endpoint
- [ ] Stripe webhook endpoint for payment confirmation
- [ ] Webhook signature verification
- [ ] Handle checkout.session.completed event
- [ ] Create order record on successful payment
- [ ] Handle payment failures gracefully
- [ ] Test mode working with Stripe test keys
- [ ] Product and price creation in Stripe
- [ ] Webhook logging for debugging
- [ ] Idempotency handling

### 5.6 Order Confirmation
- [ ] Success page with order summary
- [ ] Order confirmation email to customer (can use Laravel Mail)
- [ ] Order number displayed
- [ ] Clear cart after successful order
- [ ] Email includes order items and total
- [ ] Email includes shipping address
- [ ] What's next information
- [ ] Link back to shop

---

## Phase 6: Polish & Production Readiness

### 6.1 SEO & Meta
- [ ] Dynamic page titles
- [ ] Meta descriptions for all pages
- [ ] Open Graph tags for social sharing
- [ ] Structured data for products (JSON-LD)
- [ ] Sitemap generation
- [ ] Robots.txt
- [ ] Canonical URLs
- [ ] Alt text for all images
- [ ] Semantic HTML

### 6.2 Performance
- [ ] Image optimization (compression, WebP)
- [ ] Lazy loading for images
- [ ] Code splitting for React routes
- [ ] API response caching where appropriate
- [ ] Database query optimization (eager loading)
- [ ] Minification of CSS/JS
- [ ] CDN setup (future consideration)
- [ ] Lighthouse performance audit
- [ ] Core Web Vitals optimization

### 6.3 Security
- [ ] CSRF protection on all forms
- [ ] Input validation and sanitization
- [ ] SQL injection prevention (Eloquent ORM)
- [ ] XSS prevention
- [ ] Rate limiting on forms and API
- [ ] Secure headers configured
- [ ] Environment variables for all secrets
- [ ] HTTPS enforcement in production
- [ ] Content Security Policy headers
- [ ] File upload validation and sanitization

### 6.4 Error Handling
- [ ] Custom 404 page
- [ ] Custom 500 error page
- [ ] Form error display
- [ ] API error responses standardized
- [ ] Frontend error boundaries
- [ ] Toast notifications for errors
- [ ] Logging errors to file/service
- [ ] Graceful fallbacks for failed API calls

### 6.5 Testing
- [ ] PHPUnit tests for API endpoints
- [ ] Feature tests for authentication
- [ ] Feature tests for product CRUD
- [ ] Feature tests for order creation
- [ ] Feature tests for Stripe webhooks
- [ ] React component tests
- [ ] Integration tests for forms
- [ ] E2E tests for checkout flow (optional)
- [ ] Test coverage reporting

### 6.6 Deployment Preparation
- [ ] Production build scripts
- [ ] Apache .htaccess for Laravel
- [ ] Frontend build outputs to Laravel public folder (or separate)
- [ ] Database migration documentation
- [ ] Environment setup documentation
- [ ] Deployment guide
- [ ] Stripe live keys documentation (DO NOT commit)
- [ ] Backup strategy documentation
- [ ] Server requirements documentation
- [ ] Post-deployment checklist

---

## Future Enhancements (Post-Launch)

- [ ] Customer accounts and order history
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Email newsletter signup
- [ ] Blog or news section
- [ ] Advanced analytics dashboard
- [ ] Inventory management system
- [ ] Automated email marketing
- [ ] Discount codes and promotions
- [ ] Multi-currency support
- [ ] Shipping calculator integration
- [ ] Live chat support
- [ ] Social media integration
- [ ] Advanced search with filters

---

## Notes

- All features should be tested in both desktop and mobile viewports
- Maintain consistent design language throughout the site
- Follow accessibility best practices (WCAG 2.1 AA)
- Document any deviations from the original plan
- Keep code clean, commented, and following project standards
