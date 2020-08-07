const fs = require('fs');
const glob = require('glob');
const {version} = require('../package.json');
const JSON_INDENTATION_LEVEL = 2;

syncVersion('projects');

function syncVersion(root) {
    glob(root + '/**/package.json', (_, files) => {
        files.forEach(file => {
            const packageJson = JSON.parse(fs.readFileSync(file));

            fs.writeFileSync(
                file,
                JSON.stringify(
                    {
                        ...packageJson,
                        version,
                    },
                    null,
                    JSON_INDENTATION_LEVEL,
                ),
            );
        });
    });
}
