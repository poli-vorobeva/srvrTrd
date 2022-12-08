import * as http from "http";
import SocketServer from "./SocketServer.js";


const port = process.env.PORT || 3001;
const requestHandler = (request, response) => {
	response.end('Serverhi!');
};

const server = http.createServer(requestHandler);
const socketService = new SocketServer(server)
server.listen(port, () => {
	console.log(`server is listening on ${port}`);
});

//railway.json
//{
//   "$schema": "https://railway.app/railway.schema.json",
//   "build": {
//     "builder": "NIXPACKS"
//   },
//   "deploy": {
//     "restartPolicyType": "ON_FAILURE",
//     "restartPolicyMaxRetries": 10
//   }
// }