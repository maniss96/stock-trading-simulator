# Security Policy

## Overview

This document outlines the security measures implemented in the Stock Trading Simulator project. Security is a top priority, and we follow industry best practices to protect user data and prevent attacks.

## Security Measures Implemented

### 1. Authentication & Authorization
- **JWT with Refresh Token Rotation**: Short-lived access tokens (15min) with rotating refresh tokens
- **Bcrypt Password Hashing**: 12 rounds of salting
- **Account Lockout**: 5 failed attempts trigger a 15-minute lockout
- **Session Management**: Max 5 concurrent sessions per user
- **Secure Token Storage**: Refresh tokens stored server-side, not in localStorage for production

### 2. Input Validation & Sanitization
- **Express Validator**: Schema-based input validation on all endpoints
- **XSS Protection**: HTML entity encoding and dangerous pattern removal
- **NoSQL Injection Prevention**: MongoDB operator blocking in request bodies
- **SQL Injection Prevention**: Pattern detection for SQL keywords
- **Command Injection Prevention**: Shell metacharacter filtering
- **Path Traversal Prevention**: Directory traversal pattern blocking
- **Request Size Limiting**: 1MB max body size

### 3. HTTP Security Headers (via Helmet)
- `Content-Security-Policy`: Restrictive CSP
- `Strict-Transport-Security`: HSTS with preload
- `X-Frame-Options`: DENY (clickjacking protection)
- `X-Content-Type-Options`: nosniff
- `X-XSS-Protection`: Enabled
- `Referrer-Policy`: strict-origin-when-cross-origin
- `Cross-Origin-Embedder-Policy`: require-corp
- `Cross-Origin-Opener-Policy`: same-origin
- `Cross-Origin-Resource-Policy`: same-site

### 4. Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Authentication**: 10 attempts per 15 minutes
- **Trading**: 30 orders per minute
- **Search**: 20 queries per minute

### 5. CORS Configuration
- Whitelisted origins only
- Credentials enabled with strict origin check
- Preflight caching for performance
- Limited methods and headers

### 6. CSRF Protection
- Double-submit cookie pattern
- Constant-time token comparison (timing attack resistant)
- Bearer token auth exemption (already CSRF-immune)

### 7. HTTP Parameter Pollution (HPP)
- Whitelist-based parameter deduplication
- Protection against parameter override attacks

### 8. Database Security
- Mongoose schema validation
- Indexed queries for performance (prevents DoS via slow queries)
- Connection pooling with limits
- Password fields excluded from JSON serialization

### 9. Logging & Monitoring
- Winston structured logging
- Request ID tracing
- Failed authentication logging
- Injection attempt logging
- Error stack traces in development only

### 10. Docker Security
- Non-root container users
- Multi-stage builds (minimal attack surface)
- Health checks
- Network isolation

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **DO NOT** create a public GitHub issue
2. Email: security@stocksim.example.com
3. Include detailed steps to reproduce
4. Allow 48 hours for initial response

## Security Checklist for Deployment

- [ ] Change all default secrets in `.env`
- [ ] Use strong, unique JWT secrets (64+ characters)
- [ ] Enable HTTPS with valid certificates
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Set up MongoDB authentication
- [ ] Enable Redis password
- [ ] Configure firewall rules
- [ ] Set up log rotation
- [ ] Enable rate limiting
- [ ] Review CSP headers for your domain
- [ ] Set up monitoring and alerting
- [ ] Regular dependency updates (`npm audit`)
