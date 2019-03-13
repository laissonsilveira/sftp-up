/*eslint no-console: ['error', { allow: ['log', 'error'] }] */
'use strict';
/**
 * @author Laisson R. Silveira <laisson.silveira@digitro.com.br> 14/05/17.
 */
const moment = require('moment');
const { writeFileSync } = require('fs');
const gulp = require('gulp');
const mocha = require('gulp-mocha');
const clean = require('gulp-clean');
const tar = require('gulp-tar');
const gzip = require('gulp-gzip');
const install = require('gulp-install');
const rename = require('gulp-rename');
const { join } = require('path');
const runSequence = require('run-sequence');

// Files & Paths
const DIST_BUILD_META = './build-meta.json';
const DIST_PATH = 'build/';
const DEFAULT_PATH = 'home2/tmp/install/';
const PROJECT_NAME = 'c-sync-server';
const buildMeta = require(DIST_BUILD_META);
const packageFile = require('./package.json');
const TESTS_PATH = './test/**/*.test.js';

// =============================================== BUILD ====================================================

gulp.task('clean', () => {
    return gulp.src(DIST_PATH + '*').pipe(clean());
});

gulp.task('copy-config', () => {
    return gulp.src(['dist/basic-config-restorer.js', 'dist/dgt-merge-config-file.js'])
        .pipe(gulp.dest(join(DIST_PATH, DEFAULT_PATH)));
});

gulp.task('copy-service', () => {
    return gulp.src(['dist/c-sync-startup.sh', 'dist/c-sync.service'])
        .pipe(gulp.dest(join(DIST_PATH, DEFAULT_PATH, PROJECT_NAME, 'init.d')));
});

gulp.task('copy-install-script', () => {
    return gulp.src('dist/InstPacote')
        .pipe(gulp.dest(DIST_PATH));
});

gulp.task('copy-src', () => {
    return gulp.src(
        [
            '!config/test.json',
            'bin/**/*',
            'config/**/*',
            'controllers/**/*',
            'lib/**/*',
            'models/**/*',
            'public/**/*',
            'routes/**/*',
            'app.js',
            'config.js',
            'package.json',
            'package-lock.json'
        ], { base: './' }
    ).pipe(gulp.dest(join(DIST_PATH, DEFAULT_PATH, PROJECT_NAME)));
});

gulp.task('copy-to-release', () => {
    return gulp.src(DIST_PATH + PROJECT_NAME + '.tgz')
        .pipe(gulp.dest('.'));
});

gulp.task('install-dependencies', () => {
    const pathPackage = join(__dirname, DIST_PATH, DEFAULT_PATH, PROJECT_NAME);
    return gulp.src(join(pathPackage, 'package.json'))
        .pipe(gulp.dest(pathPackage))
        .pipe(install({ production: true }));
});

gulp.task('clean-package-files', () => {
    const pathPackage = join(DIST_PATH, DEFAULT_PATH, PROJECT_NAME);
    return gulp.src([
        join(pathPackage, 'package.json'),
        join(pathPackage, 'package-lock.json')
    ]).pipe(clean());
});

gulp.task('make-version-file', done => {
    const versionFile = {
        version: `${PROJECT_NAME}-${process.env.npm_package_version} - ${moment().format('DD/MM/YYYY HH:MM:ss')}`,
        changeLog: buildMeta.changelog
    };
    writeFileSync(join(DIST_PATH, DEFAULT_PATH, PROJECT_NAME, `versao.${PROJECT_NAME}`), JSON.stringify(versionFile, null, 4));
    done();
});

gulp.task('build', callback => {
    runSequence(
        'clean',
        [
            'copy-config',
            'copy-service',
            'copy-install-script',
            'copy-src',
        ],
        'install-dependencies',
        'make-version-file',
        'clean-package-files',
        'compress',
        'after-build',
        callback
    );
});

gulp.task('compress', () => {
    return gulp.src(`${DIST_PATH}**/*`)
        .pipe(tar(PROJECT_NAME))
        .pipe(gzip())
        .pipe(rename(`${PROJECT_NAME}.tgz`))
        .pipe(gulp.dest(DIST_PATH));
});

gulp.task('after-build', callback => {
    runSequence('copy-to-release', 'clean', callback);
});

gulp.task('default', ['build']);

// =============================================== TEST ====================================================

gulp.task('test', () => {
    process.env.NODE_ENV = 'test';
    gulp.src(TESTS_PATH, { read: false })
        .pipe(mocha({
            timeout: 10000000,
            exit: true,
            reporter: 'mochawesome',
            reporterOptions: {
                reportDir: join('test/coverage'),
                reportTitle: `Relatório de testes do Atualizador Server v${packageFile.version}`,
                reportPageTitle: 'Testes Atualizador Server'
            }
        }))
        .on('error', () => process.exit(1));
});

gulp.task('test-debug', () => {
    const spawn = require('child_process').spawn;
    spawn('node', [
        '--debug-brk',
        join(__dirname, 'node_modules/gulp/bin/gulp.js'),
        'test'
    ], { stdio: 'inherit' });
});