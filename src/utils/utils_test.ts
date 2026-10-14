import { assertEquals, assertExists } from "@std/assert";
import { getSetCookies, parseCookies } from "./utils.ts";
Deno.test("Parses simple cookie", () => {
	const cookie =
		"testCookie=Hello%20world!; expires=Tue, 28-Nov-2023 10:28:45 GMT; Max-Age=7776000; path=/";
	const parsed = parseCookies(cookie);
	assertEquals(parsed.testCookie, "Hello world!");
});

Deno.test("Parses multiple cookies", () => {
	const cookies =
		"firstCookie=I'm%20the%20first%20cookie; expires=Tue, 28-Nov-2023 10:28:45 GMT; Max-Age=7776000; path=/, secondCookie=I'm%20the%20second%20cookie; expires=Tue, 28-Nov-2023 10:28:45 GMT; Max-Age=7776000; path=/";
	const parsed = parseCookies(cookies);
	assertEquals(parsed.firstCookie, "I'm the first cookie");
	assertEquals(parsed.secondCookie, "I'm the second cookie");
});

Deno.test("Parses cookie with no value", () => {
	const cookie =
		"cookieWithNoValue=; expires=Tue, 28-Nov-2023 10:28:45 GMT; Max-Age=7776000; path=/";
	const parsed = parseCookies(cookie);
	assertExists(parsed.cookieWithNoValue);
	assertEquals(parsed.cookieWithNoValue, "");
});

Deno.test("getSetCookies returns each Set-Cookie separately", () => {
	const h = new Headers();
	h.append(
		"set-cookie",
		"cc-session=abc; Path=/; Expires=Wed, 01 Jan 2027 00:00:00 GMT; HttpOnly",
	);
	h.append(
		"set-cookie",
		"parent_session_credentials=%7B%22session_id%22%3A%22s1%22%7D; Path=/",
	);
	const pairs = getSetCookies(h).map((c) => c.split(";")[0]);
	assertEquals(pairs, [
		"cc-session=abc",
		"parent_session_credentials=%7B%22session_id%22%3A%22s1%22%7D",
	]);
	const creds = parseCookies(pairs.join(",")).parent_session_credentials;
	assertEquals(JSON.parse(String(creds)).session_id, "s1");
});

Deno.test("getSetCookies fallback keeps Expires dates intact", () => {
	const h = {
		getSetCookie: undefined,
		get: () => "a=1; Expires=Wed, 01 Jan 2027 00:00:00 GMT; Path=/, b=2; Path=/",
	} as unknown as Headers;
	assertEquals(getSetCookies(h).map((c) => c.split(";")[0]), ["a=1", "b=2"]);
});
