# CampusOS Backend

A comprehensive backend API for the CampusOS university management system, built with modern technologies and best practices.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Live URL](#live-url)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
- [Database Schema](#database-schema)

## 🎓 Project Overview

**CampusOS** is a comprehensive university management system designed to streamline administrative processes, academic management, and student-faculty interactions. The backend API provides robust endpoints for managing users, courses, enrollments, payments, and more.

This system supports multiple user roles including Super Admins, Admins, Faculty, and Students with role-based access control (RBAC) to ensure secure and appropriate access to different parts of the system.

## 🌐 Live URL

- **API Base URL**: [https://uttarauniversity-backend.vercel.app](https://uttarauniversity-backend.vercel.app)

## ✨ Features

### Core Features
- **User Management** - Create and manage users with multiple roles (Super Admin, Admin, Faculty, Student)
- **Authentication & Authorization** - Secure JWT-based authentication with role-based access control
- **Student Management** - Comprehensive student profile management and admission handling
- **Faculty Management** - Faculty profile management, course assignment, and graduation tracking
- **Course Management** - Course offerings, enrollment tracking, and course posts
- **Attendance Tracking** - Track course attendance and offering-based attendance records
- **Results & Grading** - Manage course results and student performance tracking
- **Payment Processing** - Integrated payment system with Stripe for processing student payments and bills
- **Admission Forms** - Streamlined admission form submission and processing
- **Class Management** - Manage classes with faculty-student interactions
- **File Management** - Image and document uploads using Cloudinary
- **Email Notifications** - Automated email communications for important events

### Advanced Features
- **Webhook Handling** - Payment webhook processing for real-time transaction updates
- **PDF Generation** - Dynamic PDF generation using Puppeteer
- **Database Migrations** - 35+ migration files for schema evolution
- **Error Handling** - Comprehensive global error handling middleware
- **CORS Support** - Configured cross-origin resource sharing for frontend integration

## 🛠 Technologies Used

### Backend Framework & Language
- **Node.js** - JavaScript runtime
- **Express.js** - Fast and minimalist web framework
- **TypeScript** - Type-safe JavaScript for better code quality

### Database & ORM
- **PostgreSQL** - Relational database for data persistence
- **Prisma ORM** - Modern database access layer with type safety
- **Prisma Adapter for PostgreSQL** - Optimized PostgreSQL connection handling

### Authentication & Security
- **JSON Web Tokens (JWT)** - For secure token-based authentication
- **bcryptjs** - Password hashing and encryption

### Payment Processing
- **Stripe** - Payment gateway integration for processing transactions

### File Management
- **Cloudinary** - Cloud storage for images and media files
- **Multer** - Middleware for handling file uploads

### Email & Document Generation
- **Nodemailer** - Email sending functionality
- **Puppeteer** - Headless browser for PDF generation
- **EJS** - Templating engine for dynamic content

### Utilities & Validation
- **Zod** - TypeScript-first schema validation
- **CORS** - Cross-Origin Resource Sharing support
- **Cookie Parser** - Cookie parsing middleware
- **Dotenv** - Environment variable management
- **UUID** - Unique identifier generation
- **http-status** - HTTP status code utilities

### Development Tools
- **tsx** - TypeScript execution and watch mode
- **ESLint** - Code quality and linting

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Clone Repository

```bash
git clone https://github.com/manik-babu/campus-os-backend.git
cd backend
```

### Install Dependencies

```bash
npm install
# or
yarn install
```

## 🚀 Setup Instructions

### 1. Environment Variables

Create a `.env` file in the backend root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/campusOS

# Server
PORT=8080
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:3000

# Cloudinary (for image uploads)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Admin Email
ADMIN_EMAIL=admin@campusos.com
```

### 2. Database Setup

Initialize the Prisma database and run migrations:

```bash
# Generate Prisma client
npx prisma generate

# Create the database and run migrations
npx prisma migrate dev --name init

# (Optional) Seed the database with super admin user
npm run seed:superAdmin
```

### 3. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:8080` (or the port specified in `.env`)

### 4. Verify Installation

Make a request to the health check endpoint:

```bash
curl http://localhost:8080
```

Expected response:
```json
{
  "ok": true,
  "message": "CampusOS Backend API is running successfully.",
  "version": "1.0.0",
  "time": "2026-05-03T10:00:00.000Z"
}
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server entry point
│   ├── @types/                # TypeScript type definitions
│   ├── config/                # Configuration files
│   ├── helper/                # Helper functions
│   ├── lib/                   # Library utilities (Prisma, etc.)
│   ├── middleware/            # Express middleware
│   ├── module/                # Feature modules (auth, student, faculty, etc.)
│   ├── routes/                # API route definitions
│   ├── scripts/               # Utility scripts
│   ├── templates/             # Email templates
│   └── utils/                 # Utility functions
├── prisma/
│   ├── schema/                # Database schema (modular)
│   └── migrations/            # Database migration files
├── generated/
│   └── prisma/                # Auto-generated Prisma types
├── package.json               # Project dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## 🔌 API Routes

All routes are prefixed with `/api/v1/`

### Authentication Routes (`/auth`)
- `POST /login` - User login
- `POST /register` - User registration
- `POST /refresh-token` - Refresh JWT token
- `POST /logout` - User logout

### Admin Routes (`/admin`) - *Requires ADMIN role*
- User management
- Academic management
- System configuration

### Super Admin Routes (`/super-admin`) - *Requires SUPER_ADMIN role*
- System administration
- User role management
- System-wide settings

### Student Routes (`/students`) - *Requires STUDENT role*
- View enrolled courses
- Check grades and results
- View attendance
- Manage admission forms

### Faculty Routes (`/faculty`) - *Requires FACULTY role*
- Manage courses
- Post grades
- Track attendance
- Create course posts

### Class Routes (`/classes`) - *Requires FACULTY or STUDENT role*
- View class information
- Access class resources

### Payment Routes (`/payment`)
- Process payments
- Webhook handling for payment confirmations

### Public Routes (`/public`)
- Public course information
- Admission information

### Common Routes (`/common`)
- Shared utilities
- General data endpoints

## 🗄️ Database Schema

The database schema is organized into modular Prisma files:

- **User Management**: `user.prisma` - Core user entity
- **Profiles**: `studentProfile.prisma`, `facultyProfile.prisma`, `adminProfile.prisma`
- **Academic**: `program.prisma`, `courses.prisma`, `courseOffering.prisma`, `enrollment.prisma`, `result.prisma`
- **Attendance**: `attendance.prisma`
- **Billing**: `bill.prisma`, `billItem.prisma`, `payment.prisma`
- **Admission**: `admissionForm.prisma`
- **Other**: `department.prisma`, `batch.prisma`, `semester.prisma`, `coursePost.prisma`

## 📝 Scripts

```bash
# Development
npm run dev              # Start development server with auto-reload

# Production
npm run build            # Compile TypeScript to JavaScript

# Database
npm run seed:superAdmin  # Seed super admin user

# Payments
npm run stripe:webhook   # Listen to Stripe webhooks locally
```

## 🔐 Security Notes

- All passwords are hashed using bcryptjs
- JWT tokens are used for stateless authentication
- CORS is configured to only allow requests from the frontend URL
- Role-based access control ensures users can only access appropriate endpoints
- Environment variables are used for sensitive data - never commit `.env` files

---

**Version**: 1.0.0  
**Last Updated**: May 3, 2026
