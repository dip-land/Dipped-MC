"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.liner = void 0;
function liner(lineConsumer) {
    let buffer = ''; // TODO Is there a StringBuilder in js?
    return (data) => {
        buffer += data;
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (let i = 0; i < lines.length; i++) {
            lineConsumer(lines[i]);
        }
    };
}
exports.liner = liner;
//# sourceMappingURL=liner.js.map