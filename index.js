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

    };

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

    const bench = getBenchLineup.toString();

    // This removes some unneccessary lines of code to make it easier to read
    let weekNumber = [];
    let cleanWeekNumber = [];
    let fullGameData = [];

    for (var i = 0; i < getWeek.length; i++) {
        if (i === 0) {
            weekNumber.push(getWeek[i]);
        }
    }

    const getYear = () => {
        const actualYear = url.slice(41, 45);

        fullGameData.push(actualYear);
    }

    getYear();

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
    };

    for (var i = 0; i < getBenchLineup.length; i++) {
        if (getBenchLineup[i].includes('.') ||
            getBenchLineup[i].includes('–') ||
            getBenchLineup[i] == '(Empty)' ||
            getBenchLineup[i] == 'BN' ||
            getBenchLineup[i] == 'IR'
        ) {
            fullGameData.push(getBenchLineup[i]);
        }
    };

    const yes = fullGameData.toString();

    fs.writeFile(
        path.join(__dirname, '/test', 'testing.csv'),
        yes,
        err => {
            if (err) throw err;
            console.log('WE DID IT');
        }
    );

    // Parsing the data in order by team
    let playerOneData = [];
    let playerTwoData = [];

    const push = () => {
        playerOneData.push(
            // fullGameData[0], // Year
            // fullGameData[1], // Week
            // fullGameData[2], // Date

            // fullGameData[3], // Team Name
            // fullGameData[4], // Opponent Name

            // fullGameData[68], // Team 1 Projected Points
            // fullGameData[69], // Team 1 Total Points

            // fullGameData[114], // Team 1 Bench Total Points before 2019
            // fullGameData[119], // Team 1 Bench Total Points if 2019 and beyond


            // Player 1
            {
                position: fullGameData[8], // Player 1 Position
                playername: fullGameData[5], // Player 1 Name
                projection: fullGameData[6], // Player 1 Projection
                points: fullGameData[7], // Player 1 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[3], // RFFL Team Name
                rfflopponent: fullGameData[4] // RFFL Opponent Name
            },

            // Player 2
            {
                position: fullGameData[15], // Player 2 Position
                playername: fullGameData[12], // Player 2 Name
                projection: fullGameData[13], // Player 2 Projection
                points: fullGameData[14], // Player 2 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[3], // RFFL Team Name
                rfflopponent: fullGameData[4] // RFFL Opponent Name
            },
            // Player 3
            {
                position: fullGameData[22], // Player 3 Position
                playername: fullGameData[19], // Player 3 Name
                projection: fullGameData[20], // Player 3 Projection
                points: fullGameData[21], // Player 3 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[3], // RFFL Team Name
                rfflopponent: fullGameData[4] // RFFL Opponent Name
            },
            // Player 4
            {
                position: fullGameData[29], // Player 4 Position
                playername: fullGameData[26], // Player 4 Name
                projection: fullGameData[27], // Player 4 Projection
                points: fullGameData[28], // Player 4 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[3], // RFFL Team Name
                rfflopponent: fullGameData[4] // RFFL Opponent Name
            },
            // Player 5
            {
                position: fullGameData[36], // Player 5 Position
                playername: fullGameData[33], // Player 5 Name
                projection: fullGameData[34], // Player 5 Projection
                points: fullGameData[35], // Player 5 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[3], // RFFL Team Name
                rfflopponent: fullGameData[4] // RFFL Opponent Name
            },
            // Player 6
            {
                position: fullGameData[43], // Player 6 Position
                playername: fullGameData[40], // Player 6 Name
                projection: fullGameData[41], // Player 6 Projection
                points: fullGameData[42], // Player 6 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[3], // RFFL Team Name
                rfflopponent: fullGameData[4] // RFFL Opponent Name
            },
            // Player 7
            {
                position: fullGameData[50], // Player 7 Position
                playername: fullGameData[47], // Player 7 Name
                projection: fullGameData[48], // Player 7 Projection
                points: fullGameData[49], // Player 7 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[3], // RFFL Team Name
                rfflopponent: fullGameData[4] // RFFL Opponent Name
            },
            // Player 8
            {
                position: fullGameData[57], // Player 8 Position
                playername: fullGameData[54], // Player 8 Name
                projection: fullGameData[55], // Player 8 Projection
                points: fullGameData[56], // Player 8 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[3], // RFFL Team Name
                rfflopponent: fullGameData[4] // RFFL Opponent Name
            },
            // Player 9
            {
                position: fullGameData[64], // Player 9 Position
                playername: fullGameData[61], // Player 9 Name
                projection: fullGameData[62], // Player 9 Projection
                points: fullGameData[63], // Player 9 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[3], // RFFL Team Name
                rfflopponent: fullGameData[4] // RFFL Opponent Name
            },
            // Bench Player 1
            {
                position: fullGameData[75], // Bench Player 1 Position
                playername: fullGameData[72], // Bench Player 1 Name
                projection: fullGameData[73], // Bench Player 1 Projection
                points: fullGameData[74], // Bench Player 1 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[3], // RFFL Team Name
                rfflopponent: fullGameData[4] // RFFL Opponent Name
            },
            // Bench Player 2
            {
                position: fullGameData[82], // Bench Player 2 Position
                playername: fullGameData[79], // Bench Player 2 Name
                projection: fullGameData[80], // Bench Player 2 Projection
                points: fullGameData[81], // Bench Player 2 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[3], // RFFL Team Name
                rfflopponent: fullGameData[4] // RFFL Opponent Name
            },
            // Bench Player 3
            {
                position: fullGameData[89], // Bench Player 3 Position
                playername: fullGameData[86], // Bench Player 3 Name
                projection: fullGameData[87], // Bench Player 3 Projection
                points: fullGameData[88], // Bench Player 3 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[3], // RFFL Team Name
                rfflopponent: fullGameData[4] // RFFL Opponent Name
            },
            // Bench Player 4
            {
                position: fullGameData[96], // Bench Player 4 Position
                playername: fullGameData[93], // Bench Player 4 Name
                projection: fullGameData[94], // Bench Player 4 Projection
                points: fullGameData[95], // Bench Player 4 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[3], // RFFL Team Name
                rfflopponent: fullGameData[4] // RFFL Opponent Name
            },
            // Bench Player 5
            {
                position: fullGameData[103], // Bench Player 5 Position
                playername: fullGameData[100], // Bench Player 5 Name
                projection: fullGameData[101], // Bench Player 5 Projection
                points: fullGameData[102], // Bench Player 5 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[3], // RFFL Team Name
                rfflopponent: fullGameData[4] // RFFL Opponent Name
            },
            // Bench Player 6
            {
                position: fullGameData[110], // Bench Player 6 Position
                playername: fullGameData[107], // Bench Player 6 Name
                projection: fullGameData[108], // Bench Player 6 Projection
                points: fullGameData[109], // Bench Player 6 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[3], // RFFL Team Name
                rfflopponent: fullGameData[4] // RFFL Opponent Name
            },
        );

        if (url.includes('2019')) {
            playerOneData.push({
                // IR Player    
                position: fullGameData[117], // Bench Player 6 Position
                playername: fullGameData[114], // Bench Player 6 Name
                projection: fullGameData[115], // Bench Player 6 Projection
                points: fullGameData[116], // Bench Player 6 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[3], // RFFL Team Name
                rfflopponent: fullGameData[4] // RFFL Opponent Name
            })
        };

        playerTwoData.push(
            // fullGameData[0], // Year
            // fullGameData[1], // Week
            // fullGameData[2], // Date

            // fullGameData[3], // Team Name
            // fullGameData[4], // Opponent Name

            // fullGameData[68], // Team 1 Projected Points
            // fullGameData[69], // Team 1 Total Points

            // fullGameData[114], // Team 1 Bench Total Points before 2019
            // fullGameData[119], // Team 1 Bench Total Points if 2019 and beyond


            // Player 1
            {
                position: fullGameData[8], // Player 1 Position
                playername: fullGameData[11], // Player 1 Name
                projection: fullGameData[10], // Player 1 Projection
                points: fullGameData[9], // Player 1 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[4], // RFFL Team Name
                rfflopponent: fullGameData[3] // RFFL Opponent Name
            },

            // Player 2
            {
                position: fullGameData[15], // Player 2 Position
                playername: fullGameData[18], // Player 2 Name
                projection: fullGameData[17], // Player 2 Projection
                points: fullGameData[16], // Player 2 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[4], // RFFL Team Name
                rfflopponent: fullGameData[3] // RFFL Opponent Name
            },
            // Player 3
            {
                position: fullGameData[22], // Player 3 Position
                playername: fullGameData[25], // Player 3 Name
                projection: fullGameData[24], // Player 3 Projection
                points: fullGameData[23], // Player 3 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[4], // RFFL Team Name
                rfflopponent: fullGameData[3] // RFFL Opponent Name
            },
            // Player 4
            {
                position: fullGameData[29], // Player 4 Position
                playername: fullGameData[32], // Player 4 Name
                projection: fullGameData[31], // Player 4 Projection
                points: fullGameData[30], // Player 4 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[4], // RFFL Team Name
                rfflopponent: fullGameData[3] // RFFL Opponent Name
            },
            // Player 5
            {
                position: fullGameData[36], // Player 5 Position
                playername: fullGameData[39], // Player 5 Name
                projection: fullGameData[38], // Player 5 Projection
                points: fullGameData[37], // Player 5 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[4], // RFFL Team Name
                rfflopponent: fullGameData[3] // RFFL Opponent Name
            },
            // Player 6
            {
                position: fullGameData[43], // Player 6 Position
                playername: fullGameData[46], // Player 6 Name
                projection: fullGameData[45], // Player 6 Projection
                points: fullGameData[44], // Player 6 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[4], // RFFL Team Name
                rfflopponent: fullGameData[3] // RFFL Opponent Name
            },
            // Player 7
            {
                position: fullGameData[50], // Player 7 Position
                playername: fullGameData[53], // Player 7 Name
                projection: fullGameData[52], // Player 7 Projection
                points: fullGameData[51], // Player 7 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[4], // RFFL Team Name
                rfflopponent: fullGameData[3] // RFFL Opponent Name
            },
            // Player 8
            {
                position: fullGameData[57], // Player 8 Position
                playername: fullGameData[60], // Player 8 Name
                projection: fullGameData[59], // Player 8 Projection
                points: fullGameData[58], // Player 8 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[4], // RFFL Team Name
                rfflopponent: fullGameData[3] // RFFL Opponent Name
            },
            // Player 9
            {
                position: fullGameData[64], // Player 9 Position
                playername: fullGameData[67], // Player 9 Name
                projection: fullGameData[66], // Player 9 Projection
                points: fullGameData[65], // Player 9 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[4], // RFFL Team Name
                rfflopponent: fullGameData[3] // RFFL Opponent Name
            },
            // Bench Player 1
            {
                position: fullGameData[75], // Bench Player 1 Position
                playername: fullGameData[78], // Bench Player 1 Name
                projection: fullGameData[77], // Bench Player 1 Projection
                points: fullGameData[76], // Bench Player 1 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[4], // RFFL Team Name
                rfflopponent: fullGameData[3] // RFFL Opponent Name
            },
            // Bench Player 2
            {
                position: fullGameData[82], // Bench Player 2 Position
                playername: fullGameData[85], // Bench Player 2 Name
                projection: fullGameData[84], // Bench Player 2 Projection
                points: fullGameData[83], // Bench Player 2 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[4], // RFFL Team Name
                rfflopponent: fullGameData[3] // RFFL Opponent Name
            },
            // Bench Player 3
            {
                position: fullGameData[89], // Bench Player 3 Position
                playername: fullGameData[92], // Bench Player 3 Name
                projection: fullGameData[91], // Bench Player 3 Projection
                points: fullGameData[90], // Bench Player 3 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[4], // RFFL Team Name
                rfflopponent: fullGameData[3] // RFFL Opponent Name
            },
            // Bench Player 4
            {
                position: fullGameData[96], // Bench Player 4 Position
                playername: fullGameData[99], // Bench Player 4 Name
                projection: fullGameData[98], // Bench Player 4 Projection
                points: fullGameData[97], // Bench Player 4 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[4], // RFFL Team Name
                rfflopponent: fullGameData[3] // RFFL Opponent Name
            },
            // Bench Player 5
            {
                position: fullGameData[103], // Bench Player 5 Position
                playername: fullGameData[106], // Bench Player 5 Name
                projection: fullGameData[105], // Bench Player 5 Projection
                points: fullGameData[104], // Bench Player 5 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[4], // RFFL Team Name
                rfflopponent: fullGameData[3] // RFFL Opponent Name
            },
            // Bench Player 6
            {
                position: fullGameData[110], // Bench Player 6 Position
                playername: fullGameData[113], // Bench Player 6 Name
                projection: fullGameData[112], // Bench Player 6 Projection
                points: fullGameData[111], // Bench Player 6 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[4], // RFFL Team Name
                rfflopponent: fullGameData[3] // RFFL Opponent Name
            },
        );

        if (url.includes('2019')) {
            playerTwoData.push({
                // IR Player    
                position: fullGameData[117], // Bench Player 6 Position
                playername: fullGameData[120], // Bench Player 6 Name
                projection: fullGameData[119], // Bench Player 6 Projection
                points: fullGameData[118], // Bench Player 6 Points
                week: fullGameData[1], // Week
                date: fullGameData[2], // Date
                rfflteam: fullGameData[4], // RFFL Team Name
                rfflopponent: fullGameData[3] // RFFL Opponent Name
            })
        };
    }

    push();

    // console.log(playerOneData);
    console.log(playerTwoData);

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