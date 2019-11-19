//Game

let picture = [
`_________
|&#12288;&#12288;&#12288;|&#12288;`
,

` ______________
&#12288;&#12288;|
&#12288;&#12288;|
&#12288;&#12288;|
&#12288;&#12288;|
____|____
|&#12288;&#12288;&#12288;|&#12288;`
,
    
    ` ______________
 &#12288;&#12288;|&#12288;&#12288;|
 &#12288;&#12288;|
 &#12288;&#12288;|
 &#12288;&#12288;|
____|____
 |&#12288;&#12288;&#12288;|&#12288;`
 ,
    ` ______________
 &#12288;&#12288;|&#12288;&#12288;|
 &#12288;&#12288;|&#12288; \\O/
 &#12288;&#12288;|
 &#12288;&#12288;|
____|____
 |&#12288;&#12288;&#12288;|&#12288;`
,
` ______________
&#12288;&#12288;|&#12288;&#12288;|
&#12288;&#12288;|&#12288; \\O/
&#12288;&#12288;|&#12288;&#12288;|
&#12288;&#12288;|
____|____
|&#12288;&#12288;&#12288;|&#12288;` 
,
` ______________
&#12288;&#12288;|&#12288;&#12288;|
&#12288;&#12288;|&#12288; \\O/
&#12288;&#12288;|&#12288;&#12288;|
&#12288;&#12288;|&#12288; /&#12288;\\
____|____
|&#12288;&#12288;&#12288;|&#12288;`
];

let score = {}
let alphabet = {}

let step = {}
let inGame = {}

let words = [
    "Толерантность", 
    "эксгумация",
    "либерализм",
    "экспонат",
    "пышность",
    "скабрёзность",
    "шаловливость",
    "экспозиция",
    "индульгенция",
    "контрацептив",
    "шкворень",
    "эпиграф",
    "эпитафия",
    "барбекю",
    "жульен",
    "энцефалопатия",
    "парашютист",
    "импозантность",
    "индифферент",
    "демультипликатор",
    "педикулёз",
    "выхухоль", 
    "россомаха",
    "сущность",
    "поэтапность",
    "напыщенность",
    "возвышенность"
]
let dictionary = {}

let createMask = (ctx) => {
    
    let wordString = "";

    for(let i = 0; i < dictionary.length; ++i)
    {
        wordString += " _"; 
        for(let j = 0; j < alphabet['u' + ctx.message.peer_id].length; ++j)
        {            
            if(dictionary[i] == alphabet['u' + ctx.message.peer_id][j])
            {
                wordString = wordString.substr(0, wordString.length - 2);
                wordString += " " + dictionary[i];
                break;
            }                
        }
    }

    return wordString;
}

let drop = (ctx) => {
    delete inGame['u' + ctx.message.peer_id];
    delete alphabet['u' + ctx.message.peer_id];
    delete step['u' + ctx.message.peer_id];
    delete dictionary['u' + ctx.message.peer_id];
    
}

