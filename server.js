const express = require('express');
const multer = require('multer');
const mega = require('mega');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// MEGA credentials (replace with your own)
const email = 'your-email@example.com';
const password = 'your-password';

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Route to login to MEGA and get a token
app.post('/login', (req, res) => {
    const client = mega({ email, password });

    client.login((err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Logged in successfully', token: client.token });
    });
});

// Route to upload a file to MEGA
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const client = mega({ email, password });

    client.login((err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        client.upload(fs.createReadStream(req.file.path), (err, file) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Clean up uploaded file
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Failed to delete local file:', err);
            });

            res.json({ message: 'Upload successful', file });
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
