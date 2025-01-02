type LineConsumer = (line: string) => void;
export declare function liner(lineConsumer: LineConsumer): (data: string) => void;
export {};
