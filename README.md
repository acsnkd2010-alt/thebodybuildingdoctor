# Bodybuilding Club Media Channel

A Next.js 14+ media channel application for a bodybuilding club, featuring user authentication, WordPress integration, and a modern dashboard interface.

## Features

- 🔐 **JWT Authentication** - Secure login/register flow integrated with WordPress
- 📱 **Media Feed** - Dynamic content fetching from WordPress REST API
- ❤️ **Like Functionality** - Per-user likes stored in WordPress
- 📄 **Pagination** - Infinite scroll for better UX
- 🎨 **Modern UI** - Responsive design with Tailwind CSS
- 👤 **Profile Page** - View liked content per user
- 🚀 **Vercel Ready** - Optimized for deployment

## Prerequisites

- Node.js 18+ and npm/yarn
- WordPress site with REST API enabled
- WordPress JWT Authentication plugin (e.g., JWT Authentication for WP REST API)
- WordPress Application Password (for API authentication)

## WordPress Setup

1. **Install JWT Authentication Plugin**
   - Install and activate "JWT Authentication for WP REST API" or similar
   - Configure the plugin according to its documentation

2. **Create Application Password**
   - Go to WordPress Admin → Users → Your Profile
   - Scroll to "Application Passwords"
   - Create a new application password
   - Save this password securely

3. **Enable REST API**
   - Ensure WordPress REST API is accessible at `/wp-json/`

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd thebodybuildingdoctor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your values:
   ```env
   WORDPRESS_API_URL=https://your-wordpress-site.com
   WORDPRESS_API_KEY=your-application-password-here
   JWT_SECRET=your-secure-random-string-here
   ```

4. **Generate JWT Secret**
   ```bash
   openssl rand -base64 32
   ```
   Use the output as your `JWT_SECRET` value.

5. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add all variables from `.env.example`:
     - `WORDPRESS_API_URL`
     - `WORDPRESS_API_KEY`
     - `JWT_SECRET`
     - `NODE_ENV=production`

5. **Redeploy** (if needed after adding env vars)
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables in the Vercel dashboard
   - Click "Deploy"

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `WORDPRESS_API_URL` | Full URL to your WordPress site (e.g., `https://example.com`) | Yes |
| `WORDPRESS_API_KEY` | WordPress Application Password | Yes |
| `JWT_SECRET` | Secret key for signing JWT tokens (use a secure random string) | Yes |
| `NODE_ENV` | Environment (`development` or `production`) | Yes |

## Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── logout/
│   │   └── media/
│   ├── dashboard/
│   ├── profile/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── AuthForm.tsx
│   ├── MediaCard.tsx
│   ├── MediaFeed.tsx
│   └── ProfileLikedFeed.tsx
├── lib/
│   ├── auth/
│   │   └── session.ts
│   └── wordpress.ts
└── public/
```

## API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Media
- `GET /api/media` - Fetch paginated media posts
- `POST /api/media/[id]/like` - Toggle like on a post
- `GET /api/media/[id]/like` - Get like status

## WordPress Integration

The app uses WordPress REST API endpoints:
- `/wp-json/wp/v2/posts` - Fetch posts
- `/wp-json/wp/v2/media` - Fetch media
- `/wp-json/jwt-auth/v1/token` - JWT authentication
- `/wp-json/wp/v2/users` - User registration

Likes are stored in WordPress custom fields (ACF) or post meta:
- `acf.likes` - Total like count
- `acf.liked_by` - Array of user IDs who liked

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Troubleshooting

### WordPress API Not Accessible
- Ensure WordPress REST API is enabled
- Check CORS settings if accessing from a different domain
- Verify WordPress site URL is correct

### Authentication Fails
- Verify JWT Authentication plugin is installed and configured
- Check Application Password is correct
- Ensure `WORDPRESS_API_URL` includes protocol (http/https)

### Likes Not Saving
- Verify `WORDPRESS_API_KEY` has write permissions
- Check WordPress user has permission to edit posts
- Ensure ACF (Advanced Custom Fields) plugin is installed if using ACF fields

## License

Private project for bodybuilding club use.
