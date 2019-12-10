const vkBot = require('node-vk-bot-api')
const Markup = require('node-vk-bot-api/lib/markup');

const Scene = require('node-vk-bot-api/lib/scene')
const Stage = require('node-vk-bot-api/lib/stage')
const Session = require('node-vk-bot-api/lib/session')

Date.prototype.getUTCTime = function () {

    let deb = this.getTimezoneOffset();

    return this.getTime() + (this.getTimezoneOffset() * 60000);
};

let settings = require('./set');

main();
async function main() {
let $ = require('./map');

let tmpLog = console.log;
console.log = (msg, b = false) => {
    if($) {
        if(b)
            $.logNow(msg);
        else
            $.log(msg);
    }

    tmpLog(msg);
    //process.stderr.write(msg + '\n');
}

await $.init();

require('./update');
require('./monitor');

const mainKeys =  [
    Markup.keyboard([
        [
            Markup.button('Все', 'secondary'),
            Markup.button('Неделя', 'secondary'),
            Markup.button('Сегодня', 'secondary'),
            Markup.button('Завтра', 'secondary')
        ]
    ]),
    Markup.keyboard([
        [
            Markup.button('get link 1', 'positive'),
            Markup.button('get link 2', 'positive'),
            Markup.button('get link 3', 'positive'),
            Markup.button('get link 4', 'positive')
        ],
        [
            Markup.button('get week', 'primary')
        ]
    ]),
    Markup.keyboard([
        [
            Markup.button('Понедельник', 'secondary'),
            Markup.button('Вторник', 'secondary'),
            Markup.button('Среда', 'secondary')
        ],
        [
            Markup.button('Четверг', 'secondary'),
            Markup.button('Пятница', 'secondary'),
            Markup.button('Суббота', 'secondary'),
        ]
    ])
];


const sc = 
    new Scene('meet',
    (ctx) => {
        ctx.message.text = deleteBotName(ctx.message.text);
        ctx.scene.next();
        ctx.reply('Привет! Кажется мы еще не знакомы, из какой ты группы? (Например: 382103-4)')
    },
    async (ctx) => {
        ctx.message.text = deleteBotName(ctx.message.text);
        ctx.scene.selectStep(3);
        console.log(ctx.message);
        ctx.session.group = ctx.message.body ? ctx.message.body.trim() : ctx.message.text.trim()  ;

        let verify = await $.checkGroup(ctx.session.group);
        if(!verify) {
            ctx.scene.selectStep(1);
            return ctx.reply('Такой группы у нас нет. Попробуй ввести что-нибудь другое');
        }

        ctx.reply('В какой ты подгруппе? (1 или 2, если подгруппы нет, то напиши 1)');
    },
    (ctx) => {
        ctx.message.text = deleteBotName(ctx.message.text);
        ctx.scene.next();
        ctx.reply('В какой ты подгруппе? (1 или 2, если подгруппы нет, то напиши 1)');
    },
    (ctx) => {
        ctx.message.text = deleteBotName(ctx.message.text);
        let sub = ctx.message.body ? ctx.message.body.trim() : ctx.message.text.trim()  ;
        if(sub != "1" && sub != "2")  {
            ctx.scene.selectStep(3);
            return ctx.reply('Ответь либо 1, либо 2');
        }

        $.register(ctx.message.user_id ? ctx.message.user_id : ctx.message.peer_id, ctx.session.group , sub);
        ctx.scene.leave();
        
        ctx.reply('Отлично! Теперь ты сможешь получать расписание!',null, Math.floor(ctx.message.peer_id / 1000) != 2000000 ? mainKeys[0] : null);
    });

local_token = '';
local_group_id = 0;

PROD = false;
if(PROD)
{
    local_token = "6a0ac777d5312fd4242c4b3c0fd6b2428e9368b16d2ede70d7a78be92dcd37ddce53eab0bc551a5f1b7d8";
    local_group_id = 186457555;
}
else
{
    local_token = "0a3061a44aa454b81311af0952f07991f632f1e2ba806faf752add8a3e12651ebe64dc6d94c4ca4956986";
    local_group_id = 171210583;
}

const bot = new vkBot({
    //PROD!!!!!!!!!!!
   token : local_token,
   group_id : local_group_id
});


bot.use((new Session).middleware());
bot.use((new Stage(sc)).middleware());

bot.use(require('./events/hod'));


bot.use(async (ctx,next) => {
    ++settings.active;
    console.log('got event');
    console.log("I've been asked: " + ctx.message.text);
    ctx.reply = (...args) => {
        ctx.bot.sendMessage(ctx.message.peer_id || ctx.message.user_id, ...args);
        --settings.active;
        console.log('I answered: ' + args[0]);
        console.log('pipe finished');
        $.logDown();
      }

      next();
});

bot.use(async (ctx,next) => {
    if(settings.freeze) {
        let i = setInterval(() => {
            if(!settings.freeze) {
                clearInterval(i);
                next();
            }
        }, 10);
    }
    else
        next();


});

bot.use(async (ctx, next) => {
    ctx.message.text = deleteBotName(ctx.message.text);
        
    next();
});

bot.use(async (ctx, next) => {
    console.log("Who's there?")
    let user = await $.user(ctx.message.user_id ? ctx.message.user_id : ctx.message.peer_id);
    if(!user) {
        console.log("I don't know! Let's meet!")
        ctx.scene.enter('meet');
    }
    else {
        console.log("Oh! It's: " + user.userId);
        ctx.uid = user.userId;
        ctx.group = user.group;
        ctx.sub = user.sub;
        ctx.set = user.set;
        ctx.custom = user.option;
        next();
    }
});

bot.use(async (ctx, next) => {

    let d = new Date();

    ctx.w = d.getWeekNumber() % 2;
    ctx.d = d.getDay();

    next();
})


bot.command('Сегодня', async (ctx) => {

    let data = await $.getDay(ctx.group, ctx.sub);
    ctx.reply(createDayBlock(ctx, data, ctx.d, ctx.w));

})


bot.command('Завтра', async (ctx) => {

    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    let d = tomorrow.getDay();
    let w = tomorrow.getWeekNumber() % 2;

    let data = await $.getDay(ctx.group, ctx.sub, tomorrow);
    ctx.reply(createDayBlock(ctx, data, d, w));

})

bot.command('Неделя', async (ctx) => {

    let data = await $.getWeek(ctx.group, ctx.sub);

    let text = `&#128198; Расписание на неделю [${weeks[ctx.w]}]\n\n`;
    for(let i = 0; i < 7; ++i)
    {
        if(data[i].length != 0)
            text += createDayBlock(ctx, data[i], i, ctx.w, false) + '\n\n';
    }
    ctx.reply(text);

})

bot.command('Все', async (ctx) => {

    let data = await $.getAll(ctx.group, ctx.sub);

    let text = `&#128198; Расписание ITMM ${ctx.group}\n\n`;
    text += `..::${weeks[1].toUpperCase()}::..\n\n`;
    for(let i = 0; i < 7; ++i)
    {
        if(data[i].length != 0)
            text += createDayBlock(ctx, data[i], i, 1, false) + '\n\n';
    }
    text += `\n..::${weeks[0].toUpperCase()}::..\n\n`;
    for(let i = 7; i < 14; ++i)
    {
        if(data[i].length != 0)
            text += createDayBlock(ctx, data[i], i - 7, 0, false) + '\n\n';
    }
    ctx.reply(text);

})

let mark = "&#128313;";
let dark = "&#128310;";


bot.command('Понедельник', async (ctx) => {
    ctx.reply(await getBlockByDayNum(ctx,1));
});

bot.command('Вторник', async (ctx) => {
    ctx.reply(await getBlockByDayNum(ctx,2));
});

bot.command('Среда', async (ctx) => {
    ctx.reply(await getBlockByDayNum(ctx,3));
});

bot.command('Четверг', async (ctx) => {
    ctx.reply(await getBlockByDayNum(ctx,4));
});

bot.command('Пятница', async (ctx) => {
    ctx.reply(await getBlockByDayNum(ctx,5));
});

bot.command('Суббота', async (ctx) => {
    ctx.reply(await getBlockByDayNum(ctx,6));
});

bot.command('?', async (ctx) => {
    ctx.reply(weeks[(new Date()).getWeekNumber() % 2]);
});

bot.command('get week', async (ctx) => {
    ctx.reply(weeks[(new Date()).getWeekNumber() % 2]);
});

bot.command('Сессия', async (ctx) => {
    data = await $.getExams(ctx.group, ctx.sub);

    ex1 = data.filter(e => e.exam);
    ex2 = data.filter(e => e.zachet);
    ex3 = data.filter(e => e.mark);

    msg = `Зима 2019-2020\n\n`;

    msg += 'ЭКЗАМЕНОВ: ' +ex1.length + '\n';
    msg += 'ЗАЧЕТОВ: ' + ex2.length + '\n';

    if(ex3.length > 0)
        msg += 'ЗАЧЕТОВ С ОЦЕНКОЙ: ' + ex3.length + '\n';

    

    msg += "\nЗачеты:\n";

    for(let i = 0; i < ex2.length; ++i)
        msg += `${mark} ${ex2[i].text} \n`;

    msg += "\nЭкзамены:\n";

    for(let i = 0; i < ex1.length; ++i)
        msg += `${mark} ${ex1[i].text} \n`;

    if(ex3.length > 0)
        msg += "\nЗачеты с оценкой:\n";

    for(let i = 0; i < ex3.length; ++i)
        msg += `${mark} ${ex3[i].text} \n`;


    ctx.reply(msg);
});

bot.command('get link', async (ctx) => {
    
    if(ctx.message.text.length != 10)
        return ctx.reply('Wrong request, try smth like: get link <int>');

    let i = parseInt(ctx.message.text[ctx.message.text.length - 1]);
    if(!i)
        return ctx.reply('Wrong request, try smth like: get link <int>');

    if(i < 1 || i > 4)
        return ctx.reply('Wrong request. Link must be from 1 to 4');
    
    let link = await $.link(i-1);
    ctx.reply('Вот ссылка:\n' + link.href);

    console.log(ctx.message.text);
});

bot.command('set', async (ctx) => {

    if(ctx.message.text.length != 5)
        return ctx.reply('Чтоб выбрать set - надо написать: set <число от 1 до 3>');

    let i = parseInt(ctx.message.text[ctx.message.text.length - 1]);
    if(!i)
        return ctx.reply('Чтоб выбрать set - надо написать: set <число от 1 до 3>');

    if(i < 1 || i > 3)
        return ctx.reply('Чтоб выбрать set - надо написать: set <число от 1 до 3>');

    if(i - 1 == ctx.set)
        return ctx.reply('Эта клавиатура активна');
    $.userSet(ctx.uid,i-1);
    ctx.reply('Новая раскладка', null, mainKeys[i-1]);
    
});

//TEST
bot.command('test', async (ctx) => {
    ctx.reply(`Привет! 
    
    Спасибо что участвуешь в тесте бота. 
    Мы добавляем достаточно большое число функций за раз, не тестируя их должным образом. Поэтому мы надеемся на Вашу помощь.
    
    Если Вы встретите недочеты, или у Вас есть предложения, то пишите их с тегом #info.
    
    Если Вы встретие баги, то сообщайте о них с помощью тега #bug.
    
    Приятного пользования!!!`);
});

bot.command('#bug', async (ctx) => {
    $.logBug(ctx.message.user_id,ctx.message.text.substring(5),0);
    ctx.reply("Мы скоро все починим. Спасибо за помощь!");
});

bot.command('#info', async (ctx) => {
    $.logBug(ctx.message.user_id,ctx.message.text.substring(5),1);
    ctx.reply("Ничего себе! Будем знать!");
});

bot.command('Назад', async (ctx) => {
    ctx.reply('ok', null, mainKeys[ctx.set]);
});

/* let setKeys = {};
bot.command('Настройки', async (ctx) => {

    setKeys = genSettigsKeys(ctx);

    ctx.reply('Вот параметры (жди патча)',null,setKeys);
});

bot.command('param1', async (ctx) => {
    ctx.custom.param1 = !ctx.custom.param1;
    await $.userOption(ctx.uid,ctx.custom);

    ctx.reply('ок', null, genSettigsKeys(ctx));
});

bot.command('param2', async (ctx) => {
    ctx.custom.param2 = !ctx.custom.param2;
    await $.userOption(ctx.uid,ctx.custom);

    ctx.reply('ок', null, genSettigsKeys(ctx));
});


bot.command('param3', async (ctx) => {
    ctx.custom.param3 = !ctx.custom.param3;
    await $.userOption(ctx.uid,ctx.custom);

    ctx.reply('ок', null, genSettigsKeys(ctx));
});

function genSettigsKeys(ctx) {
    return Markup.keyboard([
        [
            Markup.button('param1', ctx.custom.param1 ? 'positive' : 'secondary'),
            Markup.button('param2', ctx.custom.param2 ? 'positive' : 'secondary'),
            Markup.button('param3', ctx.custom.param3 ? 'positive' : 'secondary')
        ],
        [
            Markup.button('Назад', 'primary'),
            Markup.button('Exit', 'negative')       
        ]
    ]);
}
 */




let helpString = `
    &#10067; СПИСОК КОМАНД

    ${mark} СМЕНИТЬ РАСКЛАДКУ: set <число от 1 до 3>
    ${mark} ? - узнать неделю

    РАСКЛАДКА 1    
    ${mark} Все - показывает все расписание
    ${mark} Неделя - показывает расписание на текущую неделю
    ${mark} Сегодня - расписание на сегодня
    ${mark} Завтра - расписание на завтра\n

    РАСКЛАДКА 2    
    ${mark} get link 1 - расписание 1ого курса
    ${mark} get link 2 - расписание 2ого курса
    ${mark} get link 3 - расписание 3ого курса
    ${mark} get link 4 - расписание 4ого курса
    ${mark} get week - узнать текущую неделю
    
    РАСКЛАДКА 3
    ${mark} <День недели> - Показывает расписание в этот день (на обе недели)

    НАСТРОЙКИ
    ${mark} На стадии разработки, показывает клавиатуру с будущими параметрами

    ${dark} #bug [message] - сообщить о баге
    ${dark} #info [message] - сообщить информацию (не хватает пары)    

    ${dark} exit - сбросить персональные настройки
    `;

bot.command('help', (ctx) => {
    ctx.reply(helpString)
});

bot.command('/keyup', (ctx) => {
    ctx.reply("Держи кнопки", null, mainKeys[ctx.set]);
});

bot.command('/keydown', (ctx) => {
    ctx.reply("Окей", null, Markup.keyboard([]));
});

bot.command('exit', (ctx) => {
    ctx.reply("Учетная запись удалена", null, Markup.keyboard([]));
    $.delete(ctx.message.user_id ? ctx.message.user_id : ctx.message.peer_id);
});

let wrongQuestionStrings = [
    "help - список команд"
];

bot.use((ctx,next) => {
    console.log(ctx.message.peer_id + " in pipe line end");
    ctx.reply(wrongQuestionStrings[0]);
});

bot.startPolling(() => {
    console.log("I'm online", true);
})

let days = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
let weeks = ["Нижняя неделя", "Верхняя неделя"];
let short_weeks = ["down", "up"]

function createDayBlock(ctx, data, d, w, h = true) {
    let str = h ? `&#128198; ${days[d]} [${weeks[w]}]\n\n` : `&#128309; ${days[d]} \n`;
    for(let i = 0; i < data.length; ++i) {
        if(data[i].content == 'ВОЕННАЯ ПОДГОТОВКА') {
            str += 'ВОЕННАЯ ПОДГОТОВКА\n';
            break;
        }
        else {
            if(data[i].content.startsWith('ФИЗИЧЕСКАЯ КУЛЬТУРА'))
                data[i].content = 'ФИЗИЧЕСКАЯ КУЛЬТУРА';
            str += (h ? dark : mark) + " " + data[i].time + "\n" + data[i].content + '\n'; 
        }
    }
    if(data.length == 0)
        str += "ВЫХОДНОЙ\n"

    return str;
}

async function getBlockByDayNum(ctx, num) {
    let day = await $.getDayBig(ctx.group, ctx.sub, num);
    let up = day.filter(el => el.week == 'UP');
    let text = createDayBlock(ctx,up,num,1);
    text += '\n';
    let down = day.filter(el => el.week == 'DOWN');
    text += createDayBlock(ctx,down,num,0);

    return text;
}

let interval = setInterval(async () => {
    let e = await $.getEvent('update');
    let u;
    for(let i = 0; i < e.length; ++i) {
        u = (await $.userByGroup(e[i].content.group, e[i].content.sub)).map(el => el.userId);
        if(u && u.length != 0)
            bot.sendMessage(u,'Расписание обновилось!');
    }

   

} , 4000);

}


function deleteBotName(text) {
    if(text.startsWith('[')) {
        let i = text.indexOf(']');
        return text.substring(i + 2);
    }
    else
        return text;
}



