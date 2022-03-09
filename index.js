const express = require("express");
const app = express();
const lodash = require("lodash")
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const bodyParser = require("body-parser")

app.use(express.static(__dirname));

async function botstr(findstr){
    let { NlpManager } = require("node-nlp");
    const manager = new NlpManager({ languages: [ "en" ], nlu: { useNoneFeature: false } });

    manager.addDocument('en', 'goodbye for now', 'greetings.bye');
    manager.addDocument('en', 'bye bye take care', 'greetings.bye');
    manager.addDocument('en', 'okay see you later', 'greetings.bye');
    manager.addDocument('en', 'bye for now', 'greetings.bye');
    manager.addDocument('en', 'i must go', 'greetings.bye');
    manager.addDocument('en', 'hello', 'greetings.hello');
    manager.addDocument('en', 'hi', 'greetings.hello');
    manager.addDocument('en', 'howdy', 'greetings.hello');
    
    // Train also the NLG
    manager.addAnswer('en', 'greetings.bye', 'Till next time');
    manager.addAnswer('en', 'greetings.bye', 'see you soon!');
    manager.addAnswer('en', 'greetings.hello', 'Hey there!');
    manager.addAnswer('en', 'greetings.hello', 'Greetings!');

    await manager.train();
    manager.save();
    const response = await manager.process('en', findstr);
    console.log(response);
    return response.answer;

}

app.get("/", async (req, res) =>{
    res.sendFile(__dirname + "/index.html")
});

io.on("connection", function(socket) {
    console.log("a user coonected");
    socket.on("Disconnect", function(){
        console.log("user disconnected");
    });
    socket.on('chat message', function(msg){
        console.log("message: " + msg);
        io.emit('chat message', msg);
        botstr(msg)
        .then(result => {
            if (result == null) {
                io.emit("chat message", " Sorry ");
            } else {
                io.emit("chat message", result)
            }
        })
    })
}) 

let port = process.env.PORT || 4000;

http.listen(port, ()=>{
   console.log(`App is running at the port ${port}`) ;
});