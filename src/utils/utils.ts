/**
 * Parse cookies from string
 * @param input Input string
 * @returns Object of cookies
 */
export function parseCookies(input: string) {
	const output: Record<string, unknown> = {};
	const cookies = input.split(",");
	for (const cookie of cookies) {
		const cookieSplit = cookie.split(";")[0].split("=");
		output[decodeURIComponent(cookieSplit[0]).trimStart()] = decodeURIComponent(
			cookieSplit[1],
		);
	}
	return output;
}

/**
 * Return every Set-Cookie header separately. `headers.get("set-cookie")`
 * joins them with ", ", which also appears inside Expires dates.
 * @param headers Response headers
 * @returns Array of raw Set-Cookie values
 */
export function getSetCookies(headers: Headers): string[] {
	if (typeof headers.getSetCookie === "function") {
		const list = headers.getSetCookie();
		if (list.length) return list;
	}
	const raw = headers.get("set-cookie");
	if (!raw) return [];
	// Split only on commas that start a new cookie, not ones inside dates.
	return raw.split(/,(?=\s*[^;,=\s]+=)/).map((c) => c.trim());
}
