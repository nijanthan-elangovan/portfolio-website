import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

const endpoint = import.meta.env.VITE_CONTACT_API_URL?.trim() || "/api/contact";
const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
const fallback = "Your message couldn’t be sent. Please try again or email me directly.";
const fieldClass = "w-full border-0 border-b border-ink-900/30 bg-transparent px-0 py-2 text-base text-ink-900 focus:border-mark focus:outline-none focus:ring-0 dark:border-paper-50/30 dark:text-paper-50 dark:focus:border-mark-light";
const fieldPreferences = {
    autoComplete: "off",
    autoCorrect: "off",
    autoCapitalize: "off",
    spellCheck: false,
    "data-1p-ignore": "",
    "data-lpignore": "true",
    "data-bwignore": "",
    "data-protonpass-ignore": "true",
    "data-form-type": "other",
    "data-gramm": "false",
    "data-gramm_editor": "false",
    "data-enable-grammarly": "false",
    "data-lt-active": "false",
};
let turnstileScript;

function loadTurnstile() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (!turnstileScript) {
        turnstileScript = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
            script.async = true;
            script.onload = () => {
                if (window.turnstile) resolve(window.turnstile);
                else reject(new Error("Turnstile API unavailable"));
            };
            script.onerror = () => {
                script.remove();
                reject(new Error("Unable to load Turnstile"));
            };
            document.head.append(script);
        }).catch((error) => {
            turnstileScript = undefined;
            throw error;
        });
    }
    return turnstileScript;
}

export default function ContactForm() {
    const submitting = useRef(false);
    const challengeElement = useRef(null);
    const widgetId = useRef(null);
    const [status, setStatus] = useState({ state: "idle", message: "" });
    const [captcha, setCaptcha] = useState("");
    const [challengeError, setChallengeError] = useState(false);
    const [challengeAttempt, setChallengeAttempt] = useState(0);
    const isSending = status.state === "sending";

    useEffect(() => {
        if (!siteKey) return;
        let active = true;
        let widget;
        loadTurnstile().then((turnstile) => {
            if (!active) return;
            widget = turnstile.render(challengeElement.current, {
                sitekey: siteKey,
                action: "contact",
                size: "flexible",
                appearance: "interaction-only",
                "response-field": false,
                callback: (token) => {
                    if (!active) return;
                    setCaptcha(token);
                    setChallengeError(false);
                },
                "expired-callback": () => {
                    if (active) setCaptcha("");
                },
                "error-callback": () => {
                    if (!active) return;
                    setCaptcha("");
                    setChallengeError(true);
                },
            });
            widgetId.current = widget;
        }).catch(() => {
            if (active) setChallengeError(true);
        });
        return () => {
            active = false;
            if (widget != null) window.turnstile.remove(widget);
            widgetId.current = null;
        };
    }, [challengeAttempt]);

    const submit = async (event) => {
        event.preventDefault();
        if (submitting.current || !captcha) return;

        const form = event.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        submitting.current = true;
        setStatus({ state: "sending", message: "" });

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, captcha }),
                signal: AbortSignal.timeout(25000),
            });
            const result = await response.json().catch(() => null);
            if (!response.ok || result?.ok !== true) {
                setStatus({ state: "error", message: result?.error || fallback });
                return;
            }
            form.reset();
            setStatus({ state: "sent", message: "Message sent. Thanks for reaching out." });
        } catch {
            setStatus({ state: "error", message: fallback });
        } finally {
            submitting.current = false;
            setCaptcha("");
            if (widgetId.current != null) window.turnstile.reset(widgetId.current);
        }
    };

    return (
        <form aria-label="Contact form" autoComplete="off" onSubmit={submit}>
            <fieldset disabled={isSending} className="min-w-0 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid min-w-0 gap-1.5 text-sm font-medium">
                        Name
                        <input {...fieldPreferences} className={fieldClass} name="name" maxLength={80} required />
                    </label>
                    <label className="grid min-w-0 gap-1.5 text-sm font-medium">
                        Email
                        <input {...fieldPreferences} className={fieldClass} name="email" type="email" maxLength={254} required />
                    </label>
                </div>
                <label className="grid gap-1.5 text-sm font-medium">
                    Message
                    <textarea {...fieldPreferences} className={`${fieldClass} contact-postcard-message min-h-32 resize-y`} name="message" rows={4} maxLength={3000} required />
                </label>
                <div hidden>
                    <label>
                        Website
                        <input {...fieldPreferences} name="website" tabIndex={-1} />
                    </label>
                </div>
                {siteKey && (
                    <div>
                        <div ref={challengeElement} />
                        {challengeError && (
                            <p role="alert" className="text-sm">
                                The security check couldn’t load.{" "}
                                <button type="button" className="underline underline-offset-4" onClick={() => {
                                    setCaptcha("");
                                    setChallengeError(false);
                                    setChallengeAttempt((attempt) => attempt + 1);
                                }}>Retry</button>
                            </p>
                        )}
                    </div>
                )}
                {!siteKey && <p role="status" className="text-sm">The form is unavailable. Please email me directly.</p>}
                {siteKey && !captcha && !challengeError && !isSending && <p role="status" className="text-sm">Waiting for the security check…</p>}
                <button type="submit" disabled={!captcha} className="inline-flex items-center gap-2 rounded-sm border-2 border-ink-900 bg-mark px-4 py-2.5 text-sm font-medium text-paper-50 shadow-[2px_2px_0_0_rgba(27,26,23,0.35)] hover:enabled:shadow-none disabled:opacity-60 dark:border-paper-50 dark:shadow-[2px_2px_0_0_rgba(247,242,230,0.35)] motion-safe:transition">
                    <Send className="size-4" aria-hidden="true" />
                    {isSending ? "Sending…" : "Send message"}
                </button>
            </fieldset>
            {status.message && (
                <p role={status.state === "error" ? "alert" : "status"} className={`mt-3 text-sm ${status.state === "error" ? "text-red-800 dark:text-red-300" : "text-ink-700 dark:text-paper-200"}`}>
                    {status.message}
                </p>
            )}
        </form>
    );
}
