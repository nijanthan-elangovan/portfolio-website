# Creating Content Types in Strapi

Now that you've deployed to Strapi Cloud, let's create the content type schemas for your portfolio.

## Access Your Strapi Admin Panel

1. Go to your Strapi Cloud dashboard
2. Click on your project
3. Click "Open Admin Panel" or go to your project URL (e.g., `https://your-project.strapiapp.com/admin`)
4. Log in with your admin credentials

## Creating Content Types

In the Strapi admin panel, go to **Content-Type Builder** (in the left sidebar, under "Plugins").

---

## 1. Single Types (3 total)

### 1.1 Profile

**Steps:**
1. Click "Create new single type"
2. Display name: `Profile`
3. Click "Continue"
4. Add these fields:

| Field Name | Type | Settings |
|------------|------|----------|
| `name` | Text | Required |
| `roles` | JSON | Required |
| `summary` | Long text | Required |
| `location` | Text | Required |
| `email` | Email | Required |
| `phone` | Text | Required |
| `availability` | Text | Required |

5. Click "Finish"
6. Click "Save"

**Example JSON for `roles` field:**
```json
["Technical Writer", "Creative Designer"]
```

---

### 1.2 Social Link

**Steps:**
1. Click "Create new single type"
2. Display name: `Social Link`
3. Click "Continue"
4. Add these fields:

| Field Name | Type | Settings |
|------------|------|----------|
| `linkedin` | Text | - |
| `website` | Text | - |
| `github` | Text | - |
| `resumeUrl` | Text | - |

5. Click "Finish"
6. Click "Save"

---

### 1.3 Community

**Steps:**
1. Click "Create new single type"
2. Display name: `Community`
3. Click "Continue"
4. Add these fields:

| Field Name | Type | Settings |
|------------|------|----------|
| `name` | Text | Required |
| `href` | Text | Required |
| `note` | Long text | Required |

5. Click "Finish"
6. Click "Save"

---

## 2. Collection Types (7 total)

### 2.1 Experience

**Steps:**
1. Click "Create new collection type"
2. Display name: `Experience`
3. Click "Continue"
4. Add these fields:

| Field Name | Type | Settings |
|------------|------|----------|
| `company` | Text | Required |
| `title` | Text | Required |
| `dateRange` | Text | Required |
| `bullets` | JSON | Required |
| `order` | Number (integer) | Required, Default: 0 |

5. Click "Finish"
6. Click "Save"

**Example JSON for `bullets` field:**
```json
[
  "Create user-facing Help Center articles for Google Ads",
  "Develop internal documentation for support teams",
  "Write conversational content for AI-powered chatbots"
]
```

---

### 2.2 Project

**Steps:**
1. Click "Create new collection type"
2. Display name: `Project`
3. Click "Continue"
4. Add these fields:

| Field Name | Type | Settings |
|------------|------|----------|
| `title` | Text | Required |
| `blurb` | Long text | Required |
| `meta` | JSON | Required |
| `order` | Number (integer) | Required, Default: 0 |

5. Click "Finish"
6. Click "Save"

**Example JSON for `meta` field:**
```json
["WordPress", "SEO", "Analytics"]
```

---

### 2.3 Skill

**Steps:**
1. Click "Create new collection type"
2. Display name: `Skill`
3. Click "Continue"
4. Add these fields:

| Field Name | Type | Settings |
|------------|------|----------|
| `name` | Text | Required |
| `order` | Number (integer) | Required, Default: 0 |

5. Click "Finish"
6. Click "Save"

---

### 2.4 Education

**Steps:**
1. Click "Create new collection type"
2. Display name: `Education`
3. Click "Continue"
4. Add these fields:

| Field Name | Type | Settings |
|------------|------|----------|
| `school` | Text | Required |
| `degree` | Text | Required |
| `year` | Text | Required |
| `order` | Number (integer) | Required, Default: 0 |

5. Click "Finish"
6. Click "Save"

---

### 2.5 Certification

**Steps:**
1. Click "Create new collection type"
2. Display name: `Certification`
3. Click "Continue"
4. Add these fields:

| Field Name | Type | Settings |
|------------|------|----------|
| `issuer` | Text | Required |
| `name` | Text | Required |
| `order` | Number (integer) | Required, Default: 0 |

5. Click "Finish"
6. Click "Save"

---

### 2.6 Client

**Steps:**
1. Click "Create new collection type"
2. Display name: `Client`
3. Click "Continue"
4. Add these fields:

| Field Name | Type | Settings |
|------------|------|----------|
| `name` | Text | Required |
| `href` | Text | Required |
| `blurb` | Text | Required |
| `order` | Number (integer) | Required, Default: 0 |

5. Click "Finish"
6. Click "Save"

---

### 2.7 Latest Work

**Steps:**
1. Click "Create new collection type"
2. Display name: `Latest Work`
3. Click "Continue"
4. Add these fields:

| Field Name | Type | Settings |
|------------|------|----------|
| `kind` | Text | Required (e.g., "Article", "Video") |
| `title` | Text | Required |
| `href` | Text | Required |
| `meta` | Text | Required |
| `order` | Number (integer) | Required, Default: 0 |

5. Click "Finish"
6. Click "Save"

---

## 3. Configure API Permissions

**IMPORTANT:** You must make these content types publicly accessible for your website to fetch them.

**Steps:**
1. Go to **Settings** (in the left sidebar)
2. Click **Users & Permissions Plugin** → **Roles**
3. Click **Public**
4. For each content type you created, enable these permissions:
   - **Single Types** (Profile, Social Link, Community):
     - ✅ `find`
   - **Collection Types** (Experience, Project, Skill, Education, Certification, Client, Latest Work):
     - ✅ `find`
     - ✅ `findOne`
5. Click **Save** at the top right

---

## 4. Add Your Content

Now you can add your portfolio content!

1. Go to **Content Manager** (in the left sidebar)
2. Select a content type
3. Click **Create new entry**
4. Fill in the fields
5. Click **Save**
6. Click **Publish** (important!)

### Tips for Adding Content:

- **Order field**: Use numbers like 1, 2, 3, etc. to control the display order
- **JSON fields**: Click the JSON editor icon and paste valid JSON
- **Required fields**: Must be filled before you can save
- **Publish**: Content won't appear on your website until published

---

## 5. Update Your Frontend

Once you've added content to Strapi, update your `.env` file:

```env
VITE_STRAPI_URL=https://your-project.strapiapp.com
```

Replace `your-project.strapiapp.com` with your actual Strapi Cloud URL.

Then restart your dev server:
```bash
npm run dev
```

Your portfolio should now load content from Strapi! 🎉

---

## Quick Reference: All Content Types

| Content Type | Type | Fields |
|--------------|------|--------|
| Profile | Single | name, roles, summary, location, email, phone, availability |
| Social Link | Single | linkedin, website, github, resumeUrl |
| Community | Single | name, href, note |
| Experience | Collection | company, title, dateRange, bullets, order |
| Project | Collection | title, blurb, meta, order |
| Skill | Collection | name, order |
| Education | Collection | school, degree, year, order |
| Certification | Collection | issuer, name, order |
| Client | Collection | name, href, blurb, order |
| Latest Work | Collection | kind, title, href, meta, order |

---

## Troubleshooting

### Content not showing on website?

1. ✅ Check that content is **Published** (not just saved as draft)
2. ✅ Verify API permissions are set for **Public** role
3. ✅ Confirm `VITE_STRAPI_URL` in `.env` is correct
4. ✅ Restart your dev server after changing `.env`
5. ✅ Check browser console for errors

### Can't save content?

- Make sure all **Required** fields are filled
- For JSON fields, ensure valid JSON format
- Check that you're logged in to Strapi admin

### API returns 403 Forbidden?

- Go to Settings → Users & Permissions → Roles → Public
- Enable `find` and `findOne` permissions for all content types
- Click Save

---

## Next Steps

After creating all content types and adding your content:

1. ✅ Test locally with your Strapi Cloud URL
2. ✅ Deploy your frontend to GitHub Pages
3. ✅ Update production `.env` with Strapi Cloud URL
4. ✅ Enjoy managing your portfolio content through Strapi! 🚀
