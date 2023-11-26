import http from 'http';
import querystring from 'querystring';
import url from 'url';
import dotenv from 'dotenv';

dotenv.config();

const server = http.createServer();
const hostname = '127.0.0.1';
const port = 3000;

server.on('request', async (req, res) => {
    // Parse the request URL
    const parsedUrl = url.parse(req.url);

    // Extract the query parameters
    const { text } = querystring.parse(parsedUrl.query);

    // Set the response headers
    res.setHeader('Content-Type', 'application/json');

    let response;
    let result = "";
    if (parsedUrl.pathname === '/classify' && text) {
        response = await fetch(
            "https://api-inference.huggingface.co/models/StevenLimcorn/indonesian-roberta-base-emotion-classifier",
            {
                headers: { Authorization: `Bearer ${process.env.API_KEY}` },
                method: "POST",
                body: JSON.stringify({
                    inputs: text.toLowerCase().trim(),
                    option: {
                        wait_for_model: true
                    }
                }),
            }
        );

        if (response.status == 200) {
            response = await response.json()
            res.statusCode = 200;

            result = "";
            let highestScore = 0;
            response[0].forEach(({ label, score }) => {
                if (score > highestScore) {
                    highestScore = score;
                    result = label;
                }
            })
        }
    } else {
        response = { 'error': 'Bad request' }
        res.statusCode = 400;

        return res.end(JSON.stringify(response))
    }
    // Send the JSON response
    return res.end(JSON.stringify({ label: result }));
});

server.listen(port, hostname, () => {
    console.log(`Server running at ${hostname}:${port}`);
});