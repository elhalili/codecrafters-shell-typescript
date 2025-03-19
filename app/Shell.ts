import { env, exit  } from "process";
import { createInterface } from "readline/promises";
import assert from "assert";
import { Command } from "./Command";
import path from "path";
import { stat } from "fs/promises";

export class Shell {
  static readonly builtin_cmds = ['echo', 'exit', 'type'];
  private _history;
  private rl;
  private _path;

  constructor() {
    this._history = '';
    this._path = env.PATH || '';
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    }); 
  }

  isBuiltin(cmd: string) {
    return Shell.builtin_cmds.includes(cmd.trim());
  }

  appendHistory(cmd: string) {
    this._history += cmd;
  }
  
  async run() {
    // shell loop
    while (true) {
      const answer = await this.rl.question('$ ');
      this.appendHistory(answer);
      const cmd = new Command(answer);
      
//         console.log(`DEBUG: ${this._path}`);
//         assert(false);


      if (cmd.name.length === 0) {
        assert(false, "Must provide at least one command");
      }

      if (!this.isBuiltin(cmd.name)) {
        this.rl.write(`${answer}: command not found\n`);
        continue;
      }
      else if (cmd.name === 'type') {
        if (cmd.name.length < 2) {
          assert(false, 'Not implemented yet');
        }

        const { value } = cmd[Symbol.iterator]().next();

        if (this.isBuiltin(value)) {
          this.rl.write(`${value} is a shell builtin\n`)
          continue;
        }

        const paths = this._path.split(path.delimiter);
        let found = false;
        for (let pt of paths) {
          let ztat;
          try {
            ztat = await stat(pt + '/' + value);
          } catch (err) {
            continue;
          }
          if (ztat.isFile()) {
            this.rl.write(`${value} is ${pt}/${value}\n`)
            found = true;
            break;
          };
        }


        if (!found) this.rl.write(`${value}: not found\n`);
      }
      else if (cmd.name === 'echo') {
        cmd.args.forEach(e => this.rl.write(`${e} `));
        this.rl.write('\n');
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
}
