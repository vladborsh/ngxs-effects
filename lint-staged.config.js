const path = require('path');

module.exports = {
    '*.ts': absolutePaths => {
        const cwd = process.cwd();
        const relativePaths = absolutePaths.map(file => path.relative(cwd, file));
        return [
            `npx eslint -c .eslintrc.js ${relativePaths.join(' ')} --fix`
        ];
    }
};
