# ⚠️ CRITICAL: Did You Add the Origin?

## Before anything else, answer this:

**Did you go to Google Cloud Console and add `http://127.0.0.1:5500` to your authorized origins?**

- [ ] YES - I went to Google Cloud Console
- [ ] YES - I found my OAuth 2.0 Client ID
- [ ] YES - I clicked the edit button (pencil icon)
- [ ] YES - I scrolled to "Authorized JavaScript origins"
- [ ] YES - I clicked "+ ADD URI"
- [ ] YES - I typed `http://127.0.0.1:5500`
- [ ] YES - I clicked SAVE
- [ ] YES - I waited 2-3 minutes
- [ ] YES - I cleared my browser cache
- [ ] YES - I refreshed the page

## If You Answered NO to Any of These:

**The app will NOT work until you complete ALL steps above.**

## Step-by-Step (Do This Now):

### 1. Open Google Cloud Console
Click: https://console.cloud.google.com/apis/credentials

### 2. Find Your OAuth Client
Look for the one that starts with: `423584880836-...`

### 3. Click the Pencil Icon
It's on the right side of the OAuth client row.

### 4. Scroll Down
Find the section "Authorized JavaScript origins"

### 5. Click "+ ADD URI"
A text box will appear.

### 6. Type This EXACTLY:
```
http://127.0.0.1:5500
```

### 7. Click SAVE
At the bottom of the page.

### 8. Wait
Set a timer for 3 minutes. Don't refresh yet.

### 9. Clear Cache
Press: Ctrl + Shift + Delete
Select "Cached images and files"
Click "Clear data"

### 10. Refresh
Press F5 or Ctrl + R

## Still Getting Errors?

If you completed ALL steps above and still get errors:

1. **Verify the origin was saved:**
   - Go back to Google Cloud Console
   - Edit your OAuth client again
   - Check that `http://127.0.0.1:5500` is in the list
   - If not, it didn't save - try again

2. **Check you're using the right port:**
   - Your browser shows: `http://127.0.0.1:5500`
   - The origin you added must match EXACTLY

3. **Try incognito mode:**
   - Open a new incognito/private window
   - Visit your app
   - Try signing in

4. **Wait longer:**
   - Sometimes Google takes up to 10 minutes
   - Be patient

## Common Mistakes:

❌ Adding `https://` instead of `http://`
❌ Adding `localhost` instead of `127.0.0.1`
❌ Adding wrong port number
❌ Not clicking SAVE
❌ Not waiting long enough
❌ Not clearing browser cache

## The Error Won't Go Away Until You Do This!

No amount of code changes will fix this. You MUST add the origin in Google Cloud Console.
