import { server } from './server/server';

require('dotenv').config();

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`The server is running on port:${PORT}`);
});
