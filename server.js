const fs = require('fs');
const express = require('express');
const app = express();

let index;
fs.readFile('index.html', (err, data) => {    
    index = data;
});

app.use(express.static('./', {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['htm', 'html'],
    maxAge: '1d',
    redirect: false,
    setHeaders: (rs, path, stat) => {
        rs.set('x-timestamp', Date.now());
    }
}));

app.get('/', (rq, rs) => {
    rs.set('Content-Type', 'text/html');
    rs.send(index);
    rs.end();
    throw new Error('oops');
});

app.listen(3000, () => console.log('Listening on port 3000...'));
