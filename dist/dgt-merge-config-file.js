'use strict';

module.exports = {
    mergeJson: function mergeJson(newConfig, oldConfig, attirbsToOverride) {
        
        if (!oldConfig) {
            return newConfig;  
        }

        for (const n in newConfig) {
            if (attirbsToOverride && attirbsToOverride.includes(n)) {
                continue;
            }
            if (typeof newConfig[n] !== 'object' && oldConfig[n]) {
                newConfig[n] = oldConfig[n];
            } else {
                newConfig[n] = mergeJson(newConfig[n], oldConfig[n], attirbsToOverride);
            }
        }

        return newConfig;

    },
    writeJsonFile: function writeJsonFile(jsonObj, filePath) {
        require('fs').writeFileSync(filePath, JSON.stringify(jsonObj, null, 4));
    }
};