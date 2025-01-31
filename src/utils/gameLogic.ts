import { Cell, GameItem, WinningLine } from '../types/game';

export function calculateBoardSize(itemCount: number): number {
  return Math.ceil(Math.sqrt(itemCount * 2));
}

export function createBoard(items: GameItem[], rows: number, cols: number): Cell[][] {
  const board: Cell[][] = [];
  // Дублируем каждый элемент
  const shuffledItems = [...items, ...items].sort(() => Math.random() - 0.5);
  
  // Создаем пустую доску
  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < cols; j++) {
      const itemIndex = i * cols + j;
      board[i][j] = {
        item: itemIndex < shuffledItems.length ? shuffledItems[itemIndex] : { name: '', icon: '' },
        color: undefined,
        locked: false
      };
    }
  }
  
  return board;
}

export function checkWinningLines(
  board: Cell[][],
  row: number,
  col: number,
  color: string,
  minLength: number,
  existingLines: WinningLine[]
): WinningLine[] {
  const directions = [
    [0, 1],   // горизонтально
    [1, 0],   // вертикально
    [1, 1],   // диагональ вправо-вниз
    [1, -1]   // диагональ влево-вниз
  ];

  const newLines: WinningLine[] = [...existingLines];

  directions.forEach(([dx, dy]) => {
    // Ищем самое дальнее начало линии
    let startRow = row;
    let startCol = col;
    let maxBackSteps = 10; // Защита от бесконечного цикла
    
    while (
      maxBackSteps > 0 &&
      startRow - dx >= 0 && 
      startCol - dy >= 0 && 
      startCol - dy < board[0].length &&
      board[startRow - dx][startCol - dy]?.color === color
    ) {
      startRow -= dx;
      startCol -= dy;
      maxBackSteps--;
    }

    // Собираем все клетки от начала до конца
    let currentRow = startRow;
    let currentCol = startCol;
    const cells: { row: number; col: number }[] = [];
    let maxForwardSteps = 10; // Защита от бесконечного цикла

    while (
      maxForwardSteps > 0 &&
      currentRow < board.length &&
      currentCol >= 0 &&
      currentCol < board[0].length &&
      board[currentRow][currentCol]?.color === color
    ) {
      cells.push({ row: currentRow, col: currentCol });
      currentRow += dx;
      currentCol += dy;
      maxForwardSteps--;
    }

    console.log('Найдена полная линия:', cells);

    // Проверяем все возможные подлинии нужной длины
    for (let i = 0; i <= cells.length - minLength; i++) {
      const subLine = cells.slice(i, i + minLength);
      console.log('Проверяем подлинию:', subLine);

      // Проверяем пересечения с существующими линиями
      const canCreateLine = newLines.every(existingLine => {
        // Если линии разного цвета - можно создавать
        if (existingLine.color !== color) {
          return true;
        }

        // Проверяем направление существующей линии
        const firstCell = existingLine.cells[0];
        const lastCell = existingLine.cells[existingLine.cells.length - 1];
        const existingDx = Math.sign(lastCell.row - firstCell.row);
        const existingDy = Math.sign(lastCell.col - firstCell.col);
        
        // Если направления разные - можно создавать
        if (Math.sign(dx) !== existingDx || Math.sign(dy) !== existingDy) {
          return true;
        }

        // Проверяем общие клетки
        const commonCells = subLine.filter(cell =>
          existingLine.cells.some(existingCell =>
            existingCell.row === cell.row && existingCell.col === cell.col
          )
        );

        // Если нет общих клеток - можно создавать
        if (commonCells.length === 0) {
          return true;
        }

        // Если больше одной общей клетки - нельзя создавать
        if (commonCells.length > 1) {
          return false;
        }

        // Проверяем единственную общую клетку
        const commonCell = commonCells[0];
        
        // Общая клетка должна быть началом новой линии и концом существующей
        // ИЛИ концом новой линии и началом существующей
        const isCommonCellNewStart = subLine[0].row === commonCell.row && subLine[0].col === commonCell.col;
        const isCommonCellNewEnd = subLine[subLine.length - 1].row === commonCell.row && subLine[subLine.length - 1].col === commonCell.col;
        const isCommonCellExistingStart = firstCell.row === commonCell.row && firstCell.col === commonCell.col;
        const isCommonCellExistingEnd = lastCell.row === commonCell.row && lastCell.col === commonCell.col;

        return (isCommonCellNewStart && isCommonCellExistingEnd) || 
               (isCommonCellNewEnd && isCommonCellExistingStart);
      });

      if (canCreateLine) {
        console.log('Добавляем новую линию:', subLine);
        newLines.push({ cells: subLine, color });
      }
    }
  });

  return newLines;
}
