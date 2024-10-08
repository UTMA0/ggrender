import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchTranscript } from './transcriptFetcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

app.post('/fetch-transcript', async (req, res) => {
    console.log('Received request for transcript');
    try {
        const { url } = req.body;
        console.log('Fetching transcript for URL:', url);
        const transcript = await fetchTranscript(url);
        console.log('Transcript fetched successfully');
        res.json(transcript);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});