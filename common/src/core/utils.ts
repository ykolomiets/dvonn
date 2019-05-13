export function clearConsole(): void {
  const rows = process.stdout.rows as number;
  for (let i = 0; i < rows; i++) {
    console.log('\r\n');
  }
}

export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * i);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}
