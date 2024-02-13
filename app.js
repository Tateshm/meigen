require('dotenv').config();
const streamChatCompletion = require("./streamChatCompletion").streamChatCompletion;

var express = require("express");
const cors = require('cors')

const port = process.env.PORT || 5500;

var app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cors())

var server = app.listen(port, function () {
    console.log("Node.js is listening to PORT:" + server.address().port);
});


app.post('/', async (req, res) => {
    console.log('started app')
    prompt = req.body.query
    const { OpenAI } = require("openai");
    const API_KEY = process.env.OPEN_AI_API_KEY;

    const openai = new OpenAI({
        apiKey: API_KEY
    });

    res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");



    try {
        for await (const data of streamChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ "role": "system", "content": "" }, { role: "user", content: prompt }],
            temperature: 0.9
        })) {
            if(data == ''){
                return;
            }
            res.write(data);
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({ message: "Internal server error" });
    }
    res.end();
});

