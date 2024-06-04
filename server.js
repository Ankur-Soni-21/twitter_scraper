const express = require('express');
const { exec } = require('child_process');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

dotenv.config();

const app = express();
const port = 3000;

const uri = "mongodb://localhost:27017/";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors()); // Add this line to use CORS
app.use(express.static(path.join(__dirname, 'public')));

app.get('/run-script', async (req, res) => {
    exec('node seleniumScript.js', async (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.json({ success: false });
        }

        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);

        await client.connect();
        const db = client.db('twitter_data');
        const collection = db.collection('twitter_trends');

        const latestRecord = await collection.find().sort({ $natural: -1 }).limit(1).toArray();

        if (latestRecord.length > 0) {
            const record = latestRecord[0];
            res.json({
                success: true,
                trends: [
                    record.trend1,
                    record.trend2,
                    record.trend3,
                    record.trend4,
                    record.trend5
                ],
                ipAddress: record.ip_address,
                jsonData: record,
                endTime: record.end_time
            });
        } else {
            res.json({ success: false });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
