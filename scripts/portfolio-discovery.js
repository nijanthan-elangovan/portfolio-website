import { resolve } from "node:path";

const SITE_URL = "https://njthnelvgn.com/";
const SOCIAL_IMAGE = "https://res.cloudinary.com/nijanthan/image/upload/f_auto,q_auto/v1765621694/all-devices-white_fi2jmy.png";
const HTML_ENTITIES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);
const isWebLink = (href) => typeof href === "string" && /^https?:\/\//i.test(href);
const markdownText = (value) => String(value ?? "").replace(/\s+/g, " ").trim().replace(/[\\[\]]/g, "\\$&");
const markdownLink = (label, href) => `[${markdownText(label)}](${href.replaceAll("(", "%28").replaceAll(")", "%29")})`;
const heading = (value, level = 2) => `${"#".repeat(level)} ${markdownText(value)}`;
const bullet = (item) => `- ${item}`;

export function portfolioDiscovery(content) {
    const { PROFILE: profile, NOW: current, SOCIALS: socials } = content;
    const title = `${profile.name} | ${profile.roles[0]}`;
    const description = `${profile.name} is a ${profile.roles[0].toLowerCase()} at ${current.company}. See published work, writing projects, and experience in technical documentation, automation, and web development.`;
    const homepage = resolve("index.html");

    const profiles = [
        ["LinkedIn", socials.linkedin],
        ["GitHub", socials.github],
        ["Medium articles", socials.medium],
    ].filter(([, href]) => isWebLink(href));
    const published = content.LATEST.filter((item) => item.featured !== false && isWebLink(item.href));
    const workLinks = published.map(({ title, href }) => markdownLink(title, href));
    const profileLinks = profiles.map(([label, href]) => markdownLink(label, href));
    const contactLink = markdownLink(`Contact ${profile.name}`, `${SITE_URL}#contact`);

    const llms = [
        heading(profile.name, 1),
        "",
        `> ${markdownText(profile.name)} is a ${markdownText(profile.roles[0].toLowerCase())} at ${markdownText(current.company)}. This portfolio collects published work, projects, and professional experience.`,
        "",
        heading("Portfolio"),
        bullet(markdownLink("Portfolio in Markdown with experience, projects, skills, and education", `${SITE_URL}index.md`)),
        bullet(markdownLink("Portfolio homepage", SITE_URL)),
        "",
        heading("Selected published work"),
        ...workLinks.map(bullet),
        "",
        heading("Profiles and contact"),
        ...[...profileLinks, contactLink].map(bullet),
    ].join("\n") + "\n";

    const markdown = [
        heading(profile.name, 1),
        markdownLink("Portfolio homepage", SITE_URL),
        "",
        markdownText(profile.summary),
        "",
        markdownText(profile.location),
        "",
        heading("Current role"),
        markdownText(`${current.title} at ${current.company}`),
        ...current.bullets.map((item) => bullet(markdownText(item))),
        "",
        heading("Experience"),
        ...content.EXPERIENCE.flatMap((role) => [
            heading(`${role.title} at ${role.company}`, 3),
            markdownText(role.range),
            ...role.bullets.map((item) => bullet(markdownText(item))),
            "",
        ]),
        heading("Selected projects"),
        ...content.PROJECTS.filter((project) => project.featured !== false).flatMap((project) => [
            heading(project.title, 3),
            markdownText(project.blurb),
            ...(isWebLink(project.href) ? [markdownLink("Project link", project.href)] : []),
            "",
        ]),
        heading("Published work"),
        ...workLinks.map(bullet),
        "",
        heading("Clients"),
        ...content.CLIENTS.filter((client) => client.featured !== false).map(({ name, href, blurb }) =>
            bullet(`${isWebLink(href) ? markdownLink(name, href) : markdownText(name)} — ${markdownText(blurb)}`)),
        "",
        heading("Skills and tools"),
        ...content.SKILLS.map(({ category, items }) => bullet(markdownText(`${category} — ${items.join(", ")}`))),
        "",
        heading("Education and certification"),
        ...content.EDUCATION.map(({ school, degree, year }) => bullet(markdownText(`${degree} at ${school} (${year})`))),
        ...content.CERTS.map(({ issuer, name }) => bullet(markdownText(`${name} certification from ${issuer}`))),
        "",
        heading("Volunteering"),
        isWebLink(content.COMMUNITY.href)
            ? markdownLink(content.COMMUNITY.name, content.COMMUNITY.href)
            : markdownText(content.COMMUNITY.name),
        markdownText(content.COMMUNITY.note),
        "",
        heading("Profiles and contact"),
        ...[...profileLinks, contactLink].map(bullet),
    ].join("\n") + "\n";

    const personId = `${SITE_URL}#person`;
    const websiteId = `${SITE_URL}#website`;
    const pageId = `${SITE_URL}#profilepage`;
    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Person",
                "@id": personId,
                name: profile.name,
                url: SITE_URL,
                jobTitle: current.title,
                description: profile.summary,
                email: profile.email,
                ...(profiles.length ? { sameAs: profiles.map(([, href]) => href) } : {}),
                worksFor: { "@type": "Organization", name: current.company },
                alumniOf: content.EDUCATION.map(({ school }) => ({ "@type": "EducationalOrganization", name: school })),
                mainEntityOfPage: { "@id": pageId },
            },
            {
                "@type": "WebSite",
                "@id": websiteId,
                url: SITE_URL,
                name: profile.name,
                inLanguage: "en",
                publisher: { "@id": personId },
            },
            {
                "@type": "ProfilePage",
                "@id": pageId,
                url: SITE_URL,
                name: title,
                description,
                inLanguage: "en",
                isPartOf: { "@id": websiteId },
                mainEntity: { "@id": personId },
            },
        ],
    };

    const files = new Map([
        ["llms.txt", { source: llms, type: "text/plain; charset=utf-8" }],
        ["index.md", { source: markdown, type: "text/markdown; charset=utf-8" }],
    ]);
    const meta = (key, value, kind = "name") => ({
        tag: "meta", attrs: { [kind]: key, content: value }, injectTo: "head",
    });
    const fallback = `<main style="max-width:48rem;margin:3rem auto;padding:0 1rem">
        <h1>${escapeHtml(profile.name)}</h1>
        <p>${escapeHtml(profile.summary)}</p>
        <p>${escapeHtml(current.title)} at ${escapeHtml(current.company)}</p>
        <p><a href="${SITE_URL}index.md">Read the portfolio as Markdown</a></p>
        <h2>Published work</h2>
        <ul>${published.map((item) => `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.title)}</a></li>`).join("")}</ul>
        <h2 id="contact">Contact</h2>
        <p><a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a></p>
    </main>`;

    return {
        name: "portfolio-discovery",
        transformIndexHtml(_, context) {
            if (resolve(context.filename) !== homepage) return;
            return [
                { tag: "title", children: escapeHtml(title), injectTo: "head" },
                meta("description", description),
                meta("author", profile.name),
                meta("og:type", "website", "property"),
                meta("og:url", SITE_URL, "property"),
                meta("og:site_name", profile.name, "property"),
                meta("og:title", title, "property"),
                meta("og:description", description, "property"),
                meta("og:image", SOCIAL_IMAGE, "property"),
                meta("twitter:card", "summary_large_image"),
                meta("twitter:title", title),
                meta("twitter:description", description),
                meta("twitter:image", SOCIAL_IMAGE),
                { tag: "link", attrs: { rel: "canonical", href: SITE_URL }, injectTo: "head" },
                { tag: "link", attrs: { rel: "sitemap", type: "application/xml", href: `${SITE_URL}sitemap.xml` }, injectTo: "head" },
                { tag: "link", attrs: { rel: "describedby", href: `${SITE_URL}llms.txt` }, injectTo: "head" },
                { tag: "link", attrs: { rel: "alternate", type: "text/markdown", href: `${SITE_URL}index.md` }, injectTo: "head" },
                {
                    tag: "script",
                    attrs: { type: "application/ld+json" },
                    children: JSON.stringify(schema).replaceAll("<", "\\u003c"),
                    injectTo: "head",
                },
                { tag: "noscript", children: fallback, injectTo: "body" },
            ];
        },
        configureServer(server) {
            server.middlewares.use((request, response, next) => {
                const path = request.url.split("?")[0];
                const file = files.get(path.slice(server.config.base.length));
                if (!path.startsWith(server.config.base) || !file || !["GET", "HEAD"].includes(request.method)) {
                    return next();
                }
                response.setHeader("Content-Type", file.type);
                response.end(request.method === "HEAD" ? undefined : file.source);
            });
        },
        generateBundle() {
            for (const [fileName, { source }] of files) this.emitFile({ type: "asset", fileName, source });
        },
    };
}
