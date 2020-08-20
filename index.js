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

    const url = 'https://football.fantasysports.yahoo.com/2019/f1/2577/matchup?mid1=8&mid2=2&week=16';
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
            getStartingLineup[i] == 'W/R' ||
            getStartingLineup[i] == 'W/R/T' ||
            getStartingLineup[i] == 'TE' ||
            getStartingLineup[i] == 'K' ||
            getStartingLineup[i] == 'DEF'
        ) {
            fullGameData.push(getStartingLineup[i]);
        }
    }


    for (var i = 0; i < getBenchLineup.length; i++) {
        if (getBenchLineup[i].includes('.') ||
            getBenchLineup[i] == 'BN' ||
            getBenchLineup[i] == 'IR'
        ) {
            fullGameData.push(getBenchLineup[i]);
        }
    }

    switch (url) {
        case url.includes('2011'):
            fullGameData.push('2011');
            break;
        case url.includes('2012'):
            fullGameData.push('2012');
            break;
        case url.includes('2013'):
            fullGameData.push('2013');
            break;
        case url.includes('2014'):
            fullGameData.push('2014');
            break;
        case url.includes('2015'):
            fullGameData.push('2015');
            break;
        case url.includes('2016'):
            fullGameData.push('2016');
            break;
        case url.includes('2017'):
            fullGameData.push('2017');
            break;
        case url.includes('2018'):
            fullGameData.push('2018');
            break;
        case url.includes('2019'):
            fullGameData.push('2019');
            break;
    }

    console.log(fullGameData);

    const yes = fullGameData.toString();

    fs.writeFile(
        path.join(__dirname, '/test', 'testing.csv'),
        yes,
        err => {
            if (err) throw err;
            console.log('File written to...');
        }
    );

    // Parsing the data in order by team
    let playerOneData = [];
    let playerTwoData = [];

    const push = () => {
        playerOneData.push(
            fullGameData[0], // Week
            fullGameData[1], // Date

            fullGameData[2], // Team Name
            fullGameData[3], // Opponent Name

            //Quarterback
            {
                position: fullGameData[7], // QB
                playername: fullGameData[4], // Quarterback Name
                projection: fullGameData[5], // Quarterback Projection
                points: fullGameData[6], // Quarterback Points
                week: fullGameData[0], // Week
                date: fullGameData[1], // Date
                rfflteam: fullGameData[2], // RFFL Team Name
                rfflopponent: fullGameData[3] // RFFL Opponent Name
            },

            // Wide Receiver
            fullGameData[11], // Player 2 Name
            fullGameData[12], // Player 2 Projection
            fullGameData[13], // Player 2 Points
            fullGameData[14], // Player 2 Position

            // Wide Receiver
            fullGameData[18], // Player 3 Name
            fullGameData[19], // Player 3 Projection
            fullGameData[20], // Player 3 Points
            fullGameData[21], // Player 3 Position

            // Running Back/Wide Receiver depending on year
            fullGameData[25], // Player 4 Name
            fullGameData[26], // Player 4 Projection
            fullGameData[27], // Player 4 Points
            fullGameData[28], // Player 4 Position

            // Running Back
            fullGameData[32], // Player 5 Name
            fullGameData[33], // Player 5 Projection
            fullGameData[34], // Player 5 Points
            fullGameData[35], // Player 5 Position

            // Tight End/Running Back depending on year
            fullGameData[39], // Player 6 Name
            fullGameData[40], // Player 6 Projection
            fullGameData[41], // Player 6 Points
            fullGameData[42], // Player 6 Position

            // Tight End/Flex depending on year
            fullGameData[46], // Player 7 Name
            fullGameData[47], // Player 7 Projection
            fullGameData[48], // Player 7 Points
            fullGameData[49], // Player 7 Position

            // Kicker
            fullGameData[53], // Player 8 Name
            fullGameData[54], // Player 8 Projection
            fullGameData[55], // Player 8 Points
            fullGameData[56], // Player 8 Position

            // Defense
            fullGameData[60], // Player 9 Name
            fullGameData[61], // Player 9 Projection
            fullGameData[62], // Player 9 Points
            fullGameData[63], // Player 9 Position

            // Score
            fullGameData[67], // Projected Points
            fullGameData[68], // Total Points

            fullGameData[71], // Bench 1 Name
            fullGameData[72], // Bench 1 Projection
            fullGameData[73], // Bench 1 Points
            fullGameData[74], // Bench 1 Position
            fullGameData[78], // Bench 2 Name
            fullGameData[79], // Bench 2 Projection
            fullGameData[80], // Bench 2 Points
            fullGameData[81], // Bench 2 Position
            fullGameData[85], // Bench 3 Name
            fullGameData[86], // Bench 3 Projection
            fullGameData[87], // Bench 3 Points
            fullGameData[88], // Bench 3 Position
            fullGameData[92], // Bench 4 Name
            fullGameData[93], // Bench 4 Projection
            fullGameData[94], // Bench 4 Points
            fullGameData[95], // Bench 4 Position
            fullGameData[99], // Bench 5 Name
            fullGameData[100], // Bench 5 Projection
            fullGameData[101], // Bench 5 Points
            fullGameData[102], // Bench 5 Position
            fullGameData[106], // Bench 6 Name
            fullGameData[107], // Bench 6 Projection
            fullGameData[108], // Bench 6 Points
            fullGameData[109] // Bench 6 Position
        );

        if (url.includes('2019')) {
            playerOneData.push(
                fullGameData[113], // IR Name
                fullGameData[114], // IR Projection
                fullGameData[115], // IR Points
                fullGameData[116], // IR Position
                fullGameData[118] // Bench Total Points
            )
        } else {
            playerOneData.push(
                fullGameData[113] // Bench Total Points
            )
        }

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