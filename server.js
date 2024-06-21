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

// Helper function to validate email (if needed)
const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

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

// POST Method: Create a new interview
app.post('/interviews', (req, res) => {
    const { candidate_name, candidate_email, interview_type, mode_of_interview, stage, timing, requester, feedback, score } = req.body;

    // Validate input (you can add more validations as needed)
    if (!candidate_name || !candidate_email || !interview_type || !mode_of_interview || !stage || !timing || !requester || !feedback || !score) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Dummy candidate_id for illustration, replace with actual logic to fetch or create candidate
    const candidate_id = 1; // Replace with actual logic

    const sql = `
        INSERT INTO interview (candidate_id, type_of_interview, mode_of_interview, stage, timing, requester, feedback, score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [candidate_id, interview_type, mode_of_interview, stage, timing, requester, feedback, score];

    connection.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error inserting interview data:', error);
            return res.status(500).json({ error: 'Error inserting interview data.' });
        }

        console.log('Interview added successfully.');
        res.status(200).json({ message: 'Interview added successfully.' });
    });
});

// PUT Method: Update interview by ID
app.put('/interviews/:interview_id', (req, res) => {
    const interviewId = req.params.interview_id;
    const { interview_type, mode_of_interview, stage, timing, requester, feedback, score } = req.body;

    const sql = `
        UPDATE interview
        SET type_of_interview = ?, mode_of_interview = ?, stage = ?, timing = ?, requester = ?, feedback = ?, score = ?
        WHERE interview_id = ?
    `;
    const values = [interview_type, mode_of_interview, stage, timing, requester, feedback, score, interviewId];

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

// DELETE Method: Delete interview by ID
app.delete('/interviews/:interview_id', (req, res) => {
    const interviewId = req.params.interview_id;

    const sql = 'DELETE FROM interview WHERE interview_id = ?';
    connection.query(sql, [interviewId], (error, results) => {
        if (error) {
            console.error('Error deleting interview:', error);
            return res.status(500).json({ error: 'An error occurred. Please try again later.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Interview not found.' });
        }

        console.log('Interview deleted successfully.');
        res.status(200).json({ message: 'Interview deleted successfully.' });
    });
});

// Handle other routes and start server
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
