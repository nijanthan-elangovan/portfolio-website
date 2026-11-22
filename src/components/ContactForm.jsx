import { useRef, useState } from "react";
import { Send } from "lucide-react";

const endpoint = import.meta.env.VITE_CONTACT_API_URL?.trim() || "/api/contact";
const fallback = "Your message couldn’t be sent. Please try again or email me directly.";
const fieldClass = "w-full rounded-sm border border-ink-900/25 bg-paper-50 px-3 py-2 text-base text-ink-900 dark:border-paper-50/25 dark:bg-ink-900 dark:text-paper-50";

export default function ContactForm() {
    const submitting = useRef(false);
    const [status, setStatus] = useState({ state: "idle", message: "" });
    const isSending = status.state === "sending";

    const submit = async (event) => {
        event.preventDefault();
        if (submitting.current) return;

        const form = event.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        submitting.current = true;
        setStatus({ state: "sending", message: "" });

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
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
        }
    };

    return (
        <form aria-label="Contact form" onSubmit={submit}>
            <fieldset disabled={isSending} className="min-w-0 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid min-w-0 gap-1.5 text-sm font-medium">
                        Name
                        <input className={fieldClass} name="name" autoComplete="name" maxLength={80} required />
                    </label>
                    <label className="grid min-w-0 gap-1.5 text-sm font-medium">
                        Email
                        <input className={fieldClass} name="email" type="email" autoComplete="email" maxLength={254} required />
                    </label>
                </div>
                <label className="grid gap-1.5 text-sm font-medium">
                    Message
                    <textarea className={`${fieldClass} min-h-28 resize-y`} name="message" rows={4} maxLength={3000} required />
                </label>
                <div hidden>
                    <label>
                        Website
                        <input name="website" tabIndex={-1} autoComplete="off" />
                    </label>
                </div>
                <button type="submit" className="inline-flex items-center gap-2 rounded-sm border-2 border-ink-900 bg-mark px-4 py-2.5 text-sm font-medium text-paper-50 shadow-[2px_2px_0_0_rgba(27,26,23,0.35)] hover:enabled:shadow-none disabled:cursor-wait disabled:opacity-70 dark:border-paper-50 dark:shadow-[2px_2px_0_0_rgba(247,242,230,0.35)] motion-safe:transition">
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
