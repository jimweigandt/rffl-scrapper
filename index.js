const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const fantasy = async (username) => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null
    });

    const page = await browser.newPage();

    const url = 'https://football.fantasysports.yahoo.com/2017/f1/35015/matchup?mid1=8&mid2=2&week=16';
    // const url = 'https://football.fantasysports.yahoo.com/2011/f1/292853/matchup?week=4&mid1=1&mid2=5';
    // const url = 'https://football.fantasysports.yahoo.com/2011/f1/292853/matchup?week=17&mid1=4&mid2=6';
    await page.goto(url);

    // Enters username for Yahoo account (So far this only seems to be needed for 2011. Was the original league set to a private one?)
        if (url.includes('2011')) {
            await page.type('[name=username]', 'jimweigandt');
            await page.click('[type=submit]');

            await page.waitForSelector('#login-passwd');
            await page.type('[name=password]', '@Vikings1961');
            await page.click('[type=submit]');

        }

    // await page.type('[name=username]', 'jimweigandt');
    // await page.click('[type=submit]');

    // Wait for password page to render. Enters password and submits the form (Seems to only be needed for 2011)
    // await page.waitForSelector('#login-passwd');
    // await page.type('[name=password]', '@Vikings1961');
    // await page.click('[type=submit]');

    // Waits for page to load and takes screenshot
    await page.waitFor(5000);
    await page.waitForSelector('#matchups', {
        visible: true,
    });

    await page.click('#bench-toggle');
    await page.waitFor(5000);


    const getWeek = await page.evaluate(() => {
        const weekData = document.querySelector('#fantasy').innerText;
        const cleanWeekData = weekData.split("\n");

        return cleanWeekData;
    })


    //Scrapes matchup data to an array
    const getMatchup = await page.evaluate(() => {
        const matchupData = document.querySelector('#matchup-header').innerText;
        const cleanMatchupData = matchupData.split("\n");

        return cleanMatchupData;
    });

    // Scrapes starting line-up scores to an array
    const getStartingLineup = await page.evaluate(() => {
        const startingData = document.querySelector('#matchups').innerText;
        const cleanStartingData = startingData.split("\n");

        return cleanStartingData;
    });

    const getBenchLineup = await page.evaluate(() => {
        const benchData = document.querySelector('#matchupcontent2').innerText;
        const cleanBenchData = benchData.split("\n");

        return cleanBenchData;
    });

    // This removes some unneccessary lines of code to make it easier to read
    let weekNumber = [];
    let cleanWeekNumber = [];
    let fullGameData = [];

    for (var i = 0; i < getWeek.length; i++) {
        if (i === 0) {
            weekNumber.push(getWeek[i]);
        }
    }


    //Remove unrecognized character

    const cleanWeekInfo = () => {
        let date = weekNumber.toString();
        let finalDate;

        if (date.includes('1:')) {
            finalDate = date.slice(0, -1);
            cleanWeekNumber.push(finalDate);
        } else if (date.includes('17:')) {
            finalDate = date.slice(1)
            cleanWeekNumber.push(finalDate);
        } else {
            finalDate = date.slice(1, -1);
            cleanWeekNumber.push(finalDate);
        }

        return finalDate;

    }

    cleanWeekInfo();


    // Isolates the number of the week
    const sliceWeek = () => {
        let week = weekNumber.toString();
        let finalWeek;

        if (week.includes('1:')) {
            finalWeek = week.slice(5, 6);
        } else if (week.includes('10:') || week.includes('11:') || week.includes('12:') || week.includes('13:') || week.includes('14:') || week.includes('15:') || week.includes('16:') || week.includes('17:')) {
            finalWeek = week.slice(6, 8);
        } else {
            finalWeek = week.slice(6, 7);
        }

        fullGameData.push(finalWeek);
        return finalWeek;
    }

    sliceWeek();

    const sliceDate = () => {
        let week = cleanWeekNumber.toString();
        let slicedDate;

        if (week.includes('10:') || week.includes('11:') || week.includes('12:') || week.includes('13:') || week.includes('14:') || week.includes('15:') || week.includes('16:') || week.includes('17:')) {
            slicedDate = week.slice(9);
        } else {
            slicedDate = week.slice(8);
        }

        fullGameData.push(slicedDate);
        return slicedDate;

    }

    sliceDate();


    for (var i = 0; i < getMatchup.length; i++) {
        if (i == 0 || i == 6) {
            fullGameData.push(getMatchup[i]);
        }
    }

    for (var i = 0; i < getStartingLineup.length; i++) {
        if (getStartingLineup[i].includes('.') ||
            getStartingLineup[i] == 'QB' ||
            getStartingLineup[i] == 'RB' ||
            getStartingLineup[i] == 'WR' ||
            getStartingLineup[i] == 'FLEX' ||
            getStartingLineup[i] == 'TE' ||
            getStartingLineup[i] == 'K' ||
            getStartingLineup[i] == 'DEF'
        ) {
            fullGameData.push(getStartingLineup[i]);
        }
    }

    console.log(fullGameData);

    for (var i = 0; i < getBenchLineup.length; i++) {
        if (getBenchLineup[i].includes('.')) {
            fullGameData.push(getBenchLineup[i]);
        }
    }

    // console.log(fullGameData);

    // Parsing the data in order by team
    let playerOneData = [];
    let playerTwoData = [];

    const push = () => {
        playerOneData.push(
            fullGameData[0], //Week Number
            fullGameData[1], //Week Date
            fullGameData[2], //Team Name
            fullGameData[4], //Quarterback Name
            fullGameData[5], //Quarterback Projection
            fullGameData[6], //Quarterback Points
            fullGameData[10],
            fullGameData[11], //Team name
            fullGameData[12],
            fullGameData[16],
            fullGameData[17],
            fullGameData[18],
            fullGameData[22],
            fullGameData[23],
            fullGameData[24], //Team name
            fullGameData[28],
            fullGameData[29],
            fullGameData[30],
            fullGameData[34],
            fullGameData[35],
            fullGameData[36],
            fullGameData[40], //Team name
            fullGameData[41],
            fullGameData[42],
            fullGameData[46],
            fullGameData[47],
            fullGameData[48],
            fullGameData[52],
            fullGameData[53], //Team name
            fullGameData[54],
            fullGameData[58], // Team Project
            fullGameData[59], // Team Total
            fullGameData[62],
            fullGameData[63],
            fullGameData[64],
            fullGameData[68], //Team name
            fullGameData[69],
            fullGameData[70],
            fullGameData[74],
            fullGameData[75],
            fullGameData[76],
            fullGameData[80],
            fullGameData[81],
            fullGameData[82], //Team name
            fullGameData[86],
            fullGameData[87],
            fullGameData[88],
            fullGameData[92], // Bench 6 Name
            fullGameData[93], // Bench 6 Projection
            fullGameData[94], // Bench 6 Points
            fullGameData[98], // Bench Point Total
        );

        playerTwoData.push({
                playername: fullGameData[9],
                projection: fullGameData[8],
                points: fullGameData[7]
            },
            // fullGameData[0], // Week Number
            // fullGameData[1], // Week Date
            // fullGameData[3], // Team Name
            // fullGameData[7], // Quarterback Points
            // fullGameData[8], // Quarterback Projection
            // fullGameData[9], // Quarterback Name
            // fullGameData[13], // Wide Receiver 1 Points
            // fullGameData[14], // Wide Receiver 1 Projection
            // fullGameData[15], // Wide Receiver 1 Name
            // fullGameData[19], // Wide Receiver 2 Points
            // fullGameData[20], // Wide Receiver 2 Projection
            // fullGameData[21], // Wide Receiver 2 Name
            // fullGameData[25], // Wide Receiver 3 Points
            // fullGameData[26], // Wide Receiver 3 Projection
            // fullGameData[27], // Wide Receiver 3 Name
            // fullGameData[31], // Running Back 1 Points
            // fullGameData[32], // Running Back 1 Projection
            // fullGameData[33], // Running Back 1 Name
            // fullGameData[37], // Running Back 2 Points
            // fullGameData[38], // Running Back 2 Projection
            // fullGameData[39], // Running Back 2 Name
            // fullGameData[43], // Tight End Points
            // fullGameData[44], // Tight End Projection
            // fullGameData[45], // Tight End Name
            // fullGameData[49], // Kicker Points
            // fullGameData[50], // Kicker Projection
            // fullGameData[51], // Kicker Name
            // fullGameData[55], // Defense Points
            // fullGameData[56], // Defense Projection
            // fullGameData[57], // Defense Name
            // fullGameData[60], // Team Points
            // fullGameData[61], // Team Projection
            // fullGameData[65], // Bench 1 Points
            // fullGameData[66], // Bench 1 Projection
            // fullGameData[67], // Bench 1 Name
            // fullGameData[71], // Bench 2 Points
            // fullGameData[72], // Bench 2 Projection
            // fullGameData[73], // Bench 2 Name
            // fullGameData[77], // Bench 3 Points
            // fullGameData[78], // Bench 3 Projection
            // fullGameData[79], // Bench 3 Name
            // fullGameData[83], // Bench 4 Points
            // fullGameData[84], // Bench 4 Projection
            // fullGameData[85], // Bench 4 Name
            // fullGameData[89], // Bench 5 Points
            // fullGameData[90], // Bench 5 Projection
            // fullGameData[91], // Bench 5 Name
            // fullGameData[95], // Bench 6 Points
            // fullGameData[96], // Bench 6 Projection
            // fullGameData[97], // Bench 6 Name
            // fullGameData[99], // Bench Point Total
        );
    }

    push();

    // console.log(playerOneData);
    // console.log(playerTwoData);

    // fs.createReadStream('input.csv')
    //     .pipe(csv())
    //     .on('data', function (row) {
    //         const player = {
    //             playername,
    //             projection,
    //             points
    //         }
    //         playerTwoData.push(player);
    //     })
    //     .on('end', fucntion () {
    //         writeToCSVFile(playerTwoData)
    //     })

    // function writeToCsvFile(playerTwoData) {
    //     const filename = 'output.csv';

    //     fs.writeFile(filename, extractAsCSV(filename), err => {
    //         if (err) {
    //             console.log('Error writing to csv file', err);
    //         } else {
    //             console.log(`saved as ${filename}`);
    //         }
    //     });
    // }

    // function extractAsCSV(playerTwoData) {
    //     const header = ["Playername, Projection, Points"];
    //     const rows = playerTwoData.map(playerTwoData =>
    //         `${user.playername}, ${user.projection}, ${user.points}`    
    //     );
    //     return header.concat(rows).join("\n");
    // }

}

fantasy();





// (async function main() {
//     try {

//         const browser = await puppeteer.launch({ headless: false });
//         const page = await browser.newPage();
//         page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36');

//         await page.goto('https://experts.shopify.com/');

//         await page.waitForSelector('#js-experts-mount');

//         console.log('its showing');


//     } catch (e) {
//         console.log('our error', e);
//     }
// })