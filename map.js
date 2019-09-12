const mongoClient = require("mongodb");
let db = {}
let time = {}
let user = {}
let log = {}

let days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
let weeks = ["UP", "DOWN"]

async function dataUpdate() {
    
    await time.drop();
    for(let i = 0; i < 4; ++i) {
        data = require(`./outtmp/ttOut${i}.json`);
        let j = 0;
        for( ; j < data.length; ++j) {

            data[j].content = data[j].content.trim();
            data[j].group = data[j].group.trim();

            time.insertOne(data[j]);
        }
        console.log(`Done ${j} items`);
    }
}

module.exports = {
    init : async () => {
        let client = await mongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true });
        db = client.db("ItmmTimeTable");
        time = db.collection("timeTable");
        user = db.collection("userTable");
        log = db.collection("logTable");
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
            day : days[n -1],
            week : weeks[w % 2],
            subgroup : s
        })).toArray();
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
            sub : s
        })
    },
    user : async (id) => {
        return await user.findOne({ userId : id});
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