let express = require('express');
let app = express();
let zip = require('compression')();
let fs = require('fs-extra');
let Path = require('path');

let basePath = Path.resolve(process.argv[2] || process.cwd());

console.log('Using basePath:', basePath);

app.get('/main.js', zip, file('/built/main.js'));
app.get('/vendor.js', zip, file('/built/vendor.js'));
app.get('/style.css', zip, file('/www/style.css'));

app.get(['/files', /\/files\/(.*)/], (req, res) => {
    console.log('Stat', req.params[0]);
    let p = req.params[0] ? decodeURIComponent(req.params[0]) : '/';
    let filePath = Path.join(basePath, p);

    fs.stat(filePath).then(stats => {
        if (stats.isDirectory()) {
            readdirEx(filePath).then(files => {
                res.json(files);
            });
        }
        else {
            res.sendFile(filePath);
        }
    })
    .catch(err => {
        res.status(404);
        res.json({ err: err });
    });
});

app.get('*', zip, file('/www/index.html'));
app.listen(3001, '0.0.0.0');

function readdirEx(dirPath) {
    return fs.readdir(dirPath).then(files => {
        return Promise.all(files.map(file => {
            let filePath = Path.join(dirPath, file);
            return fs.stat(filePath)
            .then(st => {
                return { name: file, path: Path.relative(basePath, filePath), isDir: st.isDirectory() };
            });
        }));
    });
}

function file(filepath) {
    return (req, res) => {
        res.sendFile(__dirname + filepath);
    };
}