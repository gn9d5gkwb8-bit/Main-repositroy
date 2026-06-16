export function greet(name: string): string {
  return `Hello, ${name}!`;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  console.log(greet("world"));
}
