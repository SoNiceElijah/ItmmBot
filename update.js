const http = require('http')
const fs = require('fs')
const jsdom = require('jsdom')
const axios = require('axios');

let settings = require('./set');

let mapper = require('./map');

const file = [
    "./data/data0.xls",
    "./data/data1.xls",
    "./data/data2.xls",
    "./data/data3.xls"
]

function download(url, lock) {
    return new Promise((resolve, reject) => {
    const tmp = http.get(url, (r) => {
        let stream = fs.createWriteStream(file[lock]);
        r.pipe(stream);
        stream.on('finish', () => {
            stream.close();
            var spawn = require("child_process").spawn;
            console.log("./data/data"+lock+".xls", true);
            let proc = spawn('python', ["./xlsparser.py","./data/data"+lock+".xls","./outtmp/ttOut"+lock+".json"]);
            proc.stdout.on('data', d=> {
                console.log(d, true);
            });
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
                console.log(res, true);
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
setInterval (func, 10 * 60 * 1000); // 10 min = 