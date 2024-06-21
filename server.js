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
        SELECT i.interview_id, c.candidate_name, c.candidate_email, i.interview_type, i.stage, i.timing, i.feedback, i.score
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

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
