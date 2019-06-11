class Snort {

    constructor(board_selector, colors, depth) {
        this.board_selector = board_selector;
        this.turn = Players['MAX'];
        this.colors = colors;
        this.board = [
            ['x', 'x'],
            ['x', 'x', 'x', 'x'],
            ['x', 'x', 'x', 'x'],
            ['x', 'x'],
        ];

        this.max_depth = depth;
        this.next_move = {row: 1, cell: 1};

        this.init_board();
        this.make_move();
    }

    set_iterator() {
        this.curr = {
            row: 0,
            cell: 0
        };

        this.next_cell = () => {
            this.curr.cell = ++this.curr.cell % this.board[this.curr.row].length;
            if (this.curr.cell === 0) {
                this.curr.row = ++this.curr.row % this.board.length;
            }
        };
    }

    init_board() {
        let cells = document.querySelectorAll(this.board_selector + ' span');

        for (let i = 0; i < cells.length; i++) {
            cells[i].addEventListener('click', this.player2_move.bind(this, cells[i], i));
        }

        this.set_iterator();
    }

    next_turn() {
        this.turn = (this.turn + 1) % 2;
    }

    paint_cell(cell) {
        cell.style.backgroundColor = this.colors[this.turn];
        cell.classList.add('disabled');
        cell.removeEventListener('click', this.player2_move);
    }

    static get_coords(pos) {
        let row_pos, cell_pos;

        if (pos < 2) {
            row_pos = 0;
            cell_pos = row_pos;
        } else if (pos < 6) {
            cell_pos = pos - 2;
            row_pos = 1;
        } else if (pos < 10) {
            row_pos = 2;
            cell_pos = pos - 6;
        } else {
            row_pos = 3;
            cell_pos = pos - 10;
        }

        return {row: row_pos, cell: cell_pos};
    }

    player2_move(cell, pos) {
        this.paint_cell(cell);

        let board_pos = Snort.get_coords(pos);
        this.board[board_pos.row][board_pos.cell] = Players.MIN; // mark player2's move

        if (Snort.is_game_over(this.board, Players.MIN)) {
            console.log('Game over! You loose');
            return;
        }

        this.next_turn();
        this.make_move();
    }

    make_move() {
        this.minimax(this.board, this.max_depth, -Infinity, +Infinity, Players.MAX);

        console.log('Next move: ');
        console.log(this.next_move);

        this.board[this.next_move.row][this.next_move.cell] = Players.MAX;

        let cell = document.querySelector(this.board_selector +
            ' .snort-row:nth-child(' + (this.next_move.row+1) +
            ') span:nth-child(' + (this.next_move.cell + 1) + ')');
        this.paint_cell(cell);
        this.next_turn();
    }

    static get_cell_pos(move) {
        switch (move.row) {
            case 0:
                return move.cell;
            case 1:
                return 2 + move.cell;
            case 2:
                return 6 + move.cell;
            case 3:
                return 10 + move.cell;
        }
    }

    /**
     * Function estimates quality of the move to cell_pos for player
     *
     * @param cell_pos
     * @param player
     * @param depth
     */
    estimate(board, pos, player, depth) {

        let player2 = (player === 0) ? 1 : 0;
        let func = (player === 0) ? Math.min : Math.max;

        depth++;

        if (depth < this.max_depth) {
            let possible = this.get_possible(board, player2); // all possible moves
            let val = -Infinity;

            for (let move of  possible) {
                let board2 = board.slice(0);
                board2[move.row][move.cell] = player2;

                if (func(this.estimate(board2), val) === val) {
                    break;
                }
            }

            return val;
        } else {
            return this.estimate_func(board);
        }


    }

    static get_possible(moves_board, player) {
        let player2 = player === 0 ? 1 : 0;
        let board = moves_board.slice(0);
        let possible = [];

        let curr = new Iterator();

        /* iterate through moves board, if cell is occupied by
            player2, mark aboarding cells as N  */
        for (let i = 0; i < Cells_num; i++) {

            if (board[curr.row][curr.cell] === player2) {

                switch (curr.row) {
                    case 0:
                        Snort.mark(board, 1, curr.cell + 1); // mark bottom
                        Snort.mark(board, 0, curr.cell + (curr.cell === 0 ? 1 : -1));
                        break;

                    case 1:
                        if (curr.cell > 0 && curr.cell < 3) { // check all
                            Snort.mark(board, curr.row - 1, curr.cell - 1); // top
                            Snort.mark(board, curr.row + 1, curr.cell); // bottom

                            Snort.mark(board, curr.row, curr.cell + 1); // right
                            Snort.mark(board, curr.row, curr.cell - 1); // left
                        } else {
                            Snort.mark(board, curr.row + 1, curr.cell); // mark bottom

                            let k = curr.cell === 0 ? 1 : -1;
                            Snort.mark(board, curr.row, curr.cell + k);
                            break;
                        }

                        break;

                    case 2:
                        if (curr.cell > 0 && curr.cell < 3) { // check all
                            Snort.mark(board, curr.row - 1, curr.cell); // top
                            Snort.mark(board, curr.row + 1, curr.cell - 1); // bottom

                            Snort.mark(board, curr.row, curr.cell + 1); // right
                            Snort.mark(board, curr.row, curr.cell - 1); // left
                        } else {
                            Snort.mark(board, curr.row - 1, curr.cell); // mark top

                            let k = curr.cell === 0 ? 1 : -1;
                            Snort.mark(board, curr.row, curr.cell + k);
                            break;
                        }

                        break;

                    case 3:
                        Snort.mark(board, curr.row - 1, curr.cell + 1); // mark top

                        let k = curr.cell === 0 ? 1 : -1;
                        Snort.mark(board, 0, curr.cell + k);
                        break;
                }
            }

            curr.next_cell();
        }

        curr.rewind();

        for (let i = 0; i < Cells_num; i++) {
            if (board[curr.row][curr.cell] === 'x') {
                possible.push(curr.get_pos());
            }

            curr.next_cell();
        }

        return possible;
    }

    estimate_func(moves_board) {
        let player1 = Snort.get_possible(moves_board, Players.MAX).length;
        let player2 = Snort.get_possible(moves_board, Players.MIN).length;

        console.log('Estimating ' + player1 + ' ' + player2);
        // console.log(player1 / (player1 + player2));
        return player1 / (player1 + player2);

        let board = moves_board.slice(0);
        let possible = 0,
            all = 0;

        /* iterate through moves board, if cell is occupied by
            player2, mark aboarding cells as N  */

        for (let i = 0; i < Cells_num; i++) {

            if (board[this.curr.row][this.curr.cell] === Players['MIN']) {

                switch (this.curr.row) {
                    case 0:
                        Snort.mark(board, 1, this.curr.cell + 1); // mark bottom
                        Snort.mark(board, 0, this.curr.cell + (this.curr.cell === 0 ? 1 : -1));
                        break;

                    case 1:
                        if (this.curr.cell > 0 && this.curr.cell < 3) { // check all
                            Snort.mark(board, this.curr.row - 1, this.curr.cell - 1); // top
                            Snort.mark(board, this.curr.row + 1, this.curr.cell); // bottom

                            Snort.mark(board, this.curr.row, this.curr.cell + 1); // right
                            Snort.mark(board, this.curr.row, this.curr.cell - 1); // left
                        } else {
                            Snort.mark(board, this.curr.row + 1, this.curr.cell); // mark bottom

                            let k = this.curr.cell === 0 ? 1 : -1;
                            Snort.mark(board, this.curr.row, this.curr.cell + k);
                            break;
                        }

                        break;

                    case 2:
                        if (this.curr.cell > 0 && this.curr.cell < 3) { // check all
                            Snort.mark(board, this.curr.row - 1, this.curr.cell); // top
                            Snort.mark(board, this.curr.row + 1, this.curr.cell - 1); // bottom

                            Snort.mark(board, this.curr.row, this.curr.cell + 1); // right
                            Snort.mark(board, this.curr.row, this.curr.cell - 1); // left
                        } else {
                            Snort.mark(board, this.curr.row - 1, this.curr.cell); // mark top

                            let k = this.curr.cell === 0 ? 1 : -1;
                            Snort.mark(board, this.curr.row, this.curr.cell + k);
                            break;
                        }

                        break;

                    case 3:
                        Snort.mark(board, this.curr.row - 1, this.curr.cell + 1); // mark top

                        let k = this.curr.cell === 0 ? 1 : -1;
                        Snort.mark(board, 0, this.curr.cell + k);
                        break;
                }
            }

            this.next_cell();
        }

        this.curr = {row: 0, cell: 0};

        for (let i = 0; i < Cells_num; i++) {
            if (board[this.curr.row][this.curr.cell] === 'x') {
                possible++;
            }
        }

        return possible;
    }

    static mark(board, row, cell) {
        if (board[row][cell] === 'x') {
            board[row][cell] = 'N';
        }
    }

    static is_game_over(board, player) {
        return Snort.get_possible(board, player).length === 0;
    }

    minimax(board, depth, a, b, player) {
        if (depth === 0) {
            console.log('Reached depth 0');
            return this.estimate_func(board);
        }

        console.log(depth);

        let possible = Snort.get_possible(board, player);
        console.log(board);
        console.log(possible);

        if (possible.length === 0) { // game is over
            console.log('Game over');
            return this.estimate_func(board);
        }

        if (player === Players.MAX) {
            let maxEst = -Infinity;

            for (let move of possible) {
                let move_board = board.clone();
                move_board[move.row][move.cell] = Players.MAX;

                let est = this.minimax(move_board, depth - 1, a, b, Players.MIN);

                if (est > maxEst) {
                    maxEst = est;
                    this.next_move = move;
                }

                a = Math.max(a, est);

                if (b <= a) {
                    break;
                }

            }

            return maxEst;
        } else {
            let minEst = Infinity;

            for (let move of possible) {
                let move_board = board.slice(0);
                move_board[move.row][move.cell] = Players.MIN;
                let est = this.minimax(move_board, depth - 1, a, b, Players.MAX);

                if (est < minEst) {
                    minEst = est;
                    this.next_move = move;
                }

                b = Math.min(b, est);

                if (b <= a) {
                    break;
                }
            }

            return minEst;
        }
    }
}

class Iterator {
    constructor() {
        this.board = Snort_board;
        this.row = 0;
        this.cell = 0;
    }

    next_cell() {
        this.cell = ++this.cell % this.board[this.row].length;
        if (this.cell === 0) {
            this.row = ++this.row % this.board.length;
        }
    }

    rewind() {
        this.row = 0;
        this.cell = 0;
    }

    get_pos() {
        return {row: this.row, cell: this.cell};
    }
}

const Players = {'MIN': 0, 'MAX': 1};
const Cells_num = 12;
const Snort_board = [['x', 'x'],
    ['x', 'x', 'x', 'x'],
    ['x', 'x', 'x', 'x'],
    ['x', 'x']
];

Array.prototype.clone = function () {
    let new_arr = [];

    for (let i = 0, len = this.length; i < len; i++)
        new_arr[i] = this[i].slice();

    return new_arr;
};