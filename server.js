var http = require('http');
var fs = require('fs');

const express = require('express')
const app = express()

app.get('/', (request, response) => {
    throw new Error('oops')
})

app.use((err, request, response, next) => {
    // log the error, for now just console.log
    console.log(err)
    response.status(500).send('Something broke!')
})

// http.createServer(function (req, res) {
//     fs.readFile('dist/index.html', function (err, data) {
//         res.writeHead(200, { 'Content-Type': 'text/html' });
//         res.write(data);
//         res.end();
//     });
// }).listen(8080);