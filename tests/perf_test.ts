import http from "k6/http";
import { check } from "k6";
import { getAuthToken } from "../utils/auth.helper.ts";

interface SetupData {
    token: string;
}
// //Perform once before run all tests
export function setup(): SetupData {
    const token = getAuthToken({
        username: "default",
        password: "12345678",
    });
    return { token };
}

export default function ({ token }: SetupData) {
    const res = http.post("https://quickpizza.grafana.com/api/pizza",
        JSON.stringify({
        "maxCaloriesPerSlice": 1000,
        "mustBeVegetarian": false,
        "excludedIngredients": [],
        "excludedTools": [],
        "maxNumberOfToppings": 5,
        "minNumberOfToppings": 2,
        "customName": ""
       }),
        {
            headers: {
                Authorization: `Token ${token}`,
            }
        }
    );
    check(res, {
      "Status-code": (res) => res.status === 200,
      "Request duration": (res) => res.timings.duration< 300,
    });
}