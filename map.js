const mongoClient = require("mongodb");
const crypto = require('crypto');

let db = {}
let time = {}
let user = {}
let log = {}
let link = {}
let group = {}
let event = {}

let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
let weeks = ["DOWN", "UP"]

let settings = require('./set');

async function dataUpdate() {
    await time.drop();
    for(let i = 0; i < 4; ++i) {
        let data = require(`./outtmp/ttOut${i}.json`);
        let j = 0;
        for( ; j < data.length; ++j) {

            data[j].content = data[j].content.trim();
            data[j].group = data[j].group.trim();

            await time.insertOne(data[j]);
        }
        console.log(`Done ${j} items`);
    }

    //Group hash recount
    let arr = await time.find({}).toArray();
    let gs = arr.map(el => el.group).filter((el,i,arr) => arr.indexOf(el) === i);
    
    for(let i = 0; i < gs.length; ++i) {
        for(let j = 1; j < 3; ++j) {

            let lessons = await time.find({ group : gs[i], subgroup : j + '' }).toArray();

            let hash = crypto.createHmac('sha256','a1b1c1d1')
                .update(lessons.map(el => el.time + '' + el.content + '' + el.week + '' + el.day).join(' '))
                .digest('hex');
            
            if(!(await module.exports.checkHash(gs[i],  j + '', hash))) {
                //await event.insertOne({
                //    type : 'update',
                //    content : {
                //        group : gs[i],
               //         sub : j + ''
               //     }
                //});
                console.log("g: " + gs[i] + " sub: " + j + ' are updated!');
            }
        }
    }

    settings.freeze = false;
}

module.exports = {
    init : async () => {
        try {
            let client = await mongoClient.connect("mongodb://localhost:27017",{ useNewUrlParser: true ,useUnifiedTopology: true});
            db = client.db("ItmmTimeTable");
            time = db.collection("timeTable");
            user = db.collection("userTable");
            log = db.collection("logTable");
            link = db.collection('linkTable');
            group = db.collection('groupTable');
            event = db.collection('eventTable');
        }
        catch (ex) {console.log(ex);}
    },
    update : dataUpdate,   
    getAll : async (g, s) => {

        let data = await (await time.find({
            group : g,
            subgroup : s

        })).toArray();

        let final = [];
        for(let i = 0; i < 7; ++i) {
            final.push(data.filter((e) => e.day == days[i] && e.week == "UP"));
        }
        for(let i = 0; i < 7; ++i) {
            final.push(data.filter((e) => e.day == days[i] && e.week == "DOWN"));
        }

        return final;
    },
    getDay : async (g, s, wow) => {
        let d = wow;
        if(!wow)
            d = new Date();
        let w = d.getWeekNumber();
        let n = d.getDay();

        return (await time.find({
            group : g,
            day : days[n],
            week : weeks[w % 2],
            subgroup : s
        })).toArray();
    },
    getDayBig : async (g,s,n) => {
        return (await time.find({
            group : g,
            day : days[n],
            subgroup : s
        })).toArray();
    },
    checkGroup : async(g) => {
        let data = await (await time.find({group : g})).toArray();
        if(data.length == 0)
            return false;
        else
            return true;
    },
    getWeek : async (g,s) => {
        let d = new Date();
        let w = d.getWeekNumber();
        let data = await (await time.find({
            group : g,
            subgroup : s,
            week : weeks[w % 2],

        })).toArray();

        let final = [];
        for(let i = 0; i < 7; ++i) {
            final.push(data.filter((e) => e.day == days[i]));
        }

        return final;

    },
    register : async (id, group, sub) => {

        let s = (parseInt(sub)) + "";
        user.insertOne({
            userId : id,
            group : group,
            sub : s,
            set : 0,
            option : {
                param1 : true,
                param2 : true,
                param3 : true
            }
        })
    },
    user : async (id) => {
        return await user.findOne({ userId : id});
    },
    userSet : async (id, set) => {
        await user.updateOne({userId : id}, { $set: { set : set}});
    },
    userByGroup : async (gr, sub) => {
        return await user.find({group : gr, sub : sub}).toArray();
    },
    userOption : async (id, op) => {
        await user.updateOne({ userId : id}, { $set : { option : op }});
    },
    delete: async (id) => {
        user.deleteOne({ userId : id});
    },
    log : async (id, text, lvl) => {
        log.insertOne({
            userId : id,
            message : text,
            lvl : lvl
        });
    },
    checkLink : async (id, href) => {
        let data = (await link.findOne({num:id}));
        if(!data) {
            link.insertOne({num : id, href : href});
            return false
        }
        if(data.href == href)
            return true;
        else {
            link.updateOne({num : id}, {$set : {href : href}});
            return false;
        }
    },
    checkHash : async (gr,sub, hash) => {
        let data = (await group.findOne({group:gr, sub : sub}));
        if(!data) {
            group.insertOne({group : gr, sub : sub, hash : hash});
            return false
        }
        if(data.hash == hash)
            return true;
        else {
            group.updateOne({group : gr, sub : sub}, {$set : {hash : hash}});
            return false;
        }
    },
    link : async (n) => {
        return await link.findOne({num : n}); 
    },
    getEvent : async (type) => {
        let data = await event.find({type : type}).toArray();
        await event.deleteMany({type : type});

        return data;
    }
}

//RobG ty
Date.prototype.getWeekNumber = function(){
    var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
  };