module.exports = async (ctx, next) => {
    if(inGame["u" + ctx.message.peer_id])
    {
        if(ctx.message.text.toUpperCase() == "выход".toUpperCase() )
        {
            drop(ctx);
            return ctx.reply('Ты вышел из игры');
        }

        if(ctx.message.text.length == 1)
        {  
            if(dictionary['u' + ctx.message.peer_id].toUpperCase().includes(ctx.message.text.toUpperCase()))
            {
                let wordString = "";
                if(!alphabet['u' + ctx.message.peer_id]) alphabet['u' + ctx.message.peer_id] = [];

                if(alphabet['u' + ctx.message.peer_id].includes(ctx.message.text.toUpperCase()))
                {
                    return ctx.reply("Ты уже пробовал эту букву!");
                }

                alphabet['u' + ctx.message.peer_id].push(ctx.message.text.toUpperCase());

                let nums = 0;
                for(let i = 0; i < dictionary['u' + ctx.message.peer_id].length; ++i)
                {
                    wordString += " _";
                    for(let j = 0; j < alphabet['u' + ctx.message.peer_id].length; ++j)
                    {
                        if(dictionary['u' + ctx.message.peer_id][i] == alphabet['u' + ctx.message.peer_id][j])
                        {
                            wordString = wordString.substr(0, wordString.length - 2);
                            wordString += " " + dictionary['u' + ctx.message.peer_id][i];
                            ++nums;

                            break;
                        }
                    }
                }

                ctx.reply("Такая буква есть в слове!\n" + wordString);

                if(nums == dictionary['u' + ctx.message.peer_id].length)
                {
                    if(!score['u' + ctx.message.peer_id]) score['u' + ctx.message.peer_id] = 0;
                    score['u' + ctx.message.peer_id]++;
                    ctx.reply("Угадал! Твой счет: " + score['u' + ctx.message.peer_id] + "\n\n Если понравился бот - поддержи наш проект! (В странице сообщества теперь доступны донаты)))" );
                
                    drop(ctx);
                }
            }
            else
            {
                if(!alphabet['u' + ctx.message.peer_id]) alphabet['u' + ctx.message.peer_id] = [];

                if(alphabet['u' + ctx.message.peer_id].includes(ctx.message.text.toUpperCase()))
                {
                    return ctx.reply("Ты уже пробовал эту букву!");
                }

                alphabet['u' + ctx.message.peer_id].push(ctx.message.text.toUpperCase());

                let alph = "";
                for(let j = 0; j < alphabet['u' + ctx.message.peer_id].length; ++j)
                {
                    alph += " " + alphabet['u' + ctx.message.peer_id][j];
                }
                
                if(step['u' + ctx.message.peer_id] == 'undefined' || step['u' + ctx.message.peer_id] == null) step['u' + ctx.message.peer_id] = -1;
                step['u' + ctx.message.peer_id]++;

                ctx.reply("Такой буквы нет в слове! \n\n" +
                    picture[step['u' + ctx.message.peer_id]] + "\n\n" + "Слово: " + createMask(ctx) + "\n Ты пробовал: " + alph);

                if(step['u' + ctx.message.peer_id] == "5")
                {
                    ctx.reply("Ты проиграл :( Попробуй еще раз!");

                    drop(ctx);
                }
            }
            
        }
        else if(dictionary['u' + ctx.message.peer_id].length == ctx.message.text.length) { 
        
            if(dictionary['u' + ctx.message.peer_id].toUpperCase() == ctx.message.text.toUpperCase())
            {
                if(!score['u' + ctx.message.peer_id]) score['u' + ctx.message.peer_id] = 0;
                score['u' + ctx.message.peer_id]++;
                ctx.reply("Угадал! Твой счет: " + score['u' + ctx.message.peer_id] + "\n\n Если понравился бот - поддержи наш проект! (В странице сообщества теперь доступны донаты)))" );
                
                drop(ctx);
            }
            else
            {
                let alph = "";
                for(let j = 0; j < alphabet['u' + ctx.message.peer_id].length; ++j)
                {
                    alph += " " + alphabet['u' + ctx.message.peer_id][j];
                }

                if(step['u' + ctx.message.peer_id] == 'undefined' || step['u' + ctx.message.peer_id] == null) step['u' + ctx.message.peer_id] = -1;
                step['u' + ctx.message.peer_id]++;

                let loseString = ""
               

                ctx.reply("Не угадал! \n\n" +
                    picture[step['u' + ctx.message.peer_id]] + "\n\n" + "Слово: " + createMask(ctx) + "\n Ты пробовал: " + alph + "\n");

                if(step['u' + ctx.message.peer_id] == "5")
                {
                    ctx.reply("Ты проиграл :( Попробуй еще раз!");

                    drop(ctx);
                }
            }
        }
        else
        {
            ctx.reply("Введи букву или все слово целиком (кажется ты ввел слово неправильной длины)");
        }


    }
    else {
        if(ctx.message.text.toUpperCase() == "ход".toUpperCase() )
        {
           
            
            let number = Math.floor(Math.random() * (words.length - 1));

            dictionary['u' + ctx.message.peer_id] = words[number].toUpperCase() ;

            let wordString = "_";
            for(let i = 1; i < dictionary['u' + ctx.message.peer_id].length; ++i)
            {
                wordString += " _";
            }

            inGame["u" + ctx.message.peer_id] = true;
            ctx.reply("О! Ты тоже любишь настолки? У меня есть одна игра для тебя. Загадаю слово, а ты должен его отгадать. Можешь присылать буквы слова или все слово целиком!\n\n Слово: " + wordString);
        }
        else
        {
            next();
        }
    }
}




` _______
   |    |
   |   \O/
   |    |
   |   / \
___|___
 |   |    `


