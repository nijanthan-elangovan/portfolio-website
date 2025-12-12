# How to Create Content Types in Strapi Cloud (Production Mode)

## The Problem

Strapi Cloud runs in **production mode** by default, which disables the Content-Type Builder UI for security reasons.

## Solution: Use the Strapi Cloud Dashboard

Strapi Cloud provides a special way to edit content types even in production mode:

### Option 1: Enable Development Mode Temporarily (Easiest)

1. **Go to your Strapi Cloud Dashboard**
   - Visit: https://cloud.strapi.io
   - Select your project: `unwavering-crystal-e70cd8fa5e`

2. **Enable Development Mode**
   - Click on **Settings** tab
   - Look for **"Development Mode"** or **"Content-Type Builder Access"**
   - Toggle it ON temporarily
   - This allows you to use the Content-Type Builder in the admin panel

3. **Create Your Content Types**
   - Go to your admin panel: https://unwavering-crystal-e70cd8fa5e.strapiapp.com/admin
   - Use Content-Type Builder to create all 10 content types
   - Follow the guide in `STRAPI_CONTENT_TYPES_GUIDE.md`

4. **Disable Development Mode**
   - After creating all content types, go back to Cloud Dashboard
   - Toggle Development Mode OFF for security

---

### Option 2: Create Content Types Locally & Deploy (Recommended for Production)

This is the proper way to manage content types in production:

#### Step 1: Run Strapi Locally

```bash
cd strapi-cms

# Change port to avoid conflicts
export PORT=1338

# Run in development mode
npm run develop
```

This will open Strapi at `http://localhost:1338/admin`

#### Step 2: Create Content Types Locally

1. Open http://localhost:1338/admin
2. Create admin account (if first time)
3. Go to Content-Type Builder
4. Create all 10 content types following `STRAPI_CONTENT_TYPES_GUIDE.md`
5. Save each content type

#### Step 3: Commit Schema Files

The content types are saved as JSON schema files in:
```
strapi-cms/src/api/
├── profile/
│   └── content-types/profile/schema.json
├── experience/
│   └── content-types/experience/schema.json
├── project/
│   └── content-types/project/schema.json
... (and so on)
```

Commit these files:
```bash
cd strapi-cms
git add src/api/
git commit -m "Add content type schemas"
git push origin main
```

#### Step 4: Deploy to Strapi Cloud

Strapi Cloud will automatically detect the new schema files and apply them to your production instance!

1. Go to your Strapi Cloud dashboard
2. Your project should auto-deploy when you push to GitHub
3. Or manually trigger a deployment if needed

---

### Option 3: Use Strapi CLI (Advanced)

If Strapi Cloud supports it, you can use the CLI:

```bash
# Install Strapi Cloud CLI
npm install -g @strapi/cloud-cli

# Login
strapi-cloud login

# Link your project
strapi-cloud link

# Deploy schema changes
strapi-cloud deploy
```

---

## Quick Start: Run Locally on Different Port

Since port 1337 is in use, let's use port 1338:

```bash
cd /Users/nijanthan/Documents/Porfolio/portfolio-website/strapi-cms

# Set port in environment
echo "PORT=1338" >> .env

# Run development server
npm run develop
```

Then:
1. Open http://localhost:1338/admin
2. Create admin account
3. Use Content-Type Builder to create all content types
4. Commit and push the schema files
5. Strapi Cloud will auto-deploy them

---

## Recommended Workflow

**For now (quick setup):**
1. Run Strapi locally on port 1338
2. Create all content types
3. Add your content locally
4. Export/copy content to Strapi Cloud later

**For production (proper way):**
1. Create content types locally
2. Commit schema files to Git
3. Push to GitHub
4. Strapi Cloud auto-deploys
5. Add content through Strapi Cloud admin panel

---

## Next Steps

Choose one of the options above. I recommend **Option 2** (create locally & deploy) as it's the most professional approach and gives you version control over your content types.

Would you like me to help you set up Strapi locally on port 1338?
