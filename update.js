const http = require('http')
const fs = require('fs')
const jsdom = require('jsdom')
const axios = require('axios');

let settings = require('./set');

let mapper = require('./map');

const file = [
    fs.createWriteStream("./data/data0.xls"),
    fs.createWriteStream("./data/data1.xls"),
    fs.createWriteStream("./data/data2.xls"),
    fs.createWriteStream("./data/data3.xls")
]

function download(url, lock) {
    return new Promise((resolve, reject) => {
    const tmp = http.get(url, (r) => {
        r.pipe(file[lock]);
        file[lock].on('finish', () => {
            var spawn = require("child_process").spawn;
            console.log("./data/data"+lock+".xls");
            let proc = spawn('python', ["./xlsparser.py","./data/data"+lock+".xls","./outtmp/ttOut"+lock+".json"]);
            proc.on('exit', d => {
                resolve("DONE PROC #" + lock);
            })

        });
    })});
} 

let func = async () => {

    let res = await axios.get("http://www.itmm.unn.ru/studentam/raspisanie/raspisanie-bakalavriata-i-spetsialiteta-ochnoj-formy-obucheniya/") ;
    
    let dom = new jsdom.JSDOM(res.data);
    document = dom.window.document;

    let changed = false;
    let links = document.getElementsByTagName('a');
    for(let i = 0, j = 0; j < 4 && i < links.length; ++i)
        if(links[i].href.startsWith("http://www.itmm.unn.ru/files/")) {
            if(!(await mapper.checkLink(j,links[i].href))) {
                let res = await download(links[i].href,j);
                console.log(res);
                changed = true;
            }
            ++j;
    }

    if(changed) {
        settings.freeze = true;
        mapper.update();
    }
}

func();
//20 * 60 * 1000
setInterval (func, 2000 );