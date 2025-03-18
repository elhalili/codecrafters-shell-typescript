import assert from "assert";
import { exit } from "process";
import { createInterface } from "readline/promises";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  while (true) {
    const answer = await rl.question('$ ');
    const cmd = answer.trim().split(/\s+/);
    
    if (cmd.length === 0) {
      assert(false, "Must provide at least one command");
    }

    if (cmd[0] === 'exit') {
      let num = Number.parseInt(cmd[1]);
      if (!isNaN(num)) {
        exit(num);
      }
    }

    if (cmd[0] === 'echo') {
      cmd.slice(1).forEach(e => rl.write(`${e} `));
      rl.write('\n');
      continue;
    }

    rl.write(`${answer}: command not found\n`);
  }
}

main();
