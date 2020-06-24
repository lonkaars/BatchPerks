var exec = require('await-exec');
var recursive = require("recursive-readdir");
var Jimp = require('jimp');
var ncp = require('ncp');
var colors = require('./icons.json');

var args = process.argv;
var argdirindex = args.indexOf(args.filter(a => a.includes("Icons"))[0]);

async function getSteamDir() {
    var reg = await exec("REG QUERY HKEY_LOCAL_MACHINE\\SOFTWARE\\Classes\\steam\\Shell\\Open\\Command")
    var steam = reg.stdout.match(/(?<=").*steam\.exe(?=\")/)[0]
    return `${steam.substr(0, steam.length - 9).replace(/\\/g, '/')}steamapps/common/Dead By Daylight/DeadByDaylight/Content/UI/Icons`
}

// main
(async() => {
	if(process.platform != "win32") console.warn("This program is intended for use on Windows only, unexpected things might happen");

    var icons = steam = argdirindex == -1 ? await getSteamDir() : args[argdirindex];
    console.log(`Using directory: ${icons}`)
    console.log('Making a backup of the current icons...')

    ncp(icons, './icons_backup', err => {
        console.log("Done making backup!")

        recursive(icons, (err, files) => {
            files.forEach(async e => {
				console.log(e)
                if (colors.find(c => e.includes(c.n))) {
                    var color = colors.find(c => e.includes(c.n)).c;
                    var bottom = await Jimp.read(color);
                    var top = await Jimp.read(e);
                    bottom.composite(top, 0, 0, {
                        opacitySource: top
                    });
                    console.log(`Adding background '${color}' to '${e}'`);
                    bottom.write(e);
                }
            })
        });
    })
})()

process.on('exit', () => {
    console.log("Done!")
})
