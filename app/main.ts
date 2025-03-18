import { createInterface } from "readline/promises";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  while (true) {
    const answer = await rl.question('$ ');
    rl.write(`${answer}: command not found\n`);
  }
}

main();
