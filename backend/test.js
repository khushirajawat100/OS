import { askAI } from "./services/ai.js";

const response = await askAI([
    {
        role: "user",
        content: "Say Hello from DeepSeek."
    }
]);

console.log(response);
