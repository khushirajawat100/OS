import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: process.env.HF_TOKEN,
});

export async function askAI(messages) {
    const completion = await client.chat.completions.create({
        model: "deepseek-ai/DeepSeek-V3.2:novita",
        messages,
        temperature: 0.4,
    });

    return completion.choices[0].message.content;
}
