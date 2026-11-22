import { Buffer } from "node:buffer";
import process from "node:process";
import nodemailer from "nodemailer";

const RECIPIENT = "nijanthan.work@gmail.com";
const BODY_LIMIT = 32 * 1024;
const WINDOW_MS = 10 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@<>,;:()[\]"\\]+@[a-z0-9.-]+\.[a-z0-9-]+$/i;
const SEND_ERROR = "Your message couldn’t be sent. Please try again or email me directly.";

function reply(response, status, body) {
    response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(body));
}

async function readBody(request) {
    const parsed = request.body;
    if (parsed !== undefined) {
        return Buffer.byteLength(JSON.stringify(parsed)) <= BODY_LIMIT ? parsed : undefined;
    }

    const chunks = [];
    let size = 0;
    for await (const chunk of request.iterator({ destroyOnReturn: false })) {
        size += chunk.length;
        if (size > BODY_LIMIT) {
            request.resume();
            return undefined;
        }
        chunks.push(chunk);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export function createContactHandler(env = process.env) {
    const allowedOrigins = (env.CONTACT_ALLOWED_ORIGINS ?? "https://njthnelvgn.com")
        .split(",").map((origin) => origin.trim());
    const isVercel = env.VERCEL === "1";
    const sender = env.MAILTRAP_FROM_EMAIL?.trim();
    const port = Number(env.MAILTRAP_SMTP_PORT || 587);
    const user = env.MAILTRAP_SMTP_USER;
    const pass = env.MAILTRAP_SMTP_PASSWORD;
    const transport = user && pass && EMAIL_PATTERN.test(sender ?? "") && Number.isInteger(port) && port > 0 && port <= 65535
        ? nodemailer.createTransport({
            host: env.MAILTRAP_SMTP_HOST || "live.smtp.mailtrap.io",
            port,
            secure: port === 465,
            requireTLS: port !== 465,
            auth: { user, pass },
            connectionTimeout: 8000,
            greetingTimeout: 5000,
            socketTimeout: 12000,
            disableFileAccess: true,
            disableUrlAccess: true,
        })
        : null;
    const attempts = new Map();
    let windowEnd = 0;
    let windowTotal = 0;

    return async function handleContact(request, response) {
        response.setHeader("Cache-Control", "no-store");
        response.setHeader("Vary", "Origin");
        response.setHeader("Allow", "POST, OPTIONS");
        const origin = request.headers.origin;
        const sameOrigin = `${isVercel || request.socket.encrypted ? "https" : "http"}://${request.headers.host}`;

        if (!origin || (origin !== sameOrigin && !allowedOrigins.includes(origin))) {
            return reply(response, 403, { error: "This form is only available on the portfolio website." });
        }
        response.setHeader("Access-Control-Allow-Origin", origin);
        if (request.method === "OPTIONS") {
            response.writeHead(204, {
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Headers": "Content-Type",
            });
            return response.end();
        }
        if (request.method !== "POST") {
            return reply(response, 405, { error: "Submit this form with a POST request." });
        }
        if (request.headers["content-type"]?.split(";")[0].trim().toLowerCase() !== "application/json") {
            return reply(response, 415, { error: "Submit this form as JSON." });
        }
        if (Number(request.headers["content-length"]) > BODY_LIMIT) {
            return reply(response, 413, { error: "Your message is too long." });
        }

        let data;
        try {
            data = await readBody(request);
        } catch {
            return reply(response, 400, { error: "The form data couldn’t be read." });
        }
        if (data === undefined) return reply(response, 413, { error: "Your message is too long." });
        if (typeof data?.website === "string" && data.website.trim()) return reply(response, 200, { ok: true });

        const name = typeof data?.name === "string" ? data.name.trim() : "";
        const email = typeof data?.email === "string" ? data.email.trim() : "";
        const message = typeof data?.message === "string" ? data.message.trim() : "";
        if (!name || name.length > 80 || /[\r\n]/.test(name) ||
            email.length > 254 || !EMAIL_PATTERN.test(email) || !message || message.length > 3000) {
            return reply(response, 400, { error: "Enter your name, a valid email address, and a message up to 3,000 characters." });
        }
        if (!transport) return reply(response, 503, { error: SEND_ERROR });

        const now = Date.now();
        if (now >= windowEnd) {
            attempts.clear();
            windowEnd = now + WINDOW_MS;
            windowTotal = 0;
        }
        const forwarded = isVercel ? request.headers["x-vercel-forwarded-for"] : null;
        const ip = forwarded?.split(",")[0].trim() || request.socket.remoteAddress;
        const count = attempts.get(ip) ?? 0;
        if (count >= 5 || windowTotal >= 50) {
            response.setHeader("Retry-After", Math.ceil((windowEnd - now) / 1000));
            return reply(response, 429, { error: "Too many messages in a short time. Please try again later or email me directly." });
        }
        attempts.set(ip, count + 1);
        windowTotal += 1;

        try {
            await transport.sendMail({
                from: { name: "Portfolio contact", address: sender },
                to: RECIPIENT,
                replyTo: { address: email },
                subject: "New portfolio message",
                text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
            });
            return reply(response, 200, { ok: true });
        } catch (error) {
            console.error("Contact SMTP error:", error.code || "UNKNOWN");
            return reply(response, 502, { error: SEND_ERROR });
        }
    };
}

export default createContactHandler();
