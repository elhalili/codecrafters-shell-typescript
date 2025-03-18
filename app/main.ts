import assert from "assert";
import { exit } from "process";
import { createInterface } from "readline/promises";

const shell_builtin = ['echo', 'exit', 'type'];
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

    if (!shell_builtin.includes(cmd[0])) {
      rl.write(`${answer}: command not found\n`);
      continue;
    }
    else if (cmd[0] === 'type') {
      if (cmd.length < 2) {
        assert(false, 'Not implemented yet');
      }
      
      if (!shell_builtin.includes(cmd[1])) {
        rl.write(`${cmd[1]}: command not found\n`);
        continue;
      }

      rl.write(`${cmd[1]} is a shell builtin\n`)
      continue;
    }
    else if (cmd[0] === 'echo') {
      cmd.slice(1).forEach(e => rl.write(`${e} `));
      rl.write('\n');
      continue;
    }
    else if (cmd[0] === 'exit') {
      let num = Number.parseInt(cmd[1]);
      if (!isNaN(num)) {
        exit(num);
      }
    }
  }
}

main();
