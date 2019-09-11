const http = require('http')
const fs = require('fs')
const jsdom = require('jsdom')

const file = [
    fs.createWriteStream("./data/data4.xls"),
    fs.createWriteStream("./data/data3.xls"),
    fs.createWriteStream("./data/data2.xls"),
    fs.createWriteStream("./data/data1.xls")
]

cs = 0;
const req = http.get("http://www.itmm.unn.ru/studentam/raspisanie/raspisanie-bakalavriata-i-spetsialiteta-ochnoj-formy-obucheniya/", (res) => {
    let data = ""
    res.on('data', token => {
        data += token;
    })

    res.on('end', () => {
        let dom = new jsdom.JSDOM(data);
        document = dom.window.document;

        let links = document.getElementsByTagName('a');
        for(let i = 0, j = 0; j < 4 && i < links.length; ++i)
            if(links[i].href.startsWith("http://www.itmm.unn.ru/files/")) {
                const tmp = http.get(links[i].href, (r) => {
                    const lock = cs++;
                    r.pipe(file[lock]);
                    setTimeout(() => {
                        var spawn = require("child_process").spawn; 

                        console.log("./data/data"+lock+".xls");
                        let proc = spawn('python', ["./xlsparser.py","./data/data"+lock+".xls","./ttOut"+lock+".json"]);
                        proc.on('data', d => {
                            console.log(d);
                        })

                    }, 3000);
                });
                ++j
        }
    })
});