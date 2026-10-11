import express from 'express';
import routes from './routes';

const app = express();

// app.use(express.json());
// app.use(express.static('public'));
// app.use(express.static(path.join(__dirname, 'client', 'build')));
app.use(routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT);
