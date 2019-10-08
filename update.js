const http = require('http')
const fs = require('fs')
const jsdom = require('jsdom')
const axios = require('axios');

let settings = require('./set');

let mapper = require('./map');

function file(e) {
    return "./data/data" + e + ".xls";
}

function download(url, lock) {
    return new Promise((resolve, reject) => {
    const tmp = http.get(url, (r) => {
        let stream = fs.createWriteStream(file(lock));
        r.pipe(stream);
        stream.on('finish', () => {
            stream.close();
            var spawn = require("child_process").spawn;
            console.log("./data/data"+lock+".xls", true);
            let proc = spawn('python', [
                "./xlsparser.py",
                "./data/data"+lock+".xls",
                "./outtmp/ttOut"+lock+".json", 
                settings.docTable[lock].g,
                settings.docTable[lock].o
            ]);
            proc.on('uncaughtException', (err) => {
                console.log(Utf8ArrayToStr(err),true);
            });
            proc.stdout.on('data', d=> {
                console.log(Utf8ArrayToStr(d), true);
            });
            proc.on('exit', d => {
                resolve("DONE PROC #" + lock);
            })

        });
    })});
} 

let func = async () => {
    console.log('Check update.....', true);
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

    res = await axios.get("http://www.itmm.unn.ru/raspisanie-studentov-magistratury/") ;
    
    dom = new jsdom.JSDOM(res.data);
    document = dom.window.document;
    links = document.getElementsByTagName('a');

    for(let i = 0, j = 4; j < 5 && i < links.length; ++i)
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

function Utf8ArrayToStr(array) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while(i < len) {
    c = array[i++];
    switch(c >> 4)
    { 
      case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12: case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0F) << 12) |
                       ((char2 & 0x3F) << 6) |
                       ((char3 & 0x3F) << 0));
        break;
    }
    }

    return out;
}

func();
setInterval (func, 20 * 60 * 1000); // 20 min = 


