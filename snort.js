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

        this.init_board();
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
            cells[i].addEventListener('click', this.make_move.bind(this, cells[i], i));
        }

        this.set_iterator();
    }

    next_turn() {
        this.turn = (this.turn + 1) % 2;
    }

    paint_cell(cell) {
        cell.style.backgroundColor = this.colors[this.turn];
        cell.classList.add('disabled');
        cell.removeEventListener('click', this.paint_cell);
    }

    static get_coords(pos) {
        let row_pos, cell_pos;

        switch (pos) {
            case pos < 2:
                row_pos = 0;
                cell_pos = row_pos;
                break;
            case pos < 6:
                cell_pos = pos - 2;
                row_pos = 1;
                break;
            case pos < 10:
                row_pos = 2;
                cell_pos = pos - 6;
                break;
            default:
                row_pos = 3;
                cell_pos = pos - 10;
                break;
        }

        return {row: row_pos, cell: cell_pos};
    }

    make_move(cell, pos) {
        this.paint_cell(cell);

        let board_pos = Snort.get_coords(pos);
        this.board[board_pos.row][board_pos.cell] = this.turn;

        this.next_turn();

        this.estimate_func(this.board);

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
                let board2 = board.clone();
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

    get_possible(moves_board, player) {
        let player2 = player === 0 ? 1 : 0;
        let board = moves_board.clone();
        let possible = [];

        /* iterate through moves board, if cell is occupied by
            player2, mark aboarding cells as N  */
        for (let i = 0; i < Cells_num; i++) {

            if (board[this.curr.row][this.curr.cell] === player2) {

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
                possible.push(this.curr.clone());
            }
        }

        return possible;
    }

    estimate_func(moves_board) {
        let board = moves_board.clone();
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

    alpha_beta() {
        // iterate through all possible moves
        // for every move find MIN possible responses
        // estimate every MAX to MIN response
        // choose min of Max response = MIN move
        //
        let est = -Infinity;
        let possible = this.get_possible(this.board, 0);

        for(let move of possible){

            this.estimate(this.turn, this.board);
        }
    }
}

const Players = {'MIN': 0, 'MAX': 1};
const Cells_num = 12;