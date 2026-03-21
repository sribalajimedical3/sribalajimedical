const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/form', (req, res) => {
    console.log("Data received:", req.body);
    res.json({ success: true });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
