import { chdir, env, exit, cwd  } from "process";
import { createInterface } from "readline/promises";
import assert from "assert";
import { Command } from "./Command";
import path from "path";
import { stat } from "fs/promises";
import { exec as ExecCallback } from "child_process";
import { promisify } from "util";

const exec = promisify(ExecCallback);

export class Shell {
  static readonly builtin_cmds = ['echo', 'exit', 'type', 'pwd', 'cd'];
  private _history;
  private rl;
  private _path;
  private _home;

  constructor() {
    this._history = '';
    this._path = env.PATH || '';
    this._home = env.HOME || '';
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

  async isExternal(cmd: string): Promise<boolean> {
    const paths = this._path.split(path.delimiter);
    for (let pt of paths) {
      let ztat;
      try {
        ztat = await stat(pt + '/' + cmd);
      } catch (err) {
        continue;
      }
      if (ztat.isFile()) return true;
    }
    
    return false;
  }

  async runExternalCmd(cmd: string) {
    try {
      const { stdout, stderr } = await exec(cmd);
      this.rl.write(stdout);

      if (stderr) {
        console.error(stderr);
      }
    } catch (error) {
      console.error(`Exec error: ${error}`);
    }
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
        continue;
      }
      else if (cmd.name === 'echo') {
        cmd.args.forEach(e => this.rl.write(`${e} `));
        this.rl.write('\n');
        continue;
      }
      else if (cmd.name === 'exit') {
        const { value } = cmd[Symbol.iterator]().next();

        let num = Number.parseInt(value);
        if (!isNaN(num)) {
          exit(num);
        }
      } else if (cmd.name === 'pwd') {
        this.rl.write(cwd() + '\n');
        continue;
      } else if (cmd.name === 'cd') {
        if (cmd.args.length > 1) {
          console.error('elhash: cd: to many arguments');
          continue;
        } else if (cmd.args.length === 0) {
          try {
            chdir(this._home);
          } catch (error) {
            console.error('elhash: cd: Unexpected Error');
          }
          continue;
        }
        
        try {
          const dirc = (cmd.args[0] === '~')? this._home: cmd.args[0]; 
          chdir(dirc);
        } catch (error) {
          console.error(`cd: ${cmd.args[0]}: No such file or directory`); 
        }

        continue;
      }

      const isExternal = await this.isExternal(cmd.name);

      if (isExternal) {
        await this.runExternalCmd(`"${cmd.name}" ${cmd.args.join(' ')}`);
        continue;
      }

      this.rl.write(`${answer}: command not found\n`);
    }
  }
}
