# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Contact form

The form sends messages to `nijanthan.work@gmail.com` through Mailtrap SMTP, using the visitor’s address as Reply-To. Netlify publishes the frontend and serves the contact function at `/api/contact`.

1. Use the SMTP credentials from the Mailtrap Live Sending transactional stream. Set `MAILTRAP_FROM_EMAIL` to an address on your verified sending domain. [Mailtrap SMTP setup](https://docs.mailtrap.io/email-live-sending/setup/smtp-integration)
2. Set the `MAILTRAP_*` variables from [the example](./.env.example) in the linked Netlify project’s environment. Include the Functions scope when available. Push to the production branch to deploy, or trigger a new deploy after updating the variables. [Netlify function environment variables](https://docs.netlify.com/build/functions/environment-variables/)
3. Leave `VITE_CONTACT_API_URL` blank on Netlify to use the same-origin endpoint. If serving the frontend separately through GitHub Pages, set its `VITE_CONTACT_API_URL` repository variable to the full Netlify function URL and add the Pages origin to `CONTACT_ALLOWED_ORIGINS` on Netlify.

For local development, copy [.env.example](./.env.example) to `.env.local`, fill in the SMTP settings, leave `VITE_CONTACT_API_URL` blank, and run `npm run dev`. To test without delivering to Gmail, use Mailtrap Sandbox credentials. [Mailtrap Sandbox SMTP setup](https://docs.mailtrap.io/email-sandbox/setup/sandbox-smtp-integration)

## Search and crawler discovery

`npm run build` generates the homepage’s JSON-LD, `dist/llms.txt`, and a readable `dist/index.md` from [the portfolio content](./src/data/content.json). The sitemap lists the canonical homepage, and `robots.txt` keeps the public portfolio and its assets crawlable. Admin and 404 pages have their own `noindex` metadata. [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) · [llms.txt proposal](https://llmstxt.org/)
