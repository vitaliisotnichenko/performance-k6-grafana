import http from "k6/http"

interface AuthResponse {
    token: string;
}

function isAuthResponse(obj: unknown): obj is AuthResponse {
    return typeof obj === "object" && obj !== null && "token" in obj && typeof (obj as any).token === "string";
}

//Perform once before run all tests
export function getAuthToken(data: { username: string; password: string }) {
    const res = http.post("https://quickpizza.grafana.com/api/users/token/login",
        JSON.stringify({
            username: data.username,
            password: data.password,
        }),
    );
    const responseBody = res.json() as unknown;
    if (!isAuthResponse(responseBody)) {
        throw new Error("Invalid response format: token is missing or invalid");
    }
    return responseBody.token;
}