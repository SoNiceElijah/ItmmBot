const vkBot = require('node-vk-bot-api')
const Markup = require('node-vk-bot-api/lib/markup');

const Scene = require('node-vk-bot-api/lib/scene')
const Stage = require('node-vk-bot-api/lib/stage')
const Session = require('node-vk-bot-api/lib/session')


const mainKeys =  Markup.keyboard([
    [
        Markup.button('Все', 'secondary'),
        Markup.button('Неделя', 'secondary'),
        Markup.button('Сегодня', 'secondary'),
        Markup.button('Завтра', 'secondary')
    ]
]);
//require('./update');
const sc = 
    new Scene('meet',
    (ctx) => {
        ctx.scene.next();
        ctx.reply('Привет! Кажется мы еще не знакомы, из какой ты группы? (Например: 382103-4)')
    },
    (ctx) => {
        ctx.scene.next();
        ctx.session.group = ctx.message.body.trim();

        ctx.reply('В какой ты подгруппе? (1 или 2, если подгруппы нет, то напиши любую)');
    },
    (ctx) => {
        console.log(ctx.message.body);
        $.register(ctx.message.user_id, ctx.session.group ,ctx.message.body.trim());

        ctx.scene.leave();
        ctx.reply('Отлично! Теперь ты сможешь получать расписание!',null, mainKeys);
    });

let $ = require('./map');
$.init();

const bot = new vkBot({
   token : "6a0ac777d5312fd4242c4b3c0fd6b2428e9368b16d2ede70d7a78be92dcd37ddce53eab0bc551a5f1b7d8",
   group_id : 186457555
});


bot.use((new Session).middleware());
bot.use((new Stage(sc)).middleware());

bot.use(async (ctx, next) => {
    let user = await $.user(ctx.message.user_id);
    if(!user)
        ctx.scene.enter('meet');
    else {
        ctx.group = user.group;
        ctx.sub = user.sub;
        next();
    }
});

bot.use(async (ctx, next) => {

    let d = new Date();

    ctx.w = d.getWeekNumber() % 2;
    ctx.d = d.getDay() - 1;

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
    ctx.reply(createDayBlock(ctx, data, d-1, w));

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

bot.command('#bug', async (ctx) => {
    $.log(ctx.message.user_id,ctx.message.body.substring(5),0);
    ctx.reply("Мы скоро все починим. Спасибо за помощь!");
});

bot.command('#info', async (ctx) => {
    $.log(ctx.message.user_id,ctx.message.body.substring(5),1);
    ctx.reply("Ничего себе! Будем знать!");
});



let mark = "&#128313;";
let dark = "&#128310;";

let helpString = `
    &#10067; СПИСОК КОМАНД\n 
    ${mark} Все - показывает все расписание
    ${mark} Неделя - показывает расписание на текущую неделю
    ${mark} Сегодня - расписание на сегодня
    ${mark} Завтра - расписание на завтра\n

    ${dark} #bug - сообщить о баге
    ${dark} #info - сообщить информацию (не хватает пары)    
    `;

bot.command('/help', (ctx) => {
    ctx.reply(helpString, null, mainKeys)
});

bot.command('/keyup', (ctx) => {
    ctx.reply("Держи кнопки", null, mainKeys);
});

bot.command('/keydown', (ctx) => {
    ctx.reply("Окей", null, Markup.keyboard([]));
});

bot.command('/exit', (ctx) => {
    ctx.reply("Учетная запись удалена", null, Markup.keyboard([]));
    $.delete(ctx.message.user_id);
});

let wrongQuestionStrings = [
    "Я не знаю такой команды. Напиши /help, чтоб посмотреть что я умею",
    "Не понимаю о чем ты, нужна помощь? /help",
    "Слушай, мне кажется тебе нужно написать /help",
    "..."
];
let wQSMem = []

bot.use((ctx,next) => {
    let i = wQSMem.findIndex(el => el.id == ctx.message.user_id);
    if(i != -1)
    {
        if(wQSMem[i].index == 2)
        {
            wQSMem.splice(i,1);
            ctx.reply(wrongQuestionStrings[3], null, Markup.keyboard([
                Markup.button('/HELP', 'primary'),
            ]).oneTime());
        }
        else
            ctx.reply(wrongQuestionStrings[++wQSMem[i].index]);
    }
    else
    {
        console.log(ctx.message.user_id + " <- Made wrong command");

        wQSMem.push({
            id : ctx.message.user_id,
            index : 0
        })

        ctx.reply(wrongQuestionStrings[0]);
    }
    
});

bot.startPolling(() => {
    console.log("I'm online");
})

let days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
let weeks = ["Нижняя неделя", "Верхняя неделя"];
let short_weeks = ["down", "up"]

function createDayBlock(ctx, data, d, w, h = true) {
    let str = h ? `&#128198; ${days[d]} [${weeks[w]}]\n\n` : `&#128309; ${days[d]} (${short_weeks[w]}) \n`;
    for(let i = 0; i < data.length; ++i) {
        str += (h ? dark : mark) + " " + data[i].time + "\n" + data[i].content + '\n'; 
    }
    if(data.length == 0)
        str += "ВЫХОДНОЙ"

    return str;
}

