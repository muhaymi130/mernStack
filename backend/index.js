import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import productRoutes from './routes/productRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(productRoutes);
app.use(express.static('public'));

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});

