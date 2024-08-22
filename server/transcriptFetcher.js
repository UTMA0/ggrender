import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const YoutubeTranscript = require('youtube-transcript-api');

export const fetchTranscript = async (url) => {
    try {
        const videoId = extractVideoId(url);
        if (!videoId) {
            throw new Error('Invalid YouTube URL');
        }

        const transcript = await YoutubeTranscript.default.fetchTranscript(videoId);
        return transcript.map(item => item.text);
    } catch (error) {
        console.error('Error fetching transcript:', error);
        throw error;
    }
};

function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}