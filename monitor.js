var express = require('express');
var app = express();

var bodyParser = require('body-parser')

let $ = require('./map');

app.set('views','./view');
app.set('view engine','pug');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', async (req,res) => {
    res.render('index');
});

app.get('/log', async (req,res) => {
    res.render('log');
});

app.post('/logData', async (req,res) => {
    let offset = 0;
    if(parseInt(req.query['o']))
        offset = parseInt(req.query['o']);
    let limit = 10;
    if(parseInt(req.query['s']))
        limit = parseInt(req.query['s']);
    let from = 0;
    if(req.query['f'] && new Date(req.query['f']))
        from = parseInt(req.query['f']);
    let to = Number.MAX_SAFE_INTEGER;
    if(req.query['t'] && new Date(req.query['t']))
        to = parseInt(req.query['t']);
    let msg = '';
    if(req.body['m'])
        msg = req.body['m'];

    let data = await $.getLog(offset,limit, from, to, msg);
    data = data.map(el => {
        el.date = dateToString(new Date(el.date));
        if(el.pipe)
            for(let i = 0; i < el.pipe.length; ++i) {
                el.pipe[i].date = dateToString(new Date(el.pipe[i].date));
            }

        return el;
    })
    res.render('partial/logList',{d :data});
    
});

app.listen(5000,() => {
    console.log('Monitor is online', true);
});


function dateToString(d) {

    return d.toLocaleDateString() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ":" + d.getMilliseconds();
}