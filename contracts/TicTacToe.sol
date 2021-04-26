// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

contract TicTacToe {
    uint constant public gameCost = 0.1 ether;

    uint8 public boardSize = 3;
    uint8 movesCounter;

    bool gameActive;

    address[3][3] board;

    address payable public  player1;
    address payable public player2;

    uint balanceToWithdrawPlayer1;
    uint balanceToWithdrawPlayer2;

    uint timeToReact = 3 minutes;
    uint gameValidUntil;

    address payable activePlayer;

    event PlayerJoined(address player);
    event NextPlayer(address player);
    event GameOverWithWin(address winner);
    event GameOverWithDraw();
    event PayoutSuccess(address receiver,uint amountInWei);

    constructor() public payable{
        player1 = msg.sender;
        require(msg.value == gameCost);
        gameValidUntil = block.timestamp + timeToReact;
    }

    function joinGame() public payable{
        assert(player2 == address(0));
        gameActive = true;

        require(msg.value == gameCost);

        player2 = msg.sender;

        emit PlayerJoined(player2);
        
        activePlayer = player1;

        gameValidUntil = block.timestamp + timeToReact;

        emit NextPlayer(activePlayer);

    }

    function getBoard() public view returns(address[3][3] memory){
        return board;
    }

    function setWinner(address payable player) private{
        gameActive = false;
        //emit an event
        emit GameOverWithWin(player);
        uint balanceToPayOut = address(this).balance;
        //transfer money to the winner
        if(player.send(balanceToPayOut) != true){
            if(player == player1){
                balanceToWithdrawPlayer1 =  balanceToPayOut;
            }else{
                balanceToWithdrawPlayer2 =  balanceToPayOut;
            }
        }else{
            emit PayoutSuccess(player,balanceToPayOut);
        }
    }

    function withDrawWin() public {
        if(msg.sender == player1){
            require(balanceToWithdrawPlayer1 > 0);
            balanceToWithdrawPlayer1 = 0;
            player1.transfer(balanceToWithdrawPlayer1);
            emit PayoutSuccess(player1,balanceToWithdrawPlayer1);
        }else{
            require(balanceToWithdrawPlayer2 > 0);
            balanceToWithdrawPlayer2 = 0;
            player2.transfer(balanceToWithdrawPlayer2);
            emit PayoutSuccess(player2,balanceToWithdrawPlayer2);
        }
    }

    function emergecyCashout() public{
        require(gameValidUntil < block.timestamp);
        require(gameActive);
        setDraw();
    }

    function setDraw() private {
        gameActive = false;
        emit GameOverWithDraw();

        uint balanceToPayOut = address(this).balance/2;

        if(player1.send(balanceToPayOut) == false){
            balanceToWithdrawPlayer1 = balanceToPayOut;
        }else{
            emit PayoutSuccess(player1,balanceToWithdrawPlayer1);
        }
        if(player2.send(balanceToPayOut) == false){
            balanceToWithdrawPlayer2 = balanceToPayOut;
        }else{
            emit PayoutSuccess(player2,balanceToWithdrawPlayer2);
        }

    }

    function setStone(uint8 x,uint8 y) payable public {
        require(board[x][y] == address(0));
        require(gameValidUntil > block.timestamp);
        assert(gameActive);
        assert(x < boardSize);
        assert(y < boardSize);
        require(msg.sender == activePlayer);
        board[x][y] = msg.sender;
        movesCounter++;

        gameValidUntil = block.timestamp + timeToReact;

        for(uint8 i = 0; i < boardSize; i++){
            if(board[i][y] != activePlayer){
                break;
            }
            //win
            if(i == boardSize - 1){
                setWinner(activePlayer);
                return;
            }
        }
        for(uint8 i = 0; i < boardSize; i++){
            if(board[x][i] != activePlayer){
                break;
            }
            //win
            if(i == boardSize - 1){
                setWinner(activePlayer);
                return;
            }
        }
        //diagonale
        if(x == y){
            for(uint8 i = 0; i < boardSize; i++){
                if(board[i][i] != activePlayer){
                    break;
                }
                //win
                if(i == boardSize - 1){
                    setWinner(activePlayer);
                    return;
                }
            }
        }

        //anti diagonale
        if((x+y) == boardSize -1){
            for(uint8 i = 0; i < boardSize; i++){
                if(board[i][(boardSize-1)-i] != activePlayer){
                    break;
                }
                //win
                if(i == boardSize - 1){
                    setWinner(activePlayer);
                    return;
                }
            }
        }

        //draw
        if(movesCounter == boardSize**2){
            //draw
            setDraw();
        }

        if(activePlayer == player1){
            activePlayer = player2;
        }else{
            activePlayer = player1;
        }

        emit NextPlayer(activePlayer);
    }
}
