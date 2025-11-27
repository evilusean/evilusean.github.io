# Fix: Access Blocked - Add Test User

## The Error:
```
Access blocked: Sesh-Seans has not completed the Google verification process
Error 403: access_denied
```

## What This Means:
Your OAuth app is in "Testing" mode and you need to add yourself (and anyone else who will use it) as a test user.

## Quick Fix (2 minutes):

### Step 1: Go to OAuth Consent Screen
https://console.cloud.google.com/apis/credentials/consent

### Step 2: Scroll Down to "Test users"
You'll see a section called "Test users"

### Step 3: Click "+ ADD USERS"

### Step 4: Add Your Email
Type your email address: `evilusean@gmail.com`

Click "ADD"

### Step 5: Save
Click "SAVE" at the bottom

### Step 6: Try Again
Go back to your app and click "Sign in with Google" again.

## That's It!
You should now be able to sign in.

## Add More Users:
If you want others to use your app while it's in testing mode:
1. Go back to the OAuth consent screen
2. Add their email addresses as test users
3. They can now sign in

## Alternative: Publish Your App

If you want anyone to be able to use it without being added as a test user:

1. Go to OAuth consent screen
2. Click "PUBLISH APP"
3. Note: For personal use, you don't need to go through Google's verification process
4. Your app will show a warning that it's "unverified" but users can click "Advanced" → "Go to [app name]"

## For Personal Use Only:
Just add yourself as a test user. That's the easiest solution!

## Limits:
- Testing mode: Up to 100 test users
- Published (unverified): Anyone can use it, but they'll see a warning screen

## Summary:
✅ Go to: https://console.cloud.google.com/apis/credentials/consent
✅ Scroll to "Test users"
✅ Click "+ ADD USERS"
✅ Add: evilusean@gmail.com
✅ Click "SAVE"
✅ Try signing in again
