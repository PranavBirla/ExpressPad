const express = require('express');
const path = require('path');
const fs = require('fs');
const { log } = require('console');
const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));




app.get('/', (req, res) => {
    fs.readdir(`./files`, (err, files) => {
        res.render('index', { files: files });
    });

});

app.post('/create', (req, res) => {
    
    const title = req.body.title.trim();
    
    if (!title) {
        return res.redirect("/");
    }
    fs.writeFile(`./files/${req.body.title}.txt`, req.body.details, function (err) {
        res.redirect('/');
    })
});

app.get('/file/:filename', (req, res) => {
    fs.readFile(`./files/${req.params.filename}`, "utf-8", function (err, filedata) {
        res.render("show", { filename: req.params.filename, filedata: filedata });
    })
});

app.get('/edit/:filename', (req, res) => {
     fs.readFile(`./files/${req.params.filename}`, "utf-8", function (err, filedata) {
        res.render("edit", { filename: req.params.filename, filedata: filedata });
    })
});

app.post('/edit', (req, res) => {
    const oldName = req.body.previous;
    let newName = req.body.new.trim();

    if (newName === "") {
        newName = oldName;
    }

    if (!newName.endsWith(".txt")) {
        newName += ".txt";
    }

    const oldPath = `./files/${oldName}`;
    const newPath = `./files/${newName}`;

    const finalContent = req.body.newDetails.trim() === ""
        ? req.body.previousDetails
        : req.body.newDetails;

    // 🔹 If filename is same, skip rename
    if (oldName === newName) {
        fs.writeFile(oldPath, finalContent, (err) => {
            if (err) return res.send("Write error");
            return res.redirect("/");
        });
    } 
    // 🔹 If filename changed, rename + write
    else {
        fs.rename(oldPath, newPath, (err) => {
            if (err) return res.send("Rename error");

            fs.writeFile(newPath, finalContent, (err) => {
                if (err) return res.send("Write error");
                res.redirect("/");
            });
        });
    }
});


app.get('/delete/:filename', (req, res) => {
     fs.unlink(`./files/${req.params.filename}`, function(err){
        res.redirect("/");
     })
});













app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});