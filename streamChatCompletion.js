const IncomingMessage = require("http");
const { OpenAI } = require("openai");

const API_KEY = process.env.OPEN_AI_API_KEY;
const openai = new OpenAI({
  apiKey: API_KEY
});

exports.streamChatCompletion = async function* (params) {
  console.log(params)
  const stream = await openai.chat.completions.create(
    {
      ...params,
      stream: true,
    })

  for await (const chunk of stream) {
    console.log(chunk.choices[0]?.delta?.content || '')

    try {
      const token = chunk.choices[0]?.delta?.content || '';
      if (token) {
        yield token;
      }
    } catch {
      console.log("JSON connot parse")
    }
  }
}