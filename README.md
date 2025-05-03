This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# Facebook API Integration

Follow these steps to set up Facebook API integration:

1. Go to [Facebook Developers](https://developers.facebook.com/) and create a new app
2. Choose "Business" type app
3. Set up "Facebook Login" product
4. Add the following settings in Facebook Login setup:
   - Valid OAuth Redirect URIs: `http://localhost:3000/api/auth/facebook/callback` 
   - (Add your production URL too when deploying)
5. In Basic Settings, note your App ID and App Secret
6. Add to your .env.local file:

```
FACEBOOK_CLIENT_ID=your_app_id_here
FACEBOOK_CLIENT_SECRET=your_app_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

7. Restart your development server
8. Test connecting your Facebook account in the profile page
