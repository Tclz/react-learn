import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

  function Square(props) {
      //显示棋子时 若是获胜棋子中的一颗 则高亮
      return (
        <button className="square" 
        onClick={props.onClick}
        >
          {(props.id === props.winChessPieces.a ||
          props.id === props.winChessPieces.b || 
          props.id === props.winChessPieces.c) ? 
          <mark>{props.value}</mark> : props.value}
        </button>
      );
  }
  
  class Board extends React.Component {
    renderSquare(i) {
      return (<Square id={i}
          value={this.props.squares[i]}
          onClick={() => this.props.onClick(i)}
          winChessPieces = {this.props.winChessPieces}
      />);
    }
    render() {
        return (
          //feat3: 两层for循环打印出棋盘而不是在代码里写死
        <div>
          <div className="board-row">
            {this.renderSquare(0)}
            {this.renderSquare(1)}
            {this.renderSquare(2)}
          </div>
          <div className="board-row">
            {this.renderSquare(3)}
            {this.renderSquare(4)}
            {this.renderSquare(5)}
          </div>
          <div className="board-row">
            {this.renderSquare(6)}
            {this.renderSquare(7)}
            {this.renderSquare(8)}
          </div>
        </div>
      );
    }
}
  
  class Game extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
            }],
            //落子坐标
            locations : [{x: null, y: null}],
            stepNumber : 0,
            xIsNext : true,
            //获胜的三个棋子的位置
            winChessPieces:{a:null,b:null,c:null},
        }
    }
    //点击了i位置
    handleClick(i){
        //根据当前跳转到的step选择要保留的history
        const history = this.state.history.slice(0,
            this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        const locations = this.state.locations.slice(0,this.state.stepNumber + 1);
        //如果已有玩家胜出 说明游戏结束 直接返回
        if(calculateWinner(squares)) return;
        //i位置落过子 直接返回
        if(squares[i]) return;
       
        squares[i] = this.state.xIsNext ? "X" : "O";

        //落子完毕后再次计算是否有获胜玩家产生
        //feat4: 如果有 则将获胜的几颗棋子高亮
        let win = calculateWinner(squares);
        const winChessPieces = {a:null, b:null, c:null};
        if(win){
            //记录下获胜的几颗棋子的位置
            winChessPieces.a = win[1];
            winChessPieces.b = win[2];
            winChessPieces.c = win[3];
        }

        //计算本次落子位置位置所在行、所在列
        const x = Math.floor(i/3);
        const y = i%3;
        //console.log("x=",x,"y=",y)
        this.setState({
        //落子后 要将当前棋盘状态记录到history数组中
        history : history.concat([{squares:squares}]),
        //更新当前步数
        stepNumber : history.length,
        xIsNext : !this.state.xIsNext,
        //追加落子坐标
        locations : locations.concat([{x : x ,y : y}]),
        //更新获胜的三个棋子
        winChessPieces: winChessPieces,
        });
        
    }
    //悔棋 回退到第i步
    jumpTo(i){
        //更新回退到第i步时 获胜棋子的状态
        const winChessPieces = {a:null, b:null, c:null};
        const win = calculateWinner(this.state.history[i].squares);
        console.log("jumpTo# win",win)
        console.log(this.state.history[i])
        if(win){
            console.log(win)
            winChessPieces.a = win[1];
            winChessPieces.b = win[2];
            winChessPieces.c = win[3];
        }
        this.setState({
            stepNumber : i,
            xIsNext : (i%2) === 0,
            //更新获胜棋子状态
            winChessPieces : winChessPieces,
        })
    }
    render() {
      const history = this.state.history;
      const current = history[this.state.stepNumber];
      const winner = calculateWinner(current.squares);
      const locations = this.state.locations;
      const winChessPieces = this.state.winChessPieces;
      //feat1: 游戏历史记录显示当时的落子坐标
      const moves = history.map((step,idx) => {
          //console.log("location:",locations[idx])
          const desc = idx ? "Go to move #" + idx 
          + " location: (x=" + locations[idx].x + ", y=" + locations[idx].y + ")"
          : "Go to game start";
          //feat2: 返回的列表项中 加粗显示当前选中的历史记录
          return(<li key={idx}>
              <button onClick={() => this.jumpTo(idx)}>
              {idx !== this.state.stepNumber ? desc : <b>{desc}</b>}</button>
          </li>)
      })
      let status;
      console.log("if winner exist: ",winner!==null)
      console.log(winChessPieces)
      //console.log(current.squares)
      //是否已有玩家胜出
      if(winner){
        status = "winner: " + winner[0];
      }else{
          //feat3: 判断是否平局 九个格子下满
          if(this.state.stepNumber === 9){
              status = "deuce!"
          }
          else{
            status = 'Next player:' + 
            (this.state.xIsNext ? "X" : "O");
          }
      }

      return (
        <div className="game">
          <div className="game-board">
            <Board 
                squares={current.squares}
                onClick={(i)=>this.handleClick(i)}
                //获胜棋子的情况
                winChessPieces={winChessPieces}
            />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <ol>{moves}</ol>
          </div>
        </div>
      );
    }
  }
  //计算获胜玩家
  function calculateWinner(squares) {
    const lines = [
    //居然把获胜的情形枚举了
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
          //返回获胜玩家 及 三个棋子的位置
        return [squares[a], a, b, c];
      }
    }
    return null;
  }
  
  // ========================================
  
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<Game />);
  