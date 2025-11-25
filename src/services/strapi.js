/**
 * Strapi CMS API Service
 * Handles all communication with the Strapi backend
 */

// Get Strapi URL from environment variables
const RAW_STRAPI_URL = import.meta.env.VITE_STRAPI_URL || "";
const STRAPI_URL = RAW_STRAPI_URL
    ? /^https?:\/\//.test(RAW_STRAPI_URL)
        ? RAW_STRAPI_URL
        : `https://${RAW_STRAPI_URL}`
    : "";
const STRAPI_TOKEN = import.meta.env.VITE_STRAPI_TOKEN || "";

/**
 * Generic fetch helper for Strapi API
 * @param {string} path - API endpoint path
 * @returns {Promise<any>} - JSON response
 */
async function strapiGet(path) {
    if (!STRAPI_URL) {
        throw new Error("STRAPI_URL not configured");
    }

    const url = `${STRAPI_URL}/api${path}${path.includes("?") ? "&" : "?"}populate=*`;
    const headers = { "Content-Type": "application/json" };

    if (STRAPI_TOKEN) {
        headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
    }

    const res = await fetch(url, { headers });

    if (!res.ok) {
        throw new Error(`Strapi request failed: ${res.status} ${res.statusText}`);
    }

    return res.json();
}

/**
 * Fetch profile data (single type)
 */
export async function fetchProfile() {
    try {
        const response = await strapiGet("/profile");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch profile:", error);
        return null;
    }
}

/**
 * Fetch social links (single type)
 */
export async function fetchSocialLinks() {
    try {
        const response = await strapiGet("/social-link");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch social links:", error);
        return null;
    }
}

/**
 * Fetch experience entries (collection type)
 */
export async function fetchExperience() {
    try {
        const response = await strapiGet("/experiences?sort=order:asc");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch experience:", error);
        return null;
    }
}

/**
 * Fetch projects (collection type)
 */
export async function fetchProjects() {
    try {
        const response = await strapiGet("/projects?sort=order:asc");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch projects:", error);
        return null;
    }
}

/**
 * Fetch skills (collection type)
 */
export async function fetchSkills() {
    try {
        const response = await strapiGet("/skills?sort=order:asc");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch skills:", error);
        return null;
    }
}

/**
 * Fetch education entries (collection type)
 */
export async function fetchEducation() {
    try {
        const response = await strapiGet("/educations?sort=order:asc");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch education:", error);
        return null;
    }
}

/**
 * Fetch certifications (collection type)
 */
export async function fetchCertifications() {
    try {
        const response = await strapiGet("/certifications?sort=order:asc");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch certifications:", error);
        return null;
    }
}

/**
 * Fetch clients (collection type)
 */
export async function fetchClients() {
    try {
        const response = await strapiGet("/clients?sort=order:asc");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch clients:", error);
        return null;
    }
}

/**
 * Fetch latest work (collection type)
 */
export async function fetchLatestWork() {
    try {
        const response = await strapiGet("/latest-works?sort=order:asc");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch latest work:", error);
        return null;
    }
}

/**
 * Fetch community info (single type)
 */
export async function fetchCommunity() {
    try {
        const response = await strapiGet("/community");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch community:", error);
        return null;
    }
}

/**
 * Fetch all CMS content at once
 * @returns {Promise<Object>} - Object containing all CMS data
 */
export async function fetchAllContent() {
    try {
        const [
            profile,
            socialLinks,
            experience,
            projects,
            skills,
            education,
            certifications,
            clients,
            latestWork,
            community,
        ] = await Promise.all([
            fetchProfile(),
            fetchSocialLinks(),
            fetchExperience(),
            fetchProjects(),
            fetchSkills(),
            fetchEducation(),
            fetchCertifications(),
            fetchClients(),
            fetchLatestWork(),
            fetchCommunity(),
        ]);

        return {
            profile,
            socialLinks,
            experience,
            projects,
            skills,
            education,
            certifications,
            clients,
            latestWork,
            community,
        };
    } catch (error) {
        console.error("Failed to fetch CMS content:", error);
        return {};
    }
}

/**
 * Check if Strapi is configured and available
 */
export function isStrapiConfigured() {
    return Boolean(STRAPI_URL);
}
