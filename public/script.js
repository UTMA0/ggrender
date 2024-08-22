document.getElementById('fetchTranscript').addEventListener('click', async () => {
    const videoUrl = document.getElementById('videoUrl').value;
    const result = document.getElementById('result');
    const transcriptText = document.getElementById('transcriptText');
    
    try {
        const response = await fetch('/fetch-transcript', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: videoUrl }),
        });
        
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to fetch transcript');
        }
        
        const transcript = await response.json();
        if (transcript && transcript.length > 0) {
            // Display the transcript on the page
            transcriptText.innerHTML = transcript.map(line => `<p>${line}</p>`).join('');
            
            // Provide a download link
            const transcriptString = transcript.join('\n');
            result.innerHTML = `<a href="data:text/plain;charset=utf-8,${encodeURIComponent(transcriptString)}" download="transcript.txt">Download Transcript</a>`;
        } else {
            result.textContent = 'No transcript available for this video.';
            transcriptText.innerHTML = '';
        }
    } catch (error) {
        result.textContent = `Error: ${error.message}`;
        transcriptText.innerHTML = '';
    }
});