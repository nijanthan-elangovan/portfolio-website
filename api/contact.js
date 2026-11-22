const RECIPIENT = "nijanthan.work@gmail.com";
const MAILTRAP_SEND_URL = "https://send.api.mailtrap.io/api/send";
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const BODY_LIMIT = 32 * 1024;
const WINDOW_MS = 10 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@<>,;:()[\]"\\]+@[a-z0-9.-]+\.[a-z0-9-]+$/i;
const SEND_ERROR = "Your message couldn’t be sent. Please try again or email me directly.";
const CAPTCHA_ERROR = "Complete the security check and try again.";

async function verifyTurnstile(secret, token, hostname, ip) {
    const payload = { secret, response: token };
    if (ip) payload.remoteip = ip;
    const response = await fetch(TURNSTILE_VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("Turnstile Siteverify request failed");
    const result = await response.json();
    return result.success === true && result.hostname === hostname && result.action === "contact";
}

async function readBody(request) {
    const reader = request.body?.getReader();
    if (!reader) throw new SyntaxError("Missing body");

    const decoder = new TextDecoder();
    let size = 0;
    let body = "";
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) return JSON.parse(body + decoder.decode());
            size += value.byteLength;
            if (size > BODY_LIMIT) {
                await reader.cancel().catch(() => {});
                return undefined;
            }
            body += decoder.decode(value, { stream: true });
        }
    } finally {
        reader.releaseLock();
    }
}

export function createContactHandler() {
    const attempts = new Map();
    let windowEnd = 0;
    let windowTotal = 0;

    return async function handleContact(request, env, ip) {
        const url = new URL(request.url);
        if (url.pathname !== "/api/contact") return new Response(null, { status: 404 });

        const headers = new Headers({
            "Cache-Control": "no-store",
            "Vary": "Origin",
            "Allow": "POST, OPTIONS",
        });
        const reply = (status, body) => Response.json(body, { status, headers });
        const origin = request.headers.get("origin");
        const allowedOrigins = (env.CONTACT_ALLOWED_ORIGINS ?? "https://njthnelvgn.com")
            .split(",").map((value) => value.trim());
        if (!origin || (origin !== url.origin && !allowedOrigins.includes(origin))) {
            return reply(403, { error: "This form is only available on the portfolio website." });
        }

        headers.set("Access-Control-Allow-Origin", origin);
        if (request.method === "OPTIONS") {
            headers.set("Access-Control-Allow-Methods", "POST");
            headers.set("Access-Control-Allow-Headers", "Content-Type");
            return new Response(null, { status: 204, headers });
        }
        if (request.method !== "POST") {
            return reply(405, { error: "Submit this form with a POST request." });
        }
        if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
            return reply(415, { error: "Submit this form as JSON." });
        }
        if (Number(request.headers.get("content-length")) > BODY_LIMIT) {
            return reply(413, { error: "Your message is too long." });
        }

        let data;
        try {
            data = await readBody(request);
        } catch {
            return reply(400, { error: "The form data couldn’t be read." });
        }
        if (data === undefined) return reply(413, { error: "Your message is too long." });
        if (typeof data?.website === "string" && data.website.trim()) return reply(200, { ok: true });

        const name = typeof data?.name === "string" ? data.name.trim() : "";
        const email = typeof data?.email === "string" ? data.email.trim() : "";
        const message = typeof data?.message === "string" ? data.message.trim() : "";
        if (!name || name.length > 80 || /[\r\n]/.test(name) ||
            email.length > 254 || !EMAIL_PATTERN.test(email) || !message || message.length > 3000) {
            return reply(400, { error: "Enter your name, a valid email address, and a message up to 3,000 characters." });
        }

        const token = env.MAILTRAP_API_TOKEN?.trim();
        const sender = env.MAILTRAP_FROM_EMAIL?.trim();
        const turnstileSecret = env.TURNSTILE_SECRET_KEY?.trim();
        if (!token || !EMAIL_PATTERN.test(sender ?? "") || !turnstileSecret) {
            console.error("Contact Mailtrap or Turnstile configuration is incomplete");
            return reply(503, { error: SEND_ERROR });
        }
        const captcha = typeof data?.captcha === "string" ? data.captcha.trim() : "";
        if (!captcha || captcha.length > 2048) return reply(400, { error: CAPTCHA_ERROR });
        try {
            if (!await verifyTurnstile(turnstileSecret, captcha, new URL(origin).hostname, ip)) {
                return reply(400, { error: CAPTCHA_ERROR });
            }
        } catch (error) {
            console.error("Contact Turnstile verification failed:", error.name);
            return reply(503, { error: "The security check is temporarily unavailable. Please try again." });
        }

        const now = Date.now();
        if (now >= windowEnd) {
            attempts.clear();
            windowEnd = now + WINDOW_MS;
            windowTotal = 0;
        }
        const count = attempts.get(ip) ?? 0;
        if (count >= 5 || windowTotal >= 50) {
            headers.set("Retry-After", Math.ceil((windowEnd - now) / 1000));
            return reply(429, { error: "Too many messages in a short time. Please try again later or email me directly." });
        }
        attempts.set(ip, count + 1);
        windowTotal += 1;

        try {
            const result = await fetch(MAILTRAP_SEND_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: { name: "Portfolio contact", email: sender },
                    to: [{ email: RECIPIENT }],
                    reply_to: { email },
                    subject: "New portfolio message",
                    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
                }),
                signal: AbortSignal.timeout(10_000),
            });
            if (result.ok) {
                if ((await result.json())?.success === true) return reply(200, { ok: true });
            } else {
                await result.body?.cancel();
            }
            console.error("Contact Mailtrap API rejected the message:", result.status);
        } catch (error) {
            console.error("Contact Mailtrap API request failed:", error.name);
        }
        return reply(502, { error: SEND_ERROR });
    };
}

const handleContact = createContactHandler();

export default {
    fetch(request, env) {
        return handleContact(request, env, request.headers.get("CF-Connecting-IP"));
    },
};
