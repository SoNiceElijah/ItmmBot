const mongoClient = require("mongodb");
let db = {}
let collection = {}

function dataUpdate() {
    for(let i = 0; i < 4; ++i) {
        data = require(`./outtmp/ttOut${i}.json`);
        let j = 0;
        for( ; j < data.length; ++j) {
            collection.insertOne(data[j]);
        }
        console.log(`Done ${j} items`);
    }
}

module.exports = {
    init : async () => {
        let client = await mongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true });
        db = client.db("ItmmTimeTable");
        collection = db.collection("timeTable");
    },
    update : dataUpdate,   
    getByGroup : async (g) => {
        let up = await collection.find({ week : "UP", group : g });
        let down = await collection.find({ week : "DOWN", group : g }); 

        return {
            up : up,
            down : down
        };
    }
}