var TicTacToe = artifacts.require("TicTacToe");

contract("TicTacToe",function(accounts){
  //console.log(accounts);
  it("should be possible to win",function(){
    var ticTacToeInstance;
    var playerOne = accounts[0];
    var playerTwo = accounts[1];
    return TicTacToe.new({from:playerOne,value: web3.utils.toWei("0.1","ether")})
    .then(function(instance){
      ticTacToeInstance = instance;
      return ticTacToeInstance.joinGame({from:playerTwo,value: web3.utils.toWei("0.1","ether")});
    }).then(txResult => {
      return ticTacToeInstance.setStone(0,0,{from:txResult.logs[1].args.player});
    }).then(txResult => {
      return ticTacToeInstance.setStone(0,1,{from:txResult.logs[0].args.player});
    }).then(txResult => {
      return ticTacToeInstance.setStone(1,0,{from:txResult.logs[0].args.player});
    }).then(txResult => {
      return ticTacToeInstance.setStone(1,1,{from:txResult.logs[0].args.player});
    }).then(txResult => {
      return ticTacToeInstance.setStone(2,0,{from:txResult.logs[0].args.player});
    }).then(txResult => {
      assert(txResult.logs[0].event,"GameOverWithWin","One of the players must have won the game");
    }).catch(err => {
      console.log(err);
    })
  })
});
