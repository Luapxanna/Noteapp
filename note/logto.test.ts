import { describe, expect, test } from "vitest";
import { logto, logtoConfig } from "./logto";

// Mock environment variables for testing
process.env.LOGTO_ENDPOINT = "https://gtkmrh.logto.app/";
process.env.LOGTO_APP_ID = "0o7i0yad4486g18w7jbxo";
process.env.LOGTO_APP_SECRET = "WKmb31SpefUnkjmrnU8AdlL9f0rA7p6a";
process.env.BASE_URL = "http://localhost:4000";

describe("Logto Integration", () => {
    test("should initialize Logto client", () => {
        expect(logto).toBeDefined();
        expect(logtoConfig).toBeDefined();
        expect(logtoConfig.endpoint).toBe(process.env.LOGTO_ENDPOINT);
        expect(logtoConfig.appId).toBe(process.env.LOGTO_APP_ID);
    });

    test("should handle authentication flow", async () => {
        // Test getting access token
        const token = await logto.getAccessToken();
        expect(token).toBeDefined();

        // Test token is valid by making an API request
        const response = await fetch(`${process.env.LOGTO_ENDPOINT}/oidc/userinfo`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error('Authentication failed:', await response.text());
        }
        expect(response.ok).toBe(true);
    });

    test("should handle resource access", async () => {
        const token = await logto.getAccessToken();
        expect(token).toBeDefined();

        // Test accessing protected resource
        const response = await fetch(`${process.env.BASE_URL}/notes`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Resource access failed:', await response.text());
        }
        expect(response.ok).toBe(true);
    });
}); 