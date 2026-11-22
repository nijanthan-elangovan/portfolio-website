# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Contact form

GitHub Pages serves the portfolio. A Cloudflare Worker handles `https://njthnelvgn.com/api/contact` and sends messages to `nijanthan.work@gmail.com` through Mailtrap’s HTTPS API, using the visitor’s address as Reply-To.

1. Use a Mailtrap Live Sending token for the transactional stream. Set `MAILTRAP_FROM_EMAIL` to an address on your verified sending domain. [Mailtrap API setup](https://docs.mailtrap.io/email-api-smtp/setup/api-integration)
2. Run `npx wrangler deploy` with access to the Cloudflare zone. Configure `MAILTRAP_API_TOKEN` and `MAILTRAP_FROM_EMAIL` as Worker secrets using the Cloudflare dashboard or `npx wrangler secret put <NAME>`. [Cloudflare Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
3. Leave `VITE_CONTACT_API_URL` blank for the custom-domain build. For a frontend served from another origin, set it to the full Worker URL and add that frontend origin to the Worker’s `CONTACT_ALLOWED_ORIGINS` variable.

For local development, copy [.env.example](./.env.example) to `.env.local`, fill in the Mailtrap settings, leave `VITE_CONTACT_API_URL` blank, and run `npm run dev`. An `OPTIONS` request with an allowed `Origin` header can check the endpoint without sending email.

## Search and crawler discovery

`npm run build` generates the homepage’s JSON-LD, `dist/llms.txt`, and a readable `dist/index.md` from [the portfolio content](./src/data/content.json). The sitemap lists the canonical homepage, and `robots.txt` keeps the public portfolio and its assets crawlable. Admin and 404 pages have their own `noindex` metadata. [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) · [llms.txt proposal](https://llmstxt.org/)
