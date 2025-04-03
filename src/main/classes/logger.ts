import { appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

export class Logger {
    outputDir: string;
    constructor(options: LoggerOptions) {
        try {
            mkdirSync(options.outputDir, { recursive: true });
        } catch (error) {
            console.log(error);
        }

        this.outputDir = options.outputDir;
    }
    log(...args) {
        console.log(...args);
        appendFileSync(path.join(this.outputDir, `${getDate()}.log`), stringify(args));
    }
    error(...args) {
        console.error(...args);
        appendFileSync(path.join(this.outputDir, `${getDate()}-error.log`), stringify(args));
    }
}

function getDate() {
    const date = new Date();
    const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    return `${date.getFullYear()}-${month}-${day}`;
}

function stringify(args) {
    const date = new Date();
    const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
    const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    const seconds = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
    const ms = date.getMilliseconds() < 100 ? `0${date.getMilliseconds()}` : date.getMilliseconds();
    return `${hours}:${minutes}:${seconds}.${ms} ` + args + '\n';
}

export type LoggerOptions = { outputDir: string };
