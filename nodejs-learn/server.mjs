// This is a named import that imports a specific export called createServer
// Used when a module exports multiple items using export keyword
// If it was: import createServer from 'node:http'; that would mean default import that imports the default export from the module
// Used when a module has a single primary export using export default
import {createServer} from 'node:http';

const hostname = '127.0.0.1';
const port = 3000;

// The createServer() method of http creates a new HTTP server and returns it.
// Whenever a new request is received, the request event is called, providing two objects: 
// a request (an http.IncomingMessage object) and a response (an http.ServerResponse object).
const server = createServer((req, res) =>{
   res.statusCode = 200;
   res.setHeader('Content-Type', 'text/plain');
   // close the response, adding the content as an argument to end()
   res.end('Hello World!');
});

// The server is set to listen on the specified port and host name. 
// When the server is ready, the callback function is called, in this case informing us that the server is running.
server.listen(port, hostname, ()=>{
   console.log(`Server listening at http://${hostname}:${port}`); 
});