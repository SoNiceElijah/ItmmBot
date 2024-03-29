const mongoClient = require("mongodb");
const crypto = require('crypto');
const fs = require('fs');

let db = {}
let time = {}
let user = {}
let log = {}
let link = {}
let group = {}
let event = {}
let exams = {}
let secret = {}

let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
let weeks = ["DOWN", "UP"]

let settings = require('./set');

async function dataUpdate() {
    await time.insertOne({x : 1});
    await time.drop();
    for(let i = 0; i < settings.docTable.length; ++i) {
        let data = JSON.parse(fs.readFileSync(`./outtmp/ttOut${i}.json`, 'utf8'));
        let j = 0;
        for( ; j < data.length; ++j) {

            data[j].content = data[j].content.trim();
            data[j].group = data[j].group.trim();

            await time.insertOne(data[j]);
        }
        console.log(`Done ${j} items`, true);
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
                if(!settings.mute) {
                    await event.insertOne({
                        type : 'update',
                        content : {
                        group : gs[i],
                            sub : j + ''
                        }
                    });
                }
                console.log("g: " + gs[i] + " sub: " + j + ' are updated!', true);
            }
        }
    }

    settings.siteFreeze = false;
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
            exams = db.collection('examsTable');
            secret = db.collection('secretTable');
        }
        catch (ex) {console.log(ex);}
    },
    collections : async (name, offset, limit, query) => {
        if(!name)
            return await db.listCollections().toArray();
        else {
            let q = {}
            if(query)
                try {
                    q = JSON.parse(query);
                } catch (ex) {q = {}; console.log(ex.message,true);}
            return await db.collection(name).find(q).sort({_id : -1}).skip(offset).limit(limit).toArray();
        }
    },
    count : async (name, query) => {
        if(!name)
            return;
        let q = {}
        if(query)
            try {
            q = JSON.parse(query);
            } catch (ex) {console.log(ex.message,true);}
        return await db.collection(name).countDocuments (q);
    },
    collectionUpdate : async (name, id, query) => {
        let q;
        try {
            q = JSON.parse(query);
            delete q._id;
        } catch (ex) {console.log(ex.message,true); return;}

        await db.collection(name).updateOne({
            _id : mongoClient.ObjectId(id)
        }, {
            $set : q
        })
    },
    collectionDelete : async (name, id) => {
        await db.collection(name).deleteOne({ _id : mongoClient.ObjectId(id)  });
    },
    collectionInsert : async (name, query) => {
        let q;
        try {
            q = JSON.parse(query);
        } catch (ex) {console.log(ex.message,true); return;}
        await db.collection(name).insertOne(q);
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
    logBug : async (id, text, lvl) => {
        log.insertOne({
            userId : id,
            message : text,
            lvl : lvl
        });
    },
    logNow : (msg) => {
        log.insertOne({
            msg : msg,
            date : (new Date()).getUTCTime(),
        });
    },
    logData : {},
    log : async (msg) => {
        if(!this.pipesCount)
            this.pipesCount = 0;
        if(!this.logData) {
            this.pipesCount++;
            this.logData = { num : this.pipesCount};
        }
        if(!this.logData.pipe)
            this.logData.pipe = [];
        let ddd = new Date();
        this.logData.pipe.push({
            msg : msg,
            date : (new Date()).getUTCTime()
        });
    },
    getLog : async (offset, limit, from, to, msg) => {
        if(!msg) {
            return await log.find({
                date : { $gte : from, $lte : to},
            }).sort({_id : -1}).skip(offset).limit(limit).toArray();
        }
        else {
            return await log.find({
                $or : [
                    { msg : { $regex : ".*" + msg + "*." } },
                    { pipe : { $elemMatch : {msg : { $regex : ".*" + msg + "*." }}} }
                ],
                date : { $gte : from, $lte : to},
            }).sort({_id : -1}).skip(offset).limit(limit).toArray();
        }
    },
    logDown : async () => {
        this.logData.date = (new Date()).getTime();
        log.insertOne(this.logData);
        this.logData = null;
    },
    checkLink : async (id, href) => {
        let data = (await link.findOne({num:id}));
        if(!data) {
            link.insertOne({num : id, href : href, date : (new Date()).getUTCTime()});
            return false
        }
        if(data.href == href)
            return true;
        else {
            link.updateOne({num : id}, {$set : {href : href, date : (new Date()).getUTCTime()}});
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
    linkAll : async () => {
        return await link.find({}).toArray();
    },
    dropLink: async () => {
        link.drop();
    },
    getEvent : async (type) => {
        let data = await event.find({type : type}).toArray();
        await event.deleteMany({type : type});

        return data;
    },
    getLastCheckDate : async () => {
        return (await log.find({ msg : "Check update....." }).sort({_id : -1}).limit(1).toArray())[0].date;
    },
    renewExams : async (data) => {
        try {
            await exams.drop();
        }
        catch (ex) {};
        await exams.insertMany(data);
    },
    allExams : async () => {
        return await exams.find({}).toArray();
    },
    getExams : async (g, s) => {
        arr = await exams.find({ groups : {$regex : ".*" + g + ".*"}}).toArray();
        arr = arr.filter(
            e => (e.groups.length ==e.groups.indexOf(g) + g.length 
            || e.groups[e.groups.indexOf(g) + g.length] != '(')
            || e.groups.indexOf(g + '(' + s + ')') != -1 );

        return arr;
    },
    stat : async () => {
        let data = await secret.findOne();
        if(!data)
            await secret.insertOne({time : "I don't know..."});
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

