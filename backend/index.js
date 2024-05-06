const express = require('express');
const cors = require('cors');
const routes = require('./routes/routes');

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api', routes)

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server listening on port ${port}`))
