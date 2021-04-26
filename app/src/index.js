import Web3 from "web3";
import tictactoeArtifact from "../../build/contracts/TicTacToe.json";

import './css/index.css'

var Contract = require("@truffle/contract");

var TicTacToe = Contract(tictactoeArtifact);

var ticTacToeInstance;

var account;

var arrEventFired;

const App = {
  web3: null,

  start: async function() {
    //this.web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    TicTacToe.setProvider(this.web3.currentProvider);
    try {
    // get accounts
      const accounts = await this.web3.eth.getAccounts();
      account = accounts[0];
      arrEventFired = [];
      console.log("account0:"+account);
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },
  createNewGame: async function(){
    TicTacToe.new({from:account,value: this.web3.utils.toWei("0.1","ether")})
    .then(function(instance){
      ticTacToeInstance = instance;
      $(".in-game").show();
      $(".waiting-for-join").hide();
      $(".game-start").hide();
      $("#waiting").show();
      $("#game-address").text(instance.address);
      ticTacToeInstance.PlayerJoined(function(error,eventObj){
        $(".waiting-for-join").show();
        $("#opponent-address").text(eventObj.args.player);
        if(!error){
          console.log(eventObj);

        }else{
          console.log(error);
        }
      });
      App.listenToEvents.call();
      console.log(instance);
    }).catch(error => {
      console.error(error);
    });
  },
  joinGame: async function(){
    var gameAddress = prompt("Address of the Game");
    if(gameAddress != null){
      TicTacToe.at(gameAddress).then( instance =>{
          ticTacToeInstance = instance;
          App.listenToEvents.call();
          return ticTacToeInstance.joinGame({from:account,value: this.web3.utils.toWei("0.1","ether")});
      }).then(txResult => {
        $(".in-game").show();
        $(".game-start").hide();
        $("#your-turn").hide();
        $("#game-address").text(ticTacToeInstance.address);
        ticTacToeInstance.player1.call().then(player1Address => {
          $("#opponent-address").text(player1Address);
        });
        console.log(txResult);
      }).catch(error => {
        console.error(error);
      });
    }
  },
  listenToEvents: async function(){
    ticTacToeInstance.NextPlayer(App.nextPlayer);
    ticTacToeInstance.GameOverWithWin(App.gameOverWithWin);
    ticTacToeInstance.GameOverWithDraw(App.gameOverWithDraw);
  },
  nextPlayer: async function(error,eventObj){
    if(arrEventFired.indexOf(eventObj.blockNumber) === -1){
      arrEventFired.push(eventObj.blockNumber);      
      App.printBoard.call();
      if(eventObj.args.player == account){
        for(var i = 0;i < 3;i++){
          for(var j=0; j < 3;j++){
            if($("#board")[0].children[0].children[i].children[j].innerHTML == ""){
              $($("#board")[0].children[0].children[i].children[j]).off('click').click({x: i,y: j},App.setStone);
            }
          }
        }
        $("#your-turn").show();
        $("#waiting").hide();
      }else{
        $("#your-turn").hide();
        $("#waiting").show();
      }
    }
  },
  gameOverWithWin: async function(error,eventObj){
    console.log(eventObj);
    if(eventObj.args.winner == account){
      alert('You win the game!');
    }else{
      alert('You lose the game!');
    }
    $(".in-game").hide();
    $(".game-start").show();
    App.cleanBoard.call();
  },
  gameOverWithDraw: async function(error,eventObj){
    console.log(eventObj);
    alert('Game over with draw!');
    $(".in-game").hide();
    $(".game-start").show();
    App.cleanBoard.call();
  },
  payoutSuccess: async function(error,eventObj){
    console.log(eventObj);
    alert('Pay out success!');
    App.cleanBoard.call();
  },
  setStone: async function(event){
    //console.log(event);
    App.cleanBoard.call();
    ticTacToeInstance.setStone(event.data.x,event.data.y,{from:account})
    .then(txResult => {
      console.log(txResult);
      App.printBoard.call();
    }).catch(error => {
      console.error(error);
    });
  },
  printBoard: async function(){
    ticTacToeInstance.getBoard.call().then(board =>{
      for(var i=0;i<board.length;i++){
        for(var j=0;j<board[i].length;j++){
          if(board[i][j] == account){
            $('#board')[0].children[0].children[i].children[j].innerHTML = 'X';
          }else if(board[i][j] != 0){
            $('#board')[0].children[0].children[i].children[j].innerHTML = 'O';
          }
        }
      }
    })
  },
  cleanBoard: async function(){
    for(var i = 0;i < 3;i++){
      for(var j=0; j < 3;j++){
        $($("#board")[0].children[0].children[i].children[j]).prop('onclick',null).off('click');
      }
    }
  },
};

window.App = App;

window.addEventListener("load", function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:7545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:7545"),
    );
  }

  App.start();
});
