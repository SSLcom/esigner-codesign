import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';

import fs, { copyFileSync, mkdirSync, writeFileSync, chmodSync, readFileSync, existsSync } from 'fs';
import path from 'path';
import {
    CODESIGNTOOL_UNIX_RUN_CMD,
    CODESIGNTOOL_UNIX_SETUP,
    CODESIGNTOOL_WINDOWS_RUN_CMD,
    CODESIGNTOOL_WINDOWS_SETUP,
    PRODUCTION_ENVIRONMENT_NAME,
    INPUT_ENVIRONMENT_NAME,
    INPUT_JVM_MAX_MEMORY,
    WINDOWS
} from '../constants';
import { CODESIGNTOOL_PROPERTIES, CODESIGNTOOL_DEMO_PROPERTIES } from '../config';

import { extractZip, getPlatform, listFiles, userShell } from '../util';

export class CodeSigner {
    constructor() {}

    public async setup(): Promise<string> {
        const workingPath = path.resolve(process.cwd());
        listFiles(workingPath);

        let link = getPlatform() == WINDOWS ? CODESIGNTOOL_WINDOWS_SETUP : CODESIGNTOOL_UNIX_SETUP;
        let cmd = getPlatform() == WINDOWS ? CODESIGNTOOL_WINDOWS_RUN_CMD : CODESIGNTOOL_UNIX_RUN_CMD;
        core.info(`Downloading CodeSignTool from ${link}`);

        const codesigner = path.resolve(process.cwd(), 'codesign');
        core.info(`Creating CodeSignTool extract path ${codesigner}`);
        mkdirSync(codesigner);

        const downloadedFile = await tc.downloadTool(link);
        const extractedCodeSignPath = await extractZip(downloadedFile, codesigner);
        core.info(`Extract CodeSignTool from download path ${downloadedFile} to ${codesigner}`);

        const archiveName = fs.readdirSync(extractedCodeSignPath)[0];
        const archivePath = path.join(extractedCodeSignPath, archiveName);
        core.info(`Archive name: ${archiveName}, ${archivePath}`);
        listFiles(archivePath);

        const environment = core.getInput(INPUT_ENVIRONMENT_NAME) ?? PRODUCTION_ENVIRONMENT_NAME;
        const jvmMaxMemory = core.getInput(INPUT_JVM_MAX_MEMORY) ?? '2048M';
        const sourceConfig = environment == PRODUCTION_ENVIRONMENT_NAME ? CODESIGNTOOL_PROPERTIES : CODESIGNTOOL_DEMO_PROPERTIES;
        const destConfig = path.join(archivePath, 'conf/code_sign_tool.properties');

        core.info(`Write CodeSignTool config file ${sourceConfig} to ${destConfig}`);
        writeFileSync(destConfig, sourceConfig, { encoding: 'utf-8', flag: 'w' });

        core.info(`Set CODE_SIGN_TOOL_PATH env variable: ${archivePath}`);
        process.env['CODE_SIGN_TOOL_PATH'] = archivePath;

        let execCmd = path.join(archivePath, cmd);
        const execData = readFileSync(execCmd, { encoding: 'utf-8', flag: 'r' });
        const result = execData.replace(/java -cp/g, `java -Xmx${jvmMaxMemory} -cp`);
        core.info(`Exec Cmd Content: ${result}`);
        writeFileSync(execCmd, result, { encoding: 'utf-8', flag: 'w' });
        chmodSync(execCmd, '0755');

        const shellCmd = userShell();
        core.info(`Shell Cmd: ${shellCmd}`);
        core.info(`Exec Cmd : ${execCmd}`);
        execCmd = shellCmd + ' ' + execCmd;
        execCmd = execCmd.trimStart().trimEnd();
        return execCmd;
    }
}
