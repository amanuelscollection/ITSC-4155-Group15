const app = require('./app');

const port = 3000;
const host = 'localhost';

app.listen(port, host, () => {
   console.log(`Server is running on http://${host}:${port}`);
});