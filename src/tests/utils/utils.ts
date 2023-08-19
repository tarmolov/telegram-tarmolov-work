import readline from 'readline';

export function askQuestion(question: string, constantValue?: string): Promise<string> {
    if (constantValue) {
        return Promise.resolve(constantValue);
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
    }));
}
