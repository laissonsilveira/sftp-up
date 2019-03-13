'use-strict';

const mergeConfig = require('./dgt-merge-config-file'),
    oldConf = require(process.argv[2]),
    newConf = require(process.argv[3]),
    pathToSave = process.argv[3];

const overrideConfigs = [
    //   'browser_userAgent',
    //   'log_path'
];

const objMerged = mergeConfig.mergeJson(newConf, oldConf, overrideConfigs);
mergeConfig.writeJsonFile(objMerged, pathToSave);