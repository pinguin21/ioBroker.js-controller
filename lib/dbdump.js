/**
 *
 *  dpdump.js
 *
 *      Utility to get JSON Database Dumps
 *
 *      7'2014 hobbyquaker <hq@ccu.io>
 *
 */
/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

const yargs = require('yargs')
    .usage('$0 [-d design] [-s search] [-p pattern]')
    .example('$0 -s state', 'get all objects with type=state')
    .example('$0 -s state -p hue.*', 'get all objects from the adapter hue with type=state')
// Todo   .example('$0 -p system.*', 'get all objects with _id=system.*')
    .alias('s', 'search')
    .alias('d', 'design')
    .default('design',   'system')
    ;

if (!yargs.argv.s && !yargs.argv.p) {
    yargs.showHelp();
    process.exit(0);
}

const Objects = require('./objects');

const db = new Objects({
    logger: {
        silly: function (_msg) { },
        debug: function (_msg) { },
        info:  function (_msg) { },
        warn:  function (msg) {
            console.log(msg);
        },
        error: function (msg) {
            console.log(msg);
        }
    },
    connected: function () {

        if (yargs.argv.search) {
            db.getObjectView(yargs.argv.design, yargs.argv.search, {}, function (err, res) {
                if (err) {
                    console.log(err);
                    process.exit(1);
                }
                showResult(res);

            });
        } else {
            db.getObjectList({include_docs: true}, function (err, res) {
                if (err) {
                    console.log(err);
                    process.exit(1);
                }
                showResult(res);
            });
        }

    }
});

function showResult(res) {
    const outArr = [];
    for (let i = 0; i < res.total_rows; i++) {
        const obj = res.rows[i].value;
        delete obj._rev;
        outArr.push(obj);
    }
    console.log(JSON.stringify(outArr, null, '  '));
    process.exit(0);
}

