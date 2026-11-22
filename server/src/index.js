import 'dotenv/config';
import app from './app.js';

const port = process.env.PORT || 3333;
app.listen(port, () => console.log(`Casa do Sabor API disponível na porta ${port}`));
