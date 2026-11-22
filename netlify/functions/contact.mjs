import { Readable } from "node:stream";
import handleContact from "../../api/contact.js";

export const config = { path: "/api/contact" };

export default async function contact(request, context) {
    const url = new URL(request.url);
    const incoming = request.body ? Readable.fromWeb(request.body) : Readable.from([]);
    incoming.method = request.method;
    incoming.headers = { ...Object.fromEntries(request.headers), host: url.host };
    incoming.socket = { encrypted: url.protocol === "https:", remoteAddress: context.ip };

    const headers = new Headers();
    let status = 200;
    let body = null;

    await handleContact(incoming, {
        setHeader(name, value) {
            headers.set(name, value);
        },
        writeHead(statusCode, responseHeaders) {
            status = statusCode;
            for (const [name, value] of Object.entries(responseHeaders)) headers.set(name, value);
        },
        end(content = null) {
            body = content;
        },
    });

    return new Response(body, { status, headers });
}
