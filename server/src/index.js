import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import categoriesRouter from './routes/categories.js';
import dishesRouter from './routes/dishes.js';
import authRouter from './routes/auth.js';
import { notFound, errorHandler } from './middleware.js';

const app = express();
// Render executa a API atrás de um proxy reverso; confia no primeiro proxy.
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(origin => origin.trim()) : 'http://localhost:5173'}));
app.use(express.json({limit:'20kb'}));
app.use('/api', rateLimit({windowMs:15*60*1000,limit:300,standardHeaders:true,legacyHeaders:false}));
app.get('/api/health',(req,res)=>res.json({status:'ok',service:'Casa do Sabor API'}));
app.use('/api/auth', authRouter);
app.use('/api/categories',categoriesRouter);
app.use('/api/dishes',dishesRouter);
app.use(notFound);
app.use(errorHandler);
const port = process.env.PORT || 3333;
app.listen(port,()=>console.log(`Casa do Sabor API disponível na porta ${port}`));
