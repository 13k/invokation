---@meta

---# Module [`pl.array2d`](https://lunarmodules.github.io/Penlight/libraries/pl.array2d.html)
---
---Operations on two-dimensional arrays.
---
---See [The Guide](https://lunarmodules.github.io/Penlight/manual/02-arrays.md.html#Operations_on_two_dimensional_tables)
---
---The size of the arrays is determined by using the length operator # hence the
---module is not nil safe, and the usual precautions apply.
---
---Note: all functions taking i1,j1,i2,j2 as arguments will normalize the arguments using `array2d.default_range`.
---
---Dependencies:
--- [`pl.utils`](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html#),
--- [`pl.tablex`](https://lunarmodules.github.io/Penlight/libraries/pl.tablex.html#),
--- [`pl.types`](https://lunarmodules.github.io/Penlight/libraries/pl.types.html#)
local array2d = {}

---return the row and column size. Size is calculated using the Lua length
---operator #, so usual precautions regarding nil values apply.
---@param a any[][] -- a 2d array
---@return integer -- number of rows (`#a`)
---@return integer -- number of cols (`#a[1]`)
---@nodiscard
function array2d.size(a) end

---extract a column from the 2D array.
---@generic T
---@param a T[][] -- 2d array
---@param j integer -- column index
---@return T[] -- 1d array
---@nodiscard
function array2d.column(a, j) end

---extract a row from the 2D array. Added in line with column, for read-only
---purposes directly accessing `a[i]` is more performant.
---@generic T
---@param a T[][] -- 2d array
---@param i integer -- row index
---@return T[] -- 1d array (copy of the row)
---@nodiscard
function array2d.row(a, i) end

---@generic T, A, R
---@param f fun(value: T, arg: A): R
---@param a T[][]
---@param arg A
---@return R[][]
---@nodiscard
function array2d.map(f, a, arg) end

---map a function over a 2D array
---@param f pl.OpString -- a function of at least one argument
---@param a any[][] -- 2d array
---@param arg any -- an optional extra argument to be passed to the function.
---@return any[][] -- 2d array
---@nodiscard
function array2d.map(f, a, arg) end

---reduce the rows using a function.
---@generic T
---@param f fun(value: T, memo: T): T -- a binary function
---@param a T[][] -- 2d array
---@return T[] -- 1d array
---@nodiscard
function array2d.reduce_rows(f, a) end

---reduce the columns using a function.
---@generic T
---@param f fun(value: T, memo: T): T -- a binary function
---@param a T[][] -- 2d array
---@return T[] -- 1d array
---@nodiscard
function array2d.reduce_cols(f, a) end

---reduce a 2D array into a scalar, using two operations.
---@generic T
---@param opc fun(value: T, memo: T): T -- operation to reduce the final result
---@param opr fun(value: T, memo: T): T -- operation to reduce the rows
---@param a T[][] -- 2D array
---@return T
---@nodiscard
function array2d.reduce2(opc, opr, a) end

---@generic T, U, R
---@param f fun(aval: T, bval: U): R
---@param ad 1 | 2
---@param bd 1 | 2
---@param a T[]|T[][]
---@param b U[]|U[][]
---@param arg any
---@return R[]|R[][]
---@nodiscard
function array2d.map2(f, ad, bd, a, b, arg) end

---map a function over two arrays. They can be both or either 2D arrays
---@param f pl.UnOpString|pl.BinOpString -- function of at least two arguments
---@param ad 1 | 2 -- order of first array (`1` if `a` is a list/array, `2` if it is a 2d array)
---@param bd 1 | 2 -- order of second array (`1` if `b` is a list/array, `2` if it is a 2d array)
---@param a any[]|any[][] -- 1d or 2d array
---@param b any[]|any[][] -- 1d or 2d array
---@param arg any -- optional extra argument to pass to function
---@return any[]|any[][] -- 2D array, unless both arrays are 1D
---@nodiscard
function array2d.map2(f, ad, bd, a, b, arg) end

---@generic T, U, R
---@param f fun(val1: T, val2: U): R
---@param t1 T[]
---@param t2 U[]
---@return R[][]
function array2d.product(f, t1, t2) end

---cartesian product of two 1d arrays.
---@param f pl.BinOpString -- a function of 2 arguments
---@param t1 any[] -- a 1d table
---@param t2 any[] -- a 1d table
---@return any[][] -- 2d table
---@nodiscard
---
---Usage:
---
---```lua
---product('..',{1,2},{'a','b'}) == {{'1a','2a'},{'1b','2b'}}
---```
function array2d.product(f, t1, t2) end

---flatten a 2D array. (this goes over columns first.)
---@generic T
---@param t T[][] -- 2d table
---@return T[] -- a 1d table
---@nodiscard
---
---Usage:
---
---```lua
---flatten {{1,2},{3,4},{5,6}} == {1,2,3,4,5,6}
---```
function array2d.flatten(t) end

---reshape a 2D array. Reshape the array by specifying a new number of rows.
---@generic T
---@param t T[][] -- 2d array
---@param nrows integer -- new number of rows
---@param co? boolean -- use column-order (Fortran-style) (default false)
---@return T[][] -- a new 2d array
---@nodiscard
function array2d.reshape(t, nrows, co) end

---transpose a 2D array.
---@generic T
---@param t T[][] -- 2d array
---@return T[][] -- a new 2d array
---@nodiscard
function array2d.transpose(t) end

---swap two rows of an array.
---@generic T
---@param t T[][] -- a 2d array
---@param i1 integer -- a row index
---@param i2 integer -- a row index
---@return T[][] t -- (same, modified 2d array)
function array2d.swap_rows(t, i1, i2) end

---swap two columns of an array.
---@generic T
---@param t T[][] -- a 2d array
---@param j1 integer -- a column index
---@param j2 integer -- a column index
---@return T[][] t -- (same, modified 2d array)
function array2d.swap_cols(t, j1, j2) end

---extract the specified rows.
---@generic T
---@param t T[][] -- 2d array
---@param ridx integer[] -- a table of row indices
---@return T[][] -- a new 2d array with the extracted rows
---@nodiscard
function array2d.extract_rows(t, ridx) end

---extract the specified columns.
---@generic T
---@param t T[][] -- 2d array
---@param cidx integer[] -- a table of column indices
---@return T[][] -- a new 2d array with the extracted columns
---@nodiscard
function array2d.extract_cols(t, cidx) end

---remove a row from an array.
---@generic T
---@param t T[][] -- a 2d array
---@param i integer -- a row index
function array2d.remove_row(t, i) end

---remove a column from an array.
---@generic T
---@param t T[][] -- a 2d array
---@param j integer -- a column index
function array2d.remove_col(t, j) end

---parse a spreadsheet range or cell. The range/cell can be specified either
---as 'A1:B2' or 'R1C1:R2C2' or for single cells as 'A1' or 'R1C1'.
---@param s string -- a range (case insensitive).
---@return integer -- start row
---@return integer -- start col
---@return integer -- end row (or nil if the range was a single cell)
---@return integer -- end col (or nil if the range was a single cell)
---@nodiscard
function array2d.parse_range(s) end

---get a slice of a 2D array. Same as `array2d.slice`.
---@generic T
---@param t T[][] -- a 2D array
---@param i1? integer|string -- start row or spreadsheet range passed to parse_range (default 1)
---@param j1? integer -- start col (default 1)
---@param i2? integer -- end row (default N)
---@param j2? integer -- end col (default M)
---@return T[]|T[][] -- an array, 2D in general but 1D in special cases.
---@nodiscard
function array2d.range(t, i1, j1, i2, j2) end

---normalizes coordinates to valid positive entries and defaults. Negative indices
---will be counted from the end, too low, or too high will be limited by the array sizes.
---@param t any[][] -- a 2D array
---@param i1? integer|string -- start row or spreadsheet range passed to `array2d.parse_range` (default 1)
---@param j1? integer -- start col (default 1)
---@param i2? integer -- end row (default N)
---@param j2? integer -- end col (default M)
---@return integer i1, integer j1, integer i2, integer j2
---@nodiscard
function array2d.default_range(t, i1, j1, i2, j2) end

---get a slice of a 2D array. Note that if the specified range has a 1D result,
---the rank of the result will be 1.
---@generic T
---@param t T[][] -- a 2D array
---@param i1? integer|string -- start row or spreadsheet range passed to parse_range (default 1)
---@param j1? integer -- start col (default 1)
---@param i2? integer -- end row (default N)
---@param j2? integer -- end col (default M)
---@return T[]|T[][] -- an array, 2D in general but 1D in special cases.
---@nodiscard
function array2d.slice(t, i1, j1, i2, j2) end

---set a specified range of an array to a value.
---@generic T
---@param t T[][] -- a 2D array
---@param value T|(fun(i: integer, j: integer): T) -- the value (may be a function, called as `val(i, j)`)
---@param i1? integer|string -- start row or spreadsheet range passed to parse_range (default 1)
---@param j1? integer -- start col (default 1)
---@param i2? integer -- end row (default N)
---@param j2? integer -- end col (default M)
function array2d.set(t, value, i1, j1, i2, j2) end

---write a 2D array to a file.
---@param t any[][] 2D array
---@param f? file* -- a file object (default `stdout`)
---@param fmt string -- a format string (default is just to use tostring)
---@param i1? integer|string -- start row or spreadsheet range passed to parse_range (default 1)
---@param j1? integer -- start col (default 1)
---@param i2? integer -- end row (default N)
---@param j2? integer -- end col (default M)
function array2d.write(t, f, fmt, i1, j1, i2, j2) end

---perform an operation for all values in a 2D array.
---@generic T
---@param t T[][] -- 2D array
---@param row_op fun(row: T[], j: integer) -- function to call on each value; `row_op(row, j)`
---@param end_row_op? fun(i: integer) -- function to call at end of each row; `end_row_op(i)`
---@param i1? integer|string -- start row or spreadsheet range passed to parse_range (default 1)
---@param j1? integer -- start col (default 1)
---@param i2? integer -- end row (default N)
---@param j2? integer -- end col (default M)
function array2d.forall(t, row_op, end_row_op, i1, j1, i2, j2) end

---move a block from the destination to the source.
---@generic T
---@param dest T[][] -- a 2D array
---@param di integer -- start row in dest
---@param dj integer -- start col in dest
---@param src T[][] -- a 2D array
---@param i1? integer|string -- start row or spreadsheet range passed to parse_range (default 1)
---@param j1? integer -- start col (default 1)
---@param i2? integer -- end row (default N)
---@param j2? integer -- end col (default M)
function array2d.move(dest, di, dj, src, i1, j1, i2, j2) end

---iterate over all elements in a 2D array, with optional indices.
---@generic T
---@param a T[][] -- a 2D array
---@param indices? boolean -- with indices (default false)
---@param i1? integer|string -- start row or spreadsheet range passed to parse_range (default 1)
---@param j1? integer -- start col (default 1)
---@param i2? integer -- end row (default N)
---@param j2? integer -- end col (default M)
---@return (fun(): integer, integer, T)|(fun(): T) -- returns either value or i,j,value depending on the value of indices
---@nodiscard
function array2d.iter(a, indices, i1, j1, i2, j2) end

---iterate over all columns.
---@generic T
---@param a T[][] -- a 2D array
---@return (fun(): T[], T) -- returns column, column-index
---@nodiscard
function array2d.columns(a) end

---iterate over all rows. Returns a copy of the row, for read-only purposes
---directly iterating is more performant; `ipairs(a)`
---@generic T
---@param a T[][] -- a 2D array
---@return (fun(): T[], T) -- returns row, row-index
---@nodiscard
function array2d.rows(a) end

---new array of specified dimensions
---@generic T
---@param rows integer -- number of rows
---@param cols integer -- number of cols
---@param val (fun(i: integer, j: integer): T)|T -- initial value; if it's a function then use `val(i,j)`
---@return T[][] -- new 2d array
---@nodiscard
function array2d.new(rows, cols, val) end

return array2d
