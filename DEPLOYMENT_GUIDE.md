# SourceTrace - Deployment Guide

## Quick Start: GitHub → Replit

This guide walks you through pushing SourceTrace to GitHub and deploying on Replit for your demo.

---

## Step 1: Push to GitHub (Private Repo)

### Initialize Git (if not already done)
```bash
cd /Users/zgulick/Downloads/sourcetrace-prototype
git init
git add .
git commit -m "Initial commit: SourceTrace MVP complete"
```

### Create GitHub Repository

1. Go to https://github.com/new
2. **Repository name:** `sourcetrace-prototype` (or your choice)
3. **Visibility:** ✅ **Private** (recommended)
4. **DO NOT** initialize with README, .gitignore, or license (you already have them)
5. Click "Create repository"

### Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/sourcetrace-prototype.git

# Push to main branch
git branch -M main
git push -u origin main
```

**Important:** You'll be prompted for credentials. Use a **Personal Access Token** (not password):
- GitHub → Settings → Developer settings → Personal access tokens → Generate new token
- Select scopes: `repo` (full control of private repositories)
- Copy token and use as password

---

## Step 2: Import to Replit

### Create New Repl from GitHub

1. Go to https://replit.com
2. Click **"+ Create Repl"**
3. Select **"Import from GitHub"**
4. Authorize Replit to access your private repos (if first time)
5. Select your `sourcetrace-prototype` repository
6. Click **"Import from GitHub"**

### Configure Replit

Replit should auto-detect it's a Python project. If not:

1. **Language:** Python
2. **Run command:** `python app.py`

---

## Step 3: Configure Environment Variables

**CRITICAL:** Set up your OpenAI API key in Replit:

1. Click **"Secrets"** in left sidebar (lock icon)
2. Add secret:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** Your OpenAI API key (from .env file)
3. Click "Add new secret"
4. Add additional secrets:
   - **Key:** `OPENAI_MODEL`
   - **Value:** `gpt-4o-mini`
   - **Key:** `FLASK_SECRET_KEY`
   - **Value:** `your-secret-key-here`

**Replit will automatically load these as environment variables.**

---

## Step 4: Install Dependencies

Replit should auto-install from `requirements.txt`. If not:

1. Open **Shell** in Replit
2. Run:
```bash
pip install -r requirements.txt
```

---

## Step 5: Run the Application

1. Click **"Run"** button at top
2. Wait for Flask server to start
3. Replit will show you a web preview

**Expected output:**
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://0.0.0.0:5000
```

---

## Step 6: Access the Application

Replit provides a public URL for your app:

- Look for the URL at top of preview window
- Format: `https://sourcetrace-prototype-YOUR_USERNAME.replit.app`
- Share this URL for your demo!

---

## Troubleshooting

### Issue: Dependencies Not Installing

**Solution:**
```bash
# In Replit Shell
pip install --upgrade pip
pip install -r requirements.txt
```

### Issue: "OPENAI_API_KEY not found"

**Solution:**
- Verify secret is set in Replit Secrets tab
- Restart the Repl (Stop → Run)
- Check .env.example has correct format

### Issue: "Port 5000 already in use"

**Solution:**
Replit sometimes has multiple processes. In Shell:
```bash
pkill python
# Then click Run again
```

### Issue: "Module not found"

**Solution:**
```bash
# Install specific missing module
pip install openai==2.6.1
pip install c2pa-python==0.4.0
```

### Issue: c2pa-python Installation Fails

**Note:** c2pa-python requires Rust compiler. If it fails in Replit:

**Option 1:** Remove C2PA from requirements.txt (graceful degradation works)
**Option 2:** Use Replit's Nix configuration to install Rust

For demo purposes, Option 1 is fine - the system handles C2PA absence gracefully.

---

## Demo Tips

### Best Practices for Demo

1. **Keep Replit Running:**
   - Don't stop the Repl during demo
   - Replit sleeps after inactivity - wake it up before demo

2. **Test Before Demo:**
   - Upload a test image 15 minutes before
   - Verify all features work
   - Check OpenAI API usage (avoid rate limits)

3. **Have Backup Images Ready:**
   - Your GoPro photo (60% confidence)
   - NBC LeBron image (20% confidence)
   - Shows range of results

