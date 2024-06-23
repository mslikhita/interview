const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'samartha_recruitment'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// GET all interviews with candidate details
app.get('/interviews', (req, res) => {
    const sql = `
        SELECT interview.interview_id, interview.candidate_id, candidate.candidate_name, candidate.candidate_email, 
               interview.type_of_interview, interview.mode_of_interview, interview.stage, interview.timing, interview.requester, interview.feedback, interview.score
        FROM interview
        INNER JOIN candidate ON interview.candidate_id = candidate.candidate_id
    `;

    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error retrieving interviews:', error);
            return res.status(500).json({ error: 'An error occurred. Please try again later.' });
        }
        res.status(200).json(results);
    });
});

// PUT Method: Update interview by ID
app.put('/interviews/:interview_id', (req, res) => {
    const interviewId = req.params.interview_id;
    const { type_of_interview, mode_of_interview, stage, timing, requester, feedback, score } = req.body;

    const sql = `
        UPDATE interview
        SET type_of_interview = ?, mode_of_interview = ?, stage = ?, timing = ?, requester = ?, feedback = ?, score = ?
        WHERE interview_id = ?
    `;
    const values = [type_of_interview, mode_of_interview, stage, timing, requester, feedback, score, interviewId];

    connection.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error updating interview:', error);
            return res.status(500).json({ error: 'An error occurred. Please try again later.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Interview not found.' });
        }

        console.log('Interview updated successfully.');
        res.status(200).json({ message: 'Interview updated successfully.' });
    });
});

// Error handling for non-existing routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
