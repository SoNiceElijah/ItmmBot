
const size = 150;

let pool = [];
let bot;

let output;


function init(b)
{
    bot = b;
}

async function collectData(b) {

    

    let count = 1;
    let page = 0;
    while(page*size < count)
    {
        let dialogs = await bot.execute('messages.getConversations',{
            offset : page*size,
            count : size
        });

        for(let i = 0; i < Math.min(size,dialogs.count); ++i)
            await collectDialog(dialogs.items[i]);
        
        count = dialogs.count;
        ++page;
    }

    console.log('Super data loaded',true);
}

async function collectDialog(conversation)
{
    let id = conversation.conversation.peer.id;
    let page = 0;  
    let count = 1;
    while(page*size < count)
    {
        let msgs = await bot.execute('messages.getHistory',{
            offset : page*size,
            count : size,
            user_id : id
        });

        pool = pool.concat(
            msgs.items.filter(e => e.from_id >= 0).map(e => { return {text : e.text, date : e.date}; })
        );

        count = msgs.count;
        ++page;
    }
    
}

function createData()
{

    let data = {};    
    let timeStat = [0,0,0,0,0,0,0];
    for(let i = 0; i < pool.length; ++i)
    {
        let word = pool[i].text.toUpperCase().trim();
        
        if(data[word])
            data[word] += 1;
        else
            data[word] = 1;

        let d = new Date(pool[i].date);
        timeStat[d.getDay()] += 1;
    }

    let arr = [];
    for(let prop in data)
        arr.push({
            name : prop,
            val : data[prop]
        });

    arr.sort((a,b) => b.val - a.val);
    arr = arr.slice(0,10);

    let sum = arr.reduce((a,e) => a + e.val,0);

    output = {
        labels : arr.map(e => e.name),
        values : arr.map(e => e.val / pool.length)
    };

    output.labels.push('ДРУГИЕ');
    output.values.push(1.0 - sum / pool.length);



    output =  [output,{
        x : ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
        y : timeStat
    }];
    
}

module.exports.init = init;
module.exports.collectData = collectData;
module.exports.anylizeData = createData;
module.exports.getData = () => output;