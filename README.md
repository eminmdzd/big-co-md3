# IHG Pattern-Based Two-Factor Authentication

This project implements a secure two-factor authentication system for IHG (InterContinental Hotels Group) that uses pattern recognition instead of traditional passkeys. The system allows users to create a security pattern by selecting elements from different categories (phrases, images, and icons) and requires this pattern for authentication.

## Key Features

- Traditional username/password authentication
- Pattern-based two-factor authentication
- Integration with PingFederate or PingOne for enterprise authentication
- Pattern setup and reset functionality
- Account lockout after multiple failed attempts
- Responsive UI for all devices

## Technology Stack

- Frontend: Next.js, React, TailwindCSS
- Backend: Next.js API Routes
- Database: SQLite (via Prisma ORM)
- Authentication: JWT, PingFederate/PingOne Identity

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env.local` file with the following variables:
   ```
   # PingOne Environment Configuration (Legacy)
   PING_ONE_AUTH_URL=https://auth.pingone.com
   PING_ONE_API_URL=https://api.pingone.com/v1
   PING_ONE_ENV_ID=your_environment_id
   PING_ONE_CLIENT_ID=your_client_id
   PING_ONE_CLIENT_SECRET=your_client_secret

   # PingFederate Configuration
   PING_FED_BASE_URL=https://pingfederate.example.com
   PING_FED_CLIENT_ID=your_pingfed_client_id
   PING_FED_CLIENT_SECRET=your_pingfed_client_secret
   PING_FED_AUTH_PATH=/as/token.oauth2
   PING_FED_API_PATH=/pf-admin/api/v1

   # Use PingFederate instead of PingOne (set to true to enable)
   USE_PING_FEDERATE=false

   # JWT Secret for local token generation
   JWT_SECRET=ihg-pattern-2fa-secret-key

   # Database URL (used by Prisma)
   DATABASE_URL="file:./prisma/dev.db"

   # API Base URL
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

3. Initialize the database:
   ```
   npx prisma db push
   ```

4. You can use the provided shell script to automatically initialize the database and start the server:
   ```
   ./start.sh
   ```

   Or run the development server manually:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

6. To switch between PingFederate and PingOne, edit the .env.local file and change the `USE_PING_FEDERATE` value.

## Authentication Flow

1. **User Registration**:
   - User creates an account with username, email, and password
   - User is prompted to set up their security pattern

2. **Login Process**:
   - User enters username and password
   - If valid, user is prompted to verify their security pattern
   - After successful pattern verification, user gains access to the system

3. **Pattern Reset**:
   - User can reset their pattern by verifying their identity
   - Requires username, email, and password verification

## Ping Identity Integration

The application integrates with either PingFederate or PingOne for enterprise identity management:

### PingFederate Integration

PingFederate is an enterprise-grade identity federation server that provides a comprehensive platform for identity and access management. The integration includes:

- User creation and management via PingFederate APIs
- Multi-factor authentication integration
- Custom pattern attribute storage using PingFederate's user attributes
- Authentication flow tracking and policy enforcement
- Support for OpenID Connect and OAuth 2.0 flows
- Ability to integrate with existing enterprise PingFederate deployments

### PingOne Integration (Legacy)

Alternative integration with PingOne cloud service:

- User creation and management in PingOne
- Custom pattern attribute storage
- Authentication flow tracking
- Secure credential storage

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens for session management
- Account lockout after 5 failed attempts (30-minute cooldown)
- Security patterns stored in encrypted format
- Rate limiting for API requests

## Project Structure

- `/src/app` - Next.js application routes and API endpoints
- `/src/components` - React components for UI
- `/src/lib` - Utility functions and service integrations
  - `/src/lib/identity-provider.js` - Façade for identity provider operations
  - `/src/lib/ping-federate.js` - PingFederate integration
  - `/src/lib/ping-identity.js` - PingOne integration (legacy)
  - `/src/lib/auth.js` - Core authentication functions
  - `/src/lib/prisma.js` - Database client
- `/prisma` - Database schema and client

## License

Proprietary - IHG Internal Use Only