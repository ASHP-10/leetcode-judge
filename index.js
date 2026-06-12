import express from 'express';
import problemRoutes from './src/routes/problemRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send("hello");
    console.log("got request");
});

app.use('/problems', problemRoutes);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
