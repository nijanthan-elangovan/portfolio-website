import { useEffect } from 'react';

/**
 * Custom SEO Component
 * Manages document head tags (Title, Meta, JSON-LD) without external dependencies.
 */
export default function SEO({
    title,
    description,
    canonical,
    openGraph,
    schema
}) {
    useEffect(() => {
        // 1. Update Title
        if (title) {
            document.title = title;
        }

        // 2. Helper to update/create meta tags
        const updateMeta = (selector, attribute, value) => {
            if (!value) return;
            let element = document.querySelector(selector);
            if (!element) {
                element = document.createElement('meta');

                // Parse selector to set attributes (e.g., meta[name="description"] -> name="description")
                const nameMatch = selector.match(/name="([^"]+)"/);
                const propertyMatch = selector.match(/property="([^"]+)"/);

                if (nameMatch) element.setAttribute('name', nameMatch[1]);
                if (propertyMatch) element.setAttribute('property', propertyMatch[1]);

                document.head.appendChild(element);
            }
            element.setAttribute(attribute, value);
        };

        // 3. Update Standard Metas
        updateMeta('meta[name="description"]', 'content', description);
        if (canonical) {
            let link = document.querySelector('link[rel="canonical"]');
            if (!link) {
                link = document.createElement('link');
                link.setAttribute('rel', 'canonical');
                document.head.appendChild(link);
            }
            link.setAttribute('href', canonical);
        }

        // 4. Update Open Graph / generic social
        if (openGraph) {
            updateMeta('meta[property="og:title"]', 'content', openGraph.title || title);
            updateMeta('meta[property="og:description"]', 'content', openGraph.description || description);
            updateMeta('meta[property="og:image"]', 'content', openGraph.image);
            updateMeta('meta[property="og:url"]', 'content', openGraph.url || canonical);
            updateMeta('meta[property="og:type"]', 'content', openGraph.type || 'website');
        }

        // 5. Inject JSON-LD Schema
        if (schema) {
            let script = document.querySelector('#schema-json-ld');
            if (!script) {
                script = document.createElement('script');
                script.setAttribute('id', 'schema-json-ld');
                script.setAttribute('type', 'application/ld+json');
                document.head.appendChild(script);
            }
            script.textContent = JSON.stringify(schema);
        }

    }, [title, description, canonical, openGraph, schema]);

    return null;
}
