import http from "k6/http";
import {check, sleep} from "k6";
import { getAuthToken } from "../utils/auth.helper.ts";
import { Options } from "k6/options";
import {scenario} from "k6/execution";


export const options: Options = {
    vus: 3,
    duration: "20s",
    cloud: {
        projectID: "3755455",
        name: "Pizza-Load-Test",
        distribution: {
          scenario: { loadZone: "amazon:se:stockholm", percent: 100 }
        }
    },
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