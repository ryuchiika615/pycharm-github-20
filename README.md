# Shift Board

Part-time shift request and manager scheduling prototype.

## How to try

Open `index.html` in a browser.

Default login:

- Manager: 店長 / `1234`
- Staff: any staff member / `1111`

## Render

Use Render Static Site.

- Build Command: leave empty
- Publish Directory: `.`

## Shared data

The app works without setup, but then data is saved only in the current browser.

To share shift requests between staff and manager:

1. Create a free Supabase project.
2. Open Supabase SQL Editor.
3. Run `supabase_schema.sql`.
4. Copy the project URL and anon key.
5. Paste them into `supabase-config.js`.

Default login:

- Manager: 店長 / `1234`
- Staff: any staff member / `1111`

This is a practical first version. For stronger security, replace the 4-digit PIN check with Supabase Auth later.
