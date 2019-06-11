class Snort {

    constructor(board_selector, colors, depth) {
        this.colors = colors;
        this.board = [
            ['x', 'x'],
            ['x', 'x', 'x', 'x'],
            ['x', 'x', 'x', 'x'],
            ['x', 'x'],
        ];

        this.container = document.querySelector(board_selector);
        this.message = document.querySelector('p.message');

        this.max_depth = depth;
        this.next_move = {row: 1, cell: 1};

        this.turn = Players.MAX;
        this.init_board();
        this.make_move();

        this.container.querySelector('.btn').addEventListener('click', this.play_again.bind(this));
    }

    play_again() {
        this.container.querySelector('.btn').classList.add('hidden');
        this.board = Snort_board;
        this.clear_html_board();

        this.message.innerHTML = '';
    }

    clear_html_board() {
        let cells = this.container.querySelectorAll('span');

        for (let i = 0; i < cells.length; i++) {
            cells[i].style.backgroundColor = null;
            cells[i].style.classList = null;
        }

        this.turn = Players.MAX;

        this.make_move();

    }

    init_board() {
        let cells = this.container.querySelectorAll('span');

        for (let i = 0; i < cells.length; i++) {
            cells[i].addEventListener('click', this.player2_move.bind(this, cells[i], i));
        }
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
            cell_pos = pos;
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

        this.next_turn();
        this.make_move();
    }

    make_move() {

        if (Snort.is_game_over(this.board, Players.MAX)) {
            this.end_game();
            return;
        }

        let est = this.minimax(this.board, this.max_depth, -Infinity, +Infinity, Players.MAX);
        this.board[this.next_move.row][this.next_move.cell] = Players.MAX;

        let cell = this.container.querySelector(' .snort-row:nth-child(' + (this.next_move.row + 1) +
            ') span:nth-child(' + (this.next_move.cell + 1) + ')');
        this.paint_cell(cell);
        this.next_turn();

        if (Snort.is_game_over(this.board, Players.MIN)) {
            this.end_game();
        }
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

    static get_possible(moves_board, player) {
        let player2 = player === 0 ? 1 : 0;
        let board = moves_board.clone();
        let possible = [];

        let curr = new Iterator();

        /* iterate through moves board, if cell is occupied by
            player2, mark aboarding cells as N  */
        for (let i = 0; i < Cells_num; i++) {

            if (board[curr.row][curr.cell] === player2) {

                switch (curr.row) {
                    case 0:
                        Snort.mark(board, 1, curr.cell + 1); // mark bottom
                        Snort.mark(board, 0, (curr.cell === 0 ? 1 : 0));
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
                        Snort.mark(board, curr.row, (curr.cell === 0 ? 1 : 0));
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

    static estimate_func(moves_board) {
        let player1 = Snort.get_possible(moves_board, Players.MAX).length;
        let player2 = Snort.get_possible(moves_board, Players.MIN).length;

        if (player2 === 0) {
            return 1;
        }

        return player1 / (player1 + player2);
    }

    static mark(board, row, cell) {
        if (board[row][cell] === 'x') {
            board[row][cell] = 'N';
        }
    }

    static is_game_over(board, player) {
        return Snort.get_possible(board, player).length === 0;
    }

    end_game() {
        let state = this.turn === Players.MAX ?
            "<span class='emoji'>ﾍ(=￣∇￣)ﾉ</span>       <span>you won</span>       <span class='emoji'>」(￣▽￣」)</span>"
            : "<span class='emoji'>‧º·(˚ ˃̣̣̥⌓˂̣̣̥ )‧º·˚</span>      you lose...     <span class='emoji'>(⌯˃̶᷄ ﹏ ˂̶᷄⌯)ﾟ</span>";
        this.message.innerHTML = state;

        let cell;
        if (this.turn === Players.MAX) {
            cell = this.container.querySelectorAll('tbody td')[0];
        } else {
            cell = this.container.querySelectorAll('tbody td')[1];
        }

        cell.innerText = Number(cell.innerText) + 1;

        this.container.querySelector('.btn').classList.remove('hidden');
    }


    minimax(board, depth, a, b, player) {

        if (depth === 0) {
            return Snort.estimate_func(board);
        }

        let possible = Snort.get_possible(board, player);

        if (possible.length === 0) { // game is over
            return player === 1 ? 0 : 1;
        }

        if (player === Players.MAX) {
            let maxEst = -Infinity;

            for (let move of possible) {
                let move_board = board.clone();
                move_board[move.row][move.cell] = Players.MAX;

                let est = this.minimax(move_board, depth - 1, a, b, Players.MIN);

                if (est > maxEst) {
                    maxEst = est;

                    if (depth === this.max_depth) {
                        this.next_move = move;
                    }
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
                let move_board = board.clone();
                move_board[move.row][move.cell] = Players.MIN;

                let est = this.minimax(move_board, depth - 1, a, b, Players.MAX);

                if (est < minEst) {
                    minEst = est;
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