import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';

import connectDB from './db.js';
import influencerRoutes from './routes/influencerRoute.js'
import { initializeSocket } from './socket.js';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 5150;

const allowedOrigins = [  
    process.env.ORIGIN1,
    process.env.ORIGIN2
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "Cache-Control",
            "Expires",
            "Pragma",
        ],
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



connectDB();

app.get('/',(req, res)=>{
    res.status(200).send('OK');
});

app.use('/api/influencer', influencerRoutes)


const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

initializeSocket(server);

