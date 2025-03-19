import assert from "assert";
import { exit } from "process";
import { createInterface } from "readline/promises";
import { Command } from "./Command";

const shell_builtin = ['echo', 'exit', 'type'];
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {

  while (true) {
    const answer = await rl.question('$ ');
    const cmd = new Command(answer);
    
    if (cmd.name.length === 0) {
      assert(false, "Must provide at least one command");
    }

    if (!shell_builtin.includes(cmd.name)) {
      rl.write(`${answer}: command not found\n`);
      continue;
    }
    else if (cmd.name === 'type') {
      if (cmd.name.length < 2) {
        assert(false, 'Not implemented yet');
      }

      const { value } = cmd[Symbol.iterator]().next();
      
      if (!shell_builtin.includes(value)) {
        rl.write(`${value}: not found\n`);
        continue;
      }

      rl.write(`${value} is a shell builtin\n`)
      continue;
    }
    else if (cmd.name === 'echo') {
      cmd.args.forEach(e => rl.write(`${e} `));
      rl.write('\n');
      continue;
    }
    else if (cmd.name === 'exit') {
      const { value } = cmd[Symbol.iterator]().next();
      
      let num = Number.parseInt(value);
      if (!isNaN(num)) {
        exit(num);
      }
    }
  }
}

main();
