const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'samartha_recruitment',
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        throw err;
    }
    console.log('Connected to MySQL database');
});

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Route to fetch all interviews with candidate details
app.get('/interviews', (req, res) => {
    let sql = `
        SELECT i.interview_id, c.candidate_name, c.candidate_email, i.type_of_interview, i.mode_of_interview, i.stage, i.timing, i.feedback, i.score
        FROM interview i
        JOIN candidate c ON i.candidate_id = c.candidate_id
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching interviews:', err);
            return res.status(500).json({ error: 'An error occurred while fetching data.' });
        }
        res.json(results);
    });
});

// Route to create a new interview
app.post('/interviews', (req, res) => {
    const { candidate_id, type_of_interview, mode_of_interview, stage, timing } = req.body;

    // Validate required fields
    if (!candidate_id || !type_of_interview || !mode_of_interview || !stage || !timing) {
        return res.status(400).json({ error: 'Candidate ID, type of interview, mode of interview, stage, and timing are required fields.' });
    }

    // Create new interview in the database
    let sql = `
        INSERT INTO interview (candidate_id, type_of_interview, mode_of_interview, stage, timing)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sql, [candidate_id, type_of_interview, mode_of_interview, stage, timing], (err, result) => {
        if (err) {
            console.error('Error creating new interview:', err);
            return res.status(500).json({ error: 'An error occurred while creating new interview.' });
        }
        res.json({ message: 'New interview created successfully.', interview_id: result.insertId });
    });
});

// Route to update interview details
app.put('/interviews/:interviewId', (req, res) => {
    const { interviewId } = req.params;
    const { requester, feedback, score } = req.body;

    // Validate request body fields
    if (!requester || !feedback || !score) {
        return res.status(400).json({ error: 'Requester, feedback, and score are required fields.' });
    }

    // Validate score (optional)
    const parsedScore = parseInt(score);
    if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 10) {
        return res.status(400).json({ error: 'Score must be a number between 1 and 10.' });
    }

    // Update interview in the database
    let sql = `
        UPDATE interview
        SET requester = ?, feedback = ?, score = ?
        WHERE interview_id = ?
    `;
    db.query(sql, [requester, feedback, parsedScore, interviewId], (err, result) => {
        if (err) {
            console.error('Error updating interview:', err);
            return res.status(500).json({ error: 'An error occurred while updating interview.' });
        }
        res.json({ message: 'Interview updated successfully.' });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
