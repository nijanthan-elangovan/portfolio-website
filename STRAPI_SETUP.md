# Strapi CMS Setup Guide

This guide will help you set up and configure Strapi CMS for your portfolio website.

## Quick Start

### 1. Start Strapi Locally

```bash
cd strapi-cms
npm run develop
```

This will:
- Start Strapi on `http://localhost:1337`
- Open the admin panel at `http://localhost:1337/admin`
- Prompt you to create an admin account (first time only)

### 2. Create Admin Account

On first launch, you'll be asked to create an admin account:
- Email: your-email@example.com
- Password: (choose a secure password)
- First Name & Last Name

### 3. Configure Content Types

Strapi needs content types to be created. You have two options:

#### Option A: Use Strapi Cloud (Recommended)

1. Sign up for Strapi Cloud (free plan available): https://cloud.strapi.io
2. Create a new project
3. Import the content types (see "Content Type Definitions" below)
4. Update your `.env` file with the cloud URL

#### Option B: Create Content Types Manually

In the Strapi admin panel, go to **Content-Type Builder** and create the following:

##### Single Types

**1. Profile**
- name (Text)
- roles (JSON - array of strings)
- summary (Long text)
- location (Text)
- email (Email)
- phone (Text)
- availability (Text)

**2. Social Link**
- linkedin (Text - URL)
- website (Text - URL)
- github (Text - URL)
- resumeUrl (Text - URL)

**3. Community**
- name (Text)
- href (Text - URL)
- note (Long text)

##### Collection Types

**4. Experience**
- company (Text)
- title (Text)
- dateRange (Text)
- bullets (JSON - array of strings)
- order (Number - integer)

**5. Project**
- title (Text)
- blurb (Long text)
- meta (JSON - array of strings)
- order (Number - integer)

**6. Skill**
- name (Text)
- order (Number - integer)

**7. Education**
- school (Text)
- degree (Text)
- year (Text)
- order (Number - integer)

**8. Certification**
- issuer (Text)
- name (Text)
- order (Number - integer)

**9. Client**
- name (Text)
- href (Text - URL)
- blurb (Text)
- order (Number - integer)

**10. Latest Work**
- kind (Text - e.g., "Article", "Video")
- title (Text)
- href (Text - URL)
- meta (Text)
- order (Number - integer)

### 4. Set API Permissions

1. Go to **Settings** → **Users & Permissions Plugin** → **Roles** → **Public**
2. Enable the following permissions for each content type:
   - `find` (for collection types)
   - `findOne` (for single types and collection types)
3. Click **Save**

### 5. Add Content

Now you can add your portfolio content through the Strapi admin panel:

1. Go to **Content Manager**
2. Select each content type
3. Click **Create new entry**
4. Fill in the fields
5. Click **Save** and **Publish**

### 6. Configure Frontend

Update your `.env` file in the portfolio-website directory:

```bash
# For local development
VITE_STRAPI_URL=http://localhost:1337

# For Strapi Cloud (after deployment)
# VITE_STRAPI_URL=https://your-project.strapiapp.com
```

### 7. Test the Integration

1. Start your React app: `npm run dev`
2. The app should fetch content from Strapi
3. If Strapi is not running, it will fall back to hardcoded content

## Deployment Options

### Option 1: Strapi Cloud (Easiest)

1. Sign up at https://cloud.strapi.io
2. Create a new project
3. Deploy your content types
4. Add your content
5. Update `.env` with your cloud URL

**Pros:**
- Free plan available
- Automatic backups
- Easy to use
- No server management

**Cons:**
- Free plan has limitations
- Paid plans start at ~$9/month

### Option 2: Self-Hosted

Deploy to platforms like:
- **Railway** (https://railway.app)
- **Render** (https://render.com)
- **Heroku** (https://heroku.com)
- **DigitalOcean** (https://digitalocean.com)

Follow the platform's deployment guide for Node.js applications.

## Troubleshooting

### Content not loading?

1. Check that Strapi is running: `http://localhost:1337/admin`
2. Verify API permissions are set correctly
3. Check browser console for errors
4. Ensure `.env` file has correct `VITE_STRAPI_URL`

### CORS errors?

Update `strapi-cms/config/middlewares.js`:

```javascript
module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
          'media-src': ["'self'", 'data:', 'blob:', 'https:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: ['http://localhost:5173', 'https://njthnelvgn.com'],
    },
  },
  // ... other middlewares
];
```

### Database issues?

Strapi uses SQLite by default for local development. The database file is at `strapi-cms/.tmp/data.db`.

To reset the database:
```bash
cd strapi-cms
rm -rf .tmp
npm run develop
```

## Next Steps

1. **Migrate existing content** - Copy your current portfolio data into Strapi
2. **Customize content types** - Add fields as needed
3. **Deploy Strapi** - Choose a hosting option
4. **Update production** - Configure production `.env` with Strapi URL

## Resources

- [Strapi Documentation](https://docs.strapi.io)
- [Strapi Cloud](https://cloud.strapi.io)
- [Strapi Community](https://discord.strapi.io)
