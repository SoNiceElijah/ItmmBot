var express = require('express');
var app = express();

const fs = require('fs');

var bodyParser = require('body-parser')

let $ = require('./map');

app.set('views','./view');
app.set('view engine','pug');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(express.static('outtmp'));

app.get('/', async (req,res) => {
    res.render('index');
});

app.get('/log', async (req,res) => {
    res.render('log');
});

app.get('/mirror', async (req,res) => {
    let list = await $.collections();
    res.render('mirror', { h : list});
});

app.get('/behavior', async (req,res) => {
    let date = await $.getLastCheckDate();
    let links = await $.linkAll();

    let stats = links.map(el => {
        let n1 = './data/data' + el.num + '.xls';
        let lc1 = fs.statSync(n1).mtime;
        let s1 = lc1.getUTCTime() - el.date;

        let n2 = './outtmp/ttOut' + el.num + '.json';
        let lc2 = fs.statSync(n2).mtime;
        let s2 = lc1.getUTCTime() - el.date;

        return {
            ...el,
            fs1 : n1,
            ts1 : dateToString(new Date(lc1.getUTCTime())),
            s1 : s1 >= 20 * 60 * 1000 ? "old" : "ok",
            fs2 : n2,
            ts2 : dateToString(new Date(lc2.getUTCTime())),
            s2 : s2 >= 20 * 60 * 1000 ? "old" : "ok",
            file : '/ttOut' + el.num + '.json.log'
        }
    });

    stats = stats.map(el => {
        el.date = dateToString(new Date(el.date));
        return el;
    })

    res.render('behavior',{load : date, links : stats});
});

app.post('/mirrorData', async (req,res) => {

    if(!req.body['c'])
        req.body['c'] = 'timeTable';

    let offset = 0;
    if(parseInt(req.query['o']))
        offset = parseInt(req.query['o']);
    let limit = 10;
    if(parseInt(req.query['s']))
        limit = parseInt(req.query['s']);

    let list = await $.collections(req.body['c'], offset, limit, req.body['q']);
    let size = await $.count(req.body['c'], req.body['q']) ;

    list = list.map(el => { 
        let obj = Object.assign({}, el);
        delete obj._id;
        return {i : el._id, text : JSON.stringify(obj, null, '\t')};
    });
    res.render('partial/mirrorList', { d : list, s : size, o : offset, l : Math.min(offset + limit, size)});
});

app.post('/mirrorUpdate', async (req,res) => {

    if(!req.body['c'])
        return res.send(400);

    if(!req.body['i'])
        return res.send(400);

    if(!req.body['q'])
        return res.send(400);

    $.collectionUpdate(req.body['c'], req.body['i'], req.body['q']);
    res.send(200);
});

app.post('/mirrorDelete', async (req,res) => {
    if(!req.body['i'])
        return res.send(400);
    if(!req.body['c'])
        return res.send(400);

    $.collectionDelete(req.body['c'], req.body['i']);
    res.send(200);
    
});

app.post('/mirrorAdd', async (req,res) => {
    if(!req.body['q'])
        return res.send(400);
    if(!req.body['c'])
        return res.send(400)

    $.collectionInsert(req.body['c'], req.body['q']);
    res.send(200);
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


function dateToString(d, offset = true) {
    if(offset)
        d = new Date(d.getTime() + 3 * 60 * 60 * 1000); //timezone offset
    return d.toLocaleDateString() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ":" + d.getMilliseconds();
}