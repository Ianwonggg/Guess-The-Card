var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv,{});

//express stuff
app.get('/',function(req, res){
    res.sendFile(__dirname + '/client/index.html');
});

app.use('/client',express.static(__dirname+'/client'));

//defining stuff
var socketList = {};    
const maxUniqueCard = 42;

serv.listen(2000);
console.log("Server Started");

//Connecting to client
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    socketList[socket.id] = socket;
    console.log(socket.id + ' socket connection');

    socket.on('disconnect',function(){
        delete socketList[socket.id];
        console.log(socket.id + ' socket disconnect');
    });

    socket.on('signIn',function(data){
      if(isUsernameTaken(data.username)){
          socket.emit('signInResponse',{success:false});
          console.log(socket.id + " SignIn Failed");
      }  
      else{
        socketList[socket.id].username = data.username; 
        socketList[socket.id].isReady = false;
        socket.emit('signInResponse',{success:true});
        console.log(socket.id + " SignIn Success");
      }
    });

    socket.on('sendChatMsg',function(data){
        var playerName = socketList[socket.id].username + ": ";
        var firstIndex = 0;
        while(data[firstIndex] === ' '){
            firstIndex += 1;
            console.log(firstIndex);
        }
        var regex = new RegExp("/addcard\(\d\)/");
        if(data[firstIndex] === '/'){
            command = data.substring(firstIndex+1);
            if(command == "display"){
                socket.emit('addToChat', initStack.cardArray);
            }
            else if(command == "playerlist"){
                var playerPrint = " ";
                for(var i in socketList){
                    playerPrint = playerPrint +socketList[i].username;
                }
                socket.emit('addToChat', playerPrint);
            }

            else if(regex.test(command)){
                initStack.cardStack.shift(command.match("/\d?/"));
                socket.emit('addToChat', "added card");
            }
            else{
                socket.emit('addToChat', "Command not Found");
            }
        }
        else{
        for(var i in socketList){
            socketList[i].emit('addToChat', playerName + data); 
        }
    }
        });
    socket.on('guess',function(data){
        if(socket.isPlaying){
        var playerName = socketList[socket.id].username;
        initStack.guess(data.type,data.colour,playerName);
        }
        else{
            for(var i in socketList){
                socketList[i].emit("addToChat", "You are not playing the game, cannot use commands");
            }
        }
    });

    socket.on('shuff', function(){
        if(socket.isPlaying){
            var playerName = socketList[socket.id].username;
            initStack.shuff(playerName,false);
            }
            else{
                for(var i in socketList){
                    socketList[i].emit("addToChat", "You are not playing the game, cannot use commands");
                }
            }
    });

    socket.on('fly', function(data){
        if(socket.isPlaying){
            var playerName = socketList[socket.id].username;
        if((data.one+data.two+data.three+data.four+data.five)!== "01234" || initStack.cardArray.length<5){
            for(var i in socketList){
                socketList[i].emit("addToChat", playerName+ " used fly unsuccessfully, does not meet format");
            }
        }
        else{
            for(var i in socketList){
                socketList[i].emit("addToChat", playerName+ " used fly successfully");
            }
            initStack.fly(data.one,data.two,data.three,data.four,data.five);
        }
            }
            else{
                for(var i in socketList){
                    socketList[i].emit("addToChat", "You are not playing the game, cannot use commands");
                }
            } 
    });

    socket.on('call', function(data){
        if(socket.isPlaying){
            var playerName = socketList[socket.id].username;
            initStack.call(data.oneType,data.oneColour,data.twoType,data.twoColour,playerName);
            }
            else{
                for(var i in socketList){
                    socketList[i].emit("addToChat", "You are not playing the game, cannot use commands");
                }
            }
    });

    socket.on('toggleReady',function(){
        var playerName = socketList[socket.id].username;
        if(!socketList[socket.id].isReady){
            socketList[socket.id].isReady = true;
            var numReady = 0;
            //checks how many players are ready
            for(var i in socketList){   
                if(socketList[i].isReady){
                    numReady +=1;
                }
            }   
            var allPlayersReady = true;
            //checks if all players are ready .length does not work I think
            for(var i in socketList){
                if(!socketList[i].isReady){
                    allPlayersReady = false;
                }
            }
            for(var i in socketList){
                socketList[i].emit("addToChat", playerName+ " is ready"+ ", "+ numReady + "/4");
            }
            //starts the game if all players are ready
            if(allPlayersReady || numReady == 4 ){
                //gamestart
                console.log("gameStart");
                for(var i in socketList){
                    socketList[i].emit("gameStart", {});
                }
                for(var i in socketList){
                    socketList[i].emit("addToChat", "Game Start");
                }
                for(var i in socketList){
                    if(socketList[i].isReady){
                        socketList[i].isPlaying = true;
                        socketList[i].isReady = false;
                    }
                    else  {
                        socketList[i].isPlaying = false;
                    }
                }
            }
        }
        else{
            socketList[socket.id].isReady = false;
            var numReady = 0;
            //checks how many players are ready
            for(var i in socketList){
                if(socketList[i].isReady){
                    numReady +=1;
                }
            } 
            for(var i in socketList){
                socketList[i].emit("addToChat", playerName+ " unreadied" +", "+ numReady + "/4");
            }
        }
    });
});

//username checker
function isUsernameTaken(username){
    for(var i in socketList){
        var socket = socketList[i];
        if(socket.username == username){
            return true;
        }
    }
    return false;
}


//gameloop
setInterval(function(){
    for(var i in socketList){
        var socket = socketList[i];
    }
},1000/25)

//Random Functions
function getRandomRange(min,max){
    return Math.round(Math.random()*(max-min)+min);
}

//keep all the cards by index
const cardTypeArray = ["0 red","1 red","2 red","3 red","4 red","5 red","6 red","7 red","8 red","9 red","0 blue","1 blue","2 blue","3 blue","4 blue","5 blue","6 blue","7 blue","8 blue","9 blue","0 green","1 green","2 green","3 green","4 green","5 green","6 green","7 green","8 green","9 green","0 yellow","1 yellow","2 yellow","3 yellow","4 yellow","5 yellow","6 yellow","7 yellow","8 yellow","9 yellow","shuff","fly","call"];


class cardStack{
    constructor(maxCards=13,maxType = 2){
        this.cardArray = [];
        this.usedArray = [];
        this.maxCards = maxCards;
        this.maxType = maxType;
        this.generateCardArray();
    }
    checkCardType(cardType){
        var countType = 0;
        for(var j = 0;j<this.cardArray.length;j++){
            if(this.cardArray[j]==cardType){
                countType++;
            }
        }
        if(countType>this.maxType){
            return true;
        }
        else{
            return false;
        }
    }
    generateCardArray(){
        for(var i = 0;i<this.maxCards;i++){
            var randCard = getRandomRange(0,maxUniqueCard);
            while(this.checkCardType(randCard)){
                randCard = getRandomRange(0,maxUniqueCard);
            }
            this.cardArray.push(randCard);
        }
    }

    getCard(type, colour){
        switch(type){
            case "shuff":
                return 40;
                break;
            case "fly":
                return 41;
                break;
            case "call":
                return 42;
                break;
            case "0":
                switch(colour){
                    case "red":
                        return 0;
                        break;
                    case "blue":
                        return 10;
                        break;
                    case "green":
                        return 20;
                        break;
                    case "yellow":
                        return 30;
                        break;
                }
            case "1":
                switch(colour){
                    case "red":
                        return 1;
                        break;
                    case "blue":
                        return 11;
                        break;
                    case "green":
                        return 21;
                        break;
                    case "yellow":
                        return 31;
                        break;
                }
            case "2":
                switch(colour){
                    case "red":
                        return 2;
                        break;
                    case "blue":
                        return 12;
                        break;
                    case "green":
                        return 22;
                        break;
                    case "yellow":
                        return 32;
                        break;
                }  
            case "3":
                switch(colour){
                    case "red":
                        return 3;
                        break;
                    case "blue":
                        return 13;
                        break;
                    case "green":
                        return 23;
                        break;
                    case "yellow":
                        return 33;
                        break;
                }     
            case "4":
                switch(colour){
                    case "red":
                        return 4;
                        break;
                    case "blue":
                        return 14;
                        break;
                    case "green":
                        return 24;
                        break;
                    case "yellow":
                        return 34;
                        break;
                }  
            case "5":
                switch(colour){
                    case "red":
                        return 5;
                        break;
                    case "blue":
                        return 15;
                        break;
                    case "green":
                        return 25;
                        break;
                    case "yellow":
                        return 35;
                        break;
                }
            case "6":
                switch(colour){
                    case "red":
                        return 6;
                        break;
                    case "blue":
                        return 16;
                        break;
                    case "green":
                        return 26;
                        break;
                    case "yellow":
                        return 36;
                        break;
                }
            case "7":
                switch(colour){
                    case "red":
                        return 7;
                        break;
                    case "blue":
                        return 17;
                        break;
                    case "green":
                        return 27;
                        break;
                    case "yellow":
                        return 37;
                        break;
                }
            case "8":
                switch(colour){
                    case "red":
                        return 8;
                        break;
                    case "blue":
                        return 18;
                        break;
                    case "green":
                        return 28;
                        break;
                    case "yellow":
                        return 38;
                        break;
                }
            case "9":
                switch(colour){
                    case "red":
                        return 9;
                        break;
                    case "blue":
                        return 19;
                        break;
                    case "green":
                        return 29;
                        break;
                    case "yellow":
                        return 39;
                        break;
                }  //I just realised I can do if blue = colour and if type = "0" = number and add both together but anyway I like this more
        }
    }
    guess(guessType,guessColour,username){
        if(this.getCard(guessType,guessColour)==this.cardArray[0]){
            for(var i in socketList){
                socketList[i].emit('addToChat',username+ " Guessed Correctly"  + ", "+  "Card was " + cardTypeArray[this.cardArray[0]]);
            }
        }
        else{
            for(var i in socketList){
                socketList[i].emit('addToChat',username+ " Guessed Incorrectly"  + ", "+  "Card was " + cardTypeArray[this.cardArray[0]]);
            }
            //fly when shuffed
            if(this.cardArray[0]===40){
                this.shuff(username,true);
            }
            //fly when drawn
            else if(this.cardArray[0]===41){
                this.flyRandom(username);
            }
            else if(this.cardArray[0]===42){
                if(this.getUsedLength==0){
                    for(var i in socketList){
                        socketList[i].emit('addToChat', username +" drew call but not enough cards to call");
                    }
                }
                else if(this.getUsedLength==1){
                    for(var i in socketList){
                        socketList[i].emit('addToChat', username +" drew call but only calling 1 card(only 1 card)");
                    }
                    //call singular card
                    for(var i in this.usedArray){
                        if(this.usedArray[i]!= undefined){
                            this.cardArray.push(this.usedArray[i]);
                            delete this.usedArray[i];
                        }
                    } 
                }
                else{
                    //mini call
                    var firstRandomIndex = 0;
                    var secondRandomIndex = 0;
                    while(this.usedArray[firstRandomIndex] == undefined){
                        firstRandomIndex+= 1;
                    }
                    while(this.usedArray[secondRandomIndex] == undefined || secondRandomIndex == firstRandomIndex){
                        secondRandomIndex +=1;
                    }
                    this.cardArray.push(this.usedArray[firstRandomIndex]);
                    this.cardArray.push(this.usedArray[secondRandomIndex]);
                    delete this.usedArray[firstRandomIndex];
                    delete this.usedArray[secondRandomIndex];
                    for(var i in socketList){
                        socketList[i].emit('addToChat', username +" drew call, calling 2 oldest guessed cards");
                    }  
                }
            }
        }
        this.usedArray.push(this.cardArray.shift());
        if(this.cardArray.length<=0){
            this.generateCardArray();
            for(var i in socketList){
                socketList[i].emit('addToChat', "Ran out of Cards, Generating New Deck");
            }
        }
    }
    shuff(username,isDrawn){
        var tempArray = [];
        var halfIndex = Math.floor((this.cardArray.length)/2);
        tempArray = this.cardArray.slice(0,halfIndex);
        this.cardArray.copyWithin(0,halfIndex,this.cardArray.length);
        for(var i = 0;i<tempArray.length;i++){
            if(this.cardArray.length%2 == 1){
                this.cardArray[i+halfIndex+1] = tempArray[i];
            }
            else{
                this.cardArray[i+halfIndex] = tempArray[i];
            }
        }
        if(isDrawn === true){
            console.log(username);
            for(var i in socketList){
                socketList[i].emit('addToChat', username +" drew Shuff, Shuffing");
            }
        }
        else{
        for(var i in socketList){
            socketList[i].emit('addToChat', username +" used Shuff");
        }
    }
    }
    
    fly(first,second,third,fourth,fifth){
        this.cardArray.push(this.cardArray[first]);
        this.cardArray.push(this.cardArray[second]);
        this.cardArray.push(this.cardArray[third]);
        this.cardArray.push(this.cardArray[fourth]);
        this.cardArray.push(this.cardArray[fifth]);
        for(var i = 0;i<5;i++){
            this.cardArray.shift();
        }
    }

    flyRandom(username){
        var first = 0;
        var second = 1;
        var third = 2;
        var fourth = 3;
        var fifth = 4;
        this.cardArray.push(this.cardArray[first]);
        this.cardArray.push(this.cardArray[second]);
        this.cardArray.push(this.cardArray[third]);
        this.cardArray.push(this.cardArray[fourth]);
        this.cardArray.push(this.cardArray[fifth]);
        if(this.cardArray.length<=5){
            for(var i in socketList){
                socketList[i].emit('addToChat', username +" got a fly card, however there are less than or equal to 5 cards");
            }
        }
        else{
            for(var i = 0;i<5;i++){
                this.cardArray.shift();
            }
            for(var i in socketList){
                socketList[i].emit('addToChat', username +" got a fly card, executing fly");
            }
        }
    }

    call(firstType,firstColour,secondType,secondColour, username){
        var firstCard = this.getCard(firstType,firstColour);
        var secondCard = this.getCard(secondType,secondColour);
        for(var i=0;i<this.usedArray.length;i++){
            if(this.usedArray[i] == firstCard){
                var firstCardFound = true;  
            }
            if(this.usedArray[i] == secondCard){
                var secondCardFound = true;
            }
        }
        if(firstCardFound && secondCardFound){
            this.cardArray.push(firstCard);
            this.cardArray.push(secondCard);
            var deleteOne = false;
            var deleteTwo = false;
            for(var i=0;i<this.usedArray.length;i++){   
                if(this.usedArray[i] === firstCard && !deleteOne){
                    delete this.usedArray[i];
                    deleteOne = true;
                    
                }
                if(this.usedArray[i] === secondCard && !deleteTwo){
                    delete this.usedArray[i];
                    deleteTwo = true;
                }
            }
            for(var i in socketList){
                socketList[i].emit('addToChat', username + " Call Successful");
            }
        }
        else{
            for(var i in socketList){
                socketList[i].emit('addToChat', username + " Call Failed");
            }
        }
    }

    getUsedLength(){
        var count = 0;
        for(var i =0; i < this.usedArray.length;i++){
            if(this.usedArray[i]!== undefined){
                count+= 1;
            }
            console.log("get used length executed");
        }
        return count;
    }
}

initStack = new cardStack();