4. **Prepare Talking Points:**
   - "Real C2PA implementation" (differentiator)
   - "AI-powered confidence scoring"
   - "4-7 second analysis time"
   - "Production-ready error handling"

### Demo Flow

1. **Show Upload:**
   - Drag and drop your GoPro photo
   - Point out progress indicators

2. **Show Results:**
   - Confidence gauge animation
   - Color-coded recommendation
   - Three signal cards (EXIF, C2PA, Reverse Search)

3. **Show Contrast:**
   - Upload NBC image
   - Point out lower confidence (20%)
   - Explain why: "No metadata, correctly flagged as high risk"

4. **Show Outreach Generation:**
   - Click "Generate Outreach Message"
   - Show AI-generated professional message
   - Copy to clipboard

5. **Explain Key Features:**
   - C2PA integration (future-proof)
   - Graceful degradation (production-ready)
   - Fast performance (3-7s vs 60s target)

---

## Files to Commit to GitHub

**Include:**
- ✅ All `.py` files
- ✅ All `.md` documentation
- ✅ `requirements.txt`
- ✅ `.env.example` (template)
- ✅ `.gitignore`
- ✅ `templates/` and `static/` folders
- ✅ `utils/` package
- ✅ Test files

**Exclude (via .gitignore):**
- ❌ `.env` (contains secrets!)
- ❌ `venv/` (virtual environment)
- ❌ `__pycache__/` (Python cache)
- ❌ `test_image.jpg` (temporary test files)
- ❌ `.DS_Store` (Mac system files)

---

## Replit-Specific Considerations

### Auto-Sleep
Replit free tier sleeps after inactivity. Before demo:
1. Visit URL to wake it up
2. Wait 30 seconds for full startup
3. Test one upload to ensure everything works

### Rate Limits
OpenAI API has rate limits. For demo:
- Test 2-3 times maximum before demo
- Keep API key funded
- Monitor usage at platform.openai.com

### Performance
Replit may be slower than local:
- Expect 5-10 seconds instead of 3-7 seconds
- Cold start may take 15-20 seconds first time
- This is normal and acceptable for demo

---

## Alternative: Deploy Elsewhere

If Replit has issues, alternatives:

### Render.com (Free Tier)
1. Connect GitHub repo
2. Select "Web Service"
3. Set environment variables
4. Deploy

### Railway.app (Free Trial)
1. Connect GitHub repo
2. Add environment variables
3. Deploy automatically

### Heroku (Paid)
1. `heroku create sourcetrace-demo`
2. `heroku config:set OPENAI_API_KEY=your_key`
3. `git push heroku main`

---

## Security Checklist Before Pushing

✅ **Check .env is in .gitignore**
```bash
cat .gitignore | grep .env
# Should show: .env
```

✅ **Verify no secrets in code**
```bash
grep -r "sk-" . --exclude-dir=venv --exclude-dir=.git
# Should return nothing
```

✅ **Check .env.example doesn't have real keys**
```bash
cat .env.example
# Should show placeholders only
```

✅ **Remove test images**
```bash
rm test_image.jpg 2>/dev/null
```

---

## Post-Demo Cleanup (Optional)

After your interview/demo:

1. **Revoke GitHub token** (if created temporary one)
2. **Delete Replit deployment** (if not needed)
3. **Keep GitHub repo** (portfolio piece!)
4. **Monitor OpenAI usage** (avoid unexpected charges)

---

## Summary: Quick Deployment Steps

```bash
# 1. Ensure .env is not tracked
git status | grep .env
# Should NOT show .env (only .env.example)

# 2. Commit all changes
git add .
git commit -m "Ready for demo: SourceTrace MVP complete"

# 3. Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/sourcetrace-prototype.git
git push -u origin main

# 4. Import to Replit
# - Visit replit.com
# - Import from GitHub
# - Add secrets (OPENAI_API_KEY)
# - Click Run

# 5. Test before demo
# - Upload test image
# - Verify results display
# - Test outreach generation
```

---

**You're ready to deploy! 🚀**

The repo is demo-ready with comprehensive documentation, working code, and production-quality error handling.
