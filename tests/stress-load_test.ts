import http from "k6/http";
import {check, sleep} from "k6";
import { getAuthToken } from "../utils/auth.helper.ts";
import { Options } from "k6/options";


export const options: Options = {
    stages: [
        { duration: "10s", target: 5 }, // Ramp up to 5 users over 10 seconds
        { duration: "30s", target: 15 }, // Stay at 5 users for 30 seconds
        { duration: "10s", target: 5 }, // Ramp down to 5 users over 10 seconds
        { duration: "10s", target: 0 }, // Ramp down to 0 users over 10 seconds
    ],
}

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
    sleep(1);
}