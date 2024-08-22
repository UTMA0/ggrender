import https from 'https';

export const fetchTranscript = async (url) => {
    try {
        const videoId = extractVideoId(url);
        if (!videoId) {
            throw new Error('Invalid YouTube URL');
        }

        const transcript = await getTranscript(videoId);
        return transcript;
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

function getTranscript(videoId) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'www.youtube.com',
            port: 443,
            path: `/watch?v=${videoId}`,
            method: 'GET'
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const captionTracks = data.match(/"captionTracks":(\[.*?\])/);
                    if (captionTracks) {
                        const captions = JSON.parse(captionTracks[1]);
                        const englishCaptions = captions.find(caption => caption.languageCode === 'en');
                        if (englishCaptions && englishCaptions.baseUrl) {
                            fetchCaptionTrack(englishCaptions.baseUrl)
                                .then(resolve)
                                .catch(reject);
                        } else {
                            reject(new Error('No English captions found'));
                        }
                    } else {
                        reject(new Error('No captions found'));
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

function fetchCaptionTrack(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const transcript = data
                    .replace(/<text.+?>(.*?)<\/text>/g, '\$1')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .split('\n')
                    .filter(line => line.trim() !== '');
                resolve(transcript);
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}