var express = require('express');
var app = express();

app.set('views','./view');
app.set('view engine','pug');

app.use(express.static('public'));

app.get('/', async (req,res) => {
    res.render('index');
});

app.listen(5000,() => {
    console.log('Monitor is online');
});