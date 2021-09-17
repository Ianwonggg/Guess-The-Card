//Card is (256,180)
/*
to do:
Card history tab
Turn counter
Multiplayer
*/

//preinit
var canvas = document.getElementById("game");
var game = canvas.getContext('2d');
var chatText = document.getElementById("chatText");
var chatInput = document.getElementById("chatInput");
var chatForm = document.getElementById("chatForm");
var shuffButton = document.getElementById("shuffButton");
var guessButton = document.getElementById("guessButton");
var callButton = document.getElementById("callButton");
var flyButton = document.getElementById("flyButton");
const maxUniqueCard = 42;
var guessType = document.getElementById("guessType");
var guessColour = document.getElementById("guessColour");
var firstType = document.getElementById("firstType");
var secondType = document.getElementById("secondType");
var firstColour = document.getElementById("firstColour");
var secondColour = document.getElementById("secondColour");

//Random Functions
function getRandomRange(min,max){
    return Math.round(Math.random()*(max-min)+min);
}

//Manage canvas size
function manageSize(){
    var xOffset = 400;
    var yOffset = 150;
    canvas.setAttribute("width",window.innerWidth-xOffset);
    canvas.setAttribute("height",window.innerHeight-yOffset);
}

//cardstack
class cardStack{
    constructor(maxCards=13,maxType = 2){
        this.cardArray = [];
        this.usedArray = [];
        this.maxCards = maxCards;
        this.maxType = maxType;
        this.generateCardArray();
        this.drawCardStack();
    }
    drawCardStack(){
        if(this.cardArray<25){
            var smallStack = new Image();
            smallStack.src = "Cards/smallcardstack.png";
            smallStack.onload = function(){
                game.drawImage(smallStack,200,200);
            }
        }
        else if(this.cardArray.length<5){
            var tinyStack = new Image();
            tinyStack.src = "Cards/smallestcardstack.png";
            tinyStack.onload = function(){
                game.drawImage(tinyStack,200,200);
            }
        }
        else{
            var stack = new Image();
            stack.src = "Cards/cardstack.png";
            stack.onload = function(){
                game.drawImage(stack,200,200);
            }
        }
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
            var randCard = getRandomRange(0,maxUniqueCard-1);
            while(this.checkCardType(randCard)){
                randCard = getRandomRange(0,maxUniqueCard-1);
            }
            this.cardArray.push(randCard);
        }
    }
    shuff(){
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
    }

    getCard(type, colour){
        var card = undefined;
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

    guess(guessType,guessColour){
        if(this.getCard(guessType,guessColour)==this.cardArray[0]){
            addToChat("Guessed Correctly");
        }
        else{
            addToChat("Guessed Wrongly");
        }
        this.usedArray.push(this.cardArray.shift());
        if(this.cardArray.length<=0){
            this.generateCardArray();
            addToChat("Generating New Deck")
        }
    }

    call(firstType,firstColour,secondType,secondColour){
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
            addToChat("Call Successful")
            return false;
        }
        else{
            addToChat("No Such Card");
            return false;
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
}

//chat stuff
function addToChat(text){
    chatText.innerHTML += '<div>' + text + '</div>';
}

chatForm.onsubmit = function(e){
    e.preventDefault();
    addToChat(this.chatInput.value);
}

//shuff button 
shuffButton.onclick = function(e){
    e.preventDefault;
    initStack.shuff();
    addToChat("Shuff Successful");
    return false;
}

callButton.onclick = function(e){
    e.preventDefault;
    initStack.call(firstType.value,firstColour.value,secondType.value,secondColour.value);
    return false;
}

guessButton.onclick = function(e){
    e.preventDefault;
    initStack.guess(guessType.value,guessColour.value);
    return false;
}

//fly button
flyButton.onclick = function(e){
    e.preventDefault;
    var flyOne = document.getElementById("firstFly").value;
    var flyTwo = document.getElementById("secondFly").value;
    var flyThree= document.getElementById("thirdFly").value;
    var flyFour = document.getElementById("fourthFly").value;
    var flyFive = document.getElementById("fifthFly").value;
    if((flyOne+flyTwo+flyThree+flyFour+flyFive)!== "01234" || initStack.cardArray.length<5){
        addToChat("Fly Unsuccessful");
    }
    else{
        addToChat("Fly Successful");
        initStack.fly(flyOne,flyTwo,flyThree,flyFour,flyFive);
    }
    return false;
}

//setup
window.onload = function(){
    manageSize();
    //game.clearRect(0,0,canvas.getAttribute("width"),canvas.getAttribute("height"))
    initStack = new cardStack();
}



