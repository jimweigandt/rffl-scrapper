const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const csvjson = require('csvjson');

(async () => {
    const urls = [
        'https://football.fantasysports.yahoo.com/2012/f1/162/matchup?week=1&mid1=1&mid2=8',
        'https://football.fantasysports.yahoo.com/2012/f1/162/matchup?week=1&mid1=2&mid2=3',
        'https://football.fantasysports.yahoo.com/2012/f1/162/matchup?week=1&mid1=4&mid2=9',
        'https://football.fantasysports.yahoo.com/2012/f1/162/matchup?week=1&mid1=5&mid2=6',
        'https://football.fantasysports.yahoo.com/2012/f1/162/matchup?week=1&mid1=7&mid2=10'
    ];

    for (let j = 0; j < urls.length; j++) {

        const url = urls[j];
        const browser = await puppeteer.launch({
            headless: true
        });
        const page = await browser.newPage();
        await page.goto(`${url}`, {
            waitUntil: 'networkidle2'
        });

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

        // Parsing the data in order by team
        let completedPlayerData = [];

        const pushPlayerData = () => {
            // Player Information for Team 2
            completedPlayerData.push(
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
                completedPlayerData.push({
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

            completedPlayerData.push({
                position: '',
                playername: '',
                projection: '',
                points: '',
                week: '',
                date: '',
                rfflteam: '',
                rfflopponent: ''
            });

            // Player Information for Team 2
            completedPlayerData.push(
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
                completedPlayerData.push({
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

            completedPlayerData.push({
                position: '',
                playername: '',
                projection: '',
                points: '',
                week: '',
                date: '',
                rfflteam: '',
                rfflopponent: ''
            });
        }

        pushPlayerData();


        let completedGameData = [];

        let teamOneResult;
        let teamTwoResult;

        if (parseFloat(fullGameData[69]) > parseFloat(fullGameData[70])) {
            teamOneResult = 'W'
            teamTwoResult = 'L'
        } else if (parseFloat(fullGameData[69]) < parseFloat(fullGameData[70])) {
            teamOneResult = 'L'
            teamTwoResult = 'W'
        } else {
            teamOneResult = 'T'
            teamTwoResult = 'T'
        }

        let teamOneConference;
        let teamTwoConference;

        const getConference = () => {
            switch (fullGameData[3]) {
                case 'Amish Rakefighters':
                    teamOneConference = 'Metropolitan';
                    break;
                case 'Crooked 6 1/2\'s':
                    teamOneConference = 'Metropolitan';
                    break;
                case 'Purple Jesus\'':
                    teamOneConference = 'Metropolitan';
                    break;
                case 'Wild Bunnies':
                    teamOneConference = 'Metropolitan';
                    break;
                case 'Whirling Dervishes':
                    teamOneConference = 'Metropolitan';
                    break;
                case 'Wooden Shoes':
                    teamOneConference = 'Metropolitan';
                    break;
                case 'Flying Pyramids':
                    teamOneConference = 'Metropolitan';
                    break;
                case 'Warriors of Sunlight':
                    teamOneConference = 'Metropolitan';
                    break;
                case 'Touch Me Gingerly':
                    teamOneConference = 'Atlantic';
                    break;
                case 'Fish Markets':
                    teamOneConference = 'Atlantic';
                    break;
                case 'Flying Dutchmen':
                    teamOneConference = 'Atlantic';
                    break;
                case 'Free Form Jazz':
                    teamOneConference = 'Atlantic';
                    break;
                case 'Protein Stains':
                    teamOneConference = 'Atlantic';
                    break;
                case 'Rump Runners':
                    teamOneConference = 'Atlantic';
                    break;
                case 'Sea Kings':
                    teamOneConference = 'Atlantic';
                    break;
            }

            switch (fullGameData[4]) {
                case 'Amish Rakefighters':
                    teamTwoConference = 'Metropolitan';
                    break;
                case 'Crooked 6 1/2\'s':
                    teamTwoConference = 'Metropolitan';
                    break;
                case 'Purple Jesus\'':
                    teamTwoConference = 'Metropolitan';
                    break;
                case 'Wild Bunnies':
                    teamTwoConference = 'Metropolitan';
                    break;
                case 'Whirling Dervishes':
                    teamTwoConference = 'Metropolitan';
                    break;
                case 'Wooden Shoes':
                    teamTwoConference = 'Metropolitan';
                    break;
                case 'Flying Pyramids':
                    teamTwoConference = 'Metropolitan';
                    break;
                case 'Warriors of Sunlight':
                    teamTwoConference = 'Metropolitan';
                    break;
                case 'Touch Me Gingerly':
                    teamTwoConference = 'Atlantic';
                    break;
                case 'Fish Markets':
                    teamTwoConference = 'Atlantic';
                    break;
                case 'Flying Dutchmen':
                    teamTwoConference = 'Atlantic';
                    break;
                case 'Free Form Jazz':
                    teamTwoConference = 'Atlantic';
                    break;
                case 'Protein Stains':
                    teamTwoConference = 'Atlantic';
                    break;
                case 'Rump Runners':
                    teamTwoConference = 'Atlantic';
                    break;
                case 'Sea Kings':
                    teamTwoConference = 'Atlantic';
                    break;
            }
        }

        getConference();

        let teamOneBenchTotal;
        let teamTwoBenchTotal;

        const getBenchTotals = () => {
            if (fullGameData[0] == '2019') {
                teamOneBenchTotal = fullGameData[119]
                teamTwoBenchTotal = fullGameData[120]
            } else {
                teamOneBenchTotal = fullGameData[114]
                teamTwoBenchTotal = fullGameData[115]
            }
        }

        getBenchTotals();

        let teamOneAboveProj = 0;
        let teamOneBelowProj = 0;

        let teamTwoAboveProj = 0;
        let teamTwoBelowProj = 0;

        const checkPlayerProj = () => {
            let teamOnePlayerDifference = [];
            let teamTwoPlayerDifference = [];

            teamOnePlayerDifference.push(
                (parseFloat(fullGameData[7]) - parseFloat(fullGameData[6])).toFixed(2),
                (parseFloat(fullGameData[14]) - parseFloat(fullGameData[13])).toFixed(2),
                (parseFloat(fullGameData[21]) - parseFloat(fullGameData[20])).toFixed(2),
                (parseFloat(fullGameData[28]) - parseFloat(fullGameData[27])).toFixed(2),
                (parseFloat(fullGameData[35]) - parseFloat(fullGameData[34])).toFixed(2),
                (parseFloat(fullGameData[42]) - parseFloat(fullGameData[41])).toFixed(2),
                (parseFloat(fullGameData[49]) - parseFloat(fullGameData[48])).toFixed(2),
                (parseFloat(fullGameData[56]) - parseFloat(fullGameData[55])).toFixed(2),
                (parseFloat(fullGameData[63]) - parseFloat(fullGameData[62])).toFixed(2)
            );

            teamTwoPlayerDifference.push(
                (parseFloat(fullGameData[9]) - parseFloat(fullGameData[10])).toFixed(2),
                (parseFloat(fullGameData[16]) - parseFloat(fullGameData[17])).toFixed(2),
                (parseFloat(fullGameData[23]) - parseFloat(fullGameData[24])).toFixed(2),
                (parseFloat(fullGameData[30]) - parseFloat(fullGameData[31])).toFixed(2),
                (parseFloat(fullGameData[37]) - parseFloat(fullGameData[38])).toFixed(2),
                (parseFloat(fullGameData[44]) - parseFloat(fullGameData[45])).toFixed(2),
                (parseFloat(fullGameData[51]) - parseFloat(fullGameData[52])).toFixed(2),
                (parseFloat(fullGameData[58]) - parseFloat(fullGameData[59])).toFixed(2),
                (parseFloat(fullGameData[65]) - parseFloat(fullGameData[66])).toFixed(2)
            );

            let playerOnePositive = 0;
            let playerOneNegative = 0;

            let playerTwoPositive = 0;
            let playerTwoNegative = 0;

            for (i = 0; i < teamOnePlayerDifference.length; i++) {
                if (teamOnePlayerDifference[i].includes('-')) {
                    playerOneNegative += 1
                } else {
                    playerOnePositive += 1
                }
            }

            for (i = 0; i < teamTwoPlayerDifference.length; i++) {
                if (teamTwoPlayerDifference[i].includes('-')) {
                    playerTwoNegative += 1
                } else {
                    playerTwoPositive += 1
                }
            }

            teamOneAboveProj = playerOnePositive;
            teamOneBelowProj = playerOneNegative;

            teamTwoAboveProj = playerTwoPositive;
            teamTwoBelowProj = playerTwoNegative;
        }

        checkPlayerProj();

        let combinedProjPointsTotal;

        const addProjPoints = () => {

            let points = (parseFloat(fullGameData[68]) + parseFloat(fullGameData[71])).toFixed(2)
            combinedProjPointsTotal = points
        }

        addProjPoints();

        let projTeamOneSpread;
        let projTeamTwoSpread;

        const checkSpread = () => {
            projTeamOneSpread = (parseFloat(fullGameData[68]) - parseFloat(fullGameData[71]))
            projTeamTwoSpread = (parseFloat(fullGameData[71]) - parseFloat(fullGameData[68]))
        }

        checkSpread();

        let teamOneAgainstTheSpread;
        let teamTwoAgainstTheSpread;

        const checkAgainstTheSpread = () => {
            let teamOneSpread = (parseFloat(fullGameData[69]) - parseFloat(fullGameData[70]))
            let teamTwoSpread = (parseFloat(fullGameData[70]) - parseFloat(fullGameData[69]))

            if (teamOneSpread > projTeamOneSpread) {
                teamOneAgainstTheSpread = 'Yes'
            } else if (teamOneSpread < projTeamOneSpread) {
                teamOneAgainstTheSpread = 'No'
            } else {
                teamOneAgainstTheSpread = 'Push'
            }

            if (teamTwoSpread > projTeamTwoSpread) {
                teamTwoAgainstTheSpread = 'Yes'
            } else if (teamTwoSpread < projTeamTwoSpread) {
                teamTwoAgainstTheSpread = 'No'
            } else {
                teamTwoAgainstTheSpread = 'Push'
            }
        }

        checkAgainstTheSpread();

        let overUnderResult;

        const overUnderCheck = () => {
            let actualCombinedPoints = (parseFloat(fullGameData[69]) + parseFloat(fullGameData[70]))
            let actualProjCombinedPoints = (parseFloat(fullGameData[68]) + parseFloat(fullGameData[71]))

            if (actualCombinedPoints > combinedProjPointsTotal) {
                overUnderResult = 'Over'
            } else if (actualCombinedPoints < combinedProjPointsTotal) {
                overUnderResult = 'Under'
            } else {
                overUnderResult = 'Push'
            }
        }

        overUnderCheck();

        completedGameData.push({
            week: fullGameData[1],
            date: fullGameData[2],
            year: fullGameData[0],
            result: teamOneResult,
            teamRank: '',
            team: fullGameData[3],
            teamConference: teamOneConference,
            location: '',
            oppRank: '',
            opponent: fullGameData[4],
            oppConference: teamTwoConference,
            gameType: '',
            teamScore: fullGameData[69],
            oppScore: fullGameData[70],
            teamProj: fullGameData[68],
            teamPointPct: `${Math.round((fullGameData[69]/fullGameData[68]) * 10000) / 100}%`,
            teamGrade: '',
            teamWin: '',
            teamLoss: '',
            teamTie: '',
            teamWinLossPct: '',
            teamBenchPoints: teamOneBenchTotal,
            teamBenchProj: (parseFloat(fullGameData[73]) + parseFloat(fullGameData[80]) + parseFloat(fullGameData[87]) + parseFloat(fullGameData[94]) + parseFloat(fullGameData[101]) + parseFloat(fullGameData[108])).toFixed(2),
            teamStarterAvg: parseFloat((fullGameData[69] / 9).toFixed(2)),
            teamAboveProj: teamOneAboveProj,
            teamBelowProj: teamOneBelowProj,
            teamFlexRB: '',
            teamFlexWR: '',
            teamFlexTE: '',
            oppProj: fullGameData[71],
            oppPointPct: `${Math.round((fullGameData[70]/fullGameData[71]) * 10000) / 100}%`,
            oppGrade: '',
            oppWin: '',
            oppLoss: '',
            oppTie: '',
            oppWinLossPct: '',
            oppBenchPoints: teamTwoBenchTotal,
            oppBenchProj: (parseFloat(fullGameData[77]) + parseFloat(fullGameData[84]) + parseFloat(fullGameData[91]) + parseFloat(fullGameData[98]) + parseFloat(fullGameData[105]) + parseFloat(fullGameData[112])).toFixed(2),
            oppStarterAvg: parseFloat((fullGameData[70] / 9).toFixed(2)),
            oppAboveProj: teamTwoAboveProj,
            oppBelowProj: teamTwoBelowProj,
            oppFlexRB: '',
            oppFlexWR: '',
            oppFlexTE: '',
            combinedPoints: (parseFloat(fullGameData[69]) + parseFloat(fullGameData[70])).toFixed(2),
            spread: projTeamOneSpread.toFixed(2),
            coveredUncovered: teamOneAgainstTheSpread,
            overUnder: combinedProjPointsTotal,
            overUnderRes: overUnderResult
        });

        completedGameData.push({
            week: fullGameData[1],
            date: fullGameData[2],
            year: fullGameData[0],
            result: teamTwoResult,
            teamRank: '',
            team: fullGameData[4],
            teamConference: teamTwoConference,
            location: '',
            oppRank: '',
            opponent: fullGameData[3],
            oppConference: teamOneConference,
            gameType: '',
            teamScore: fullGameData[70],
            oppScore: fullGameData[69],
            teamProj: fullGameData[71],
            teamPointPct: `${Math.round((fullGameData[70]/fullGameData[71]) * 10000) / 100}%`,
            teamGrade: '',
            teamWin: '',
            teamLoss: '',
            teamTie: '',
            teamWinLossPct: '',
            teamBenchPoints: teamTwoBenchTotal,
            teamBenchProj: (parseFloat(fullGameData[77]) + parseFloat(fullGameData[84]) + parseFloat(fullGameData[91]) + parseFloat(fullGameData[98]) + parseFloat(fullGameData[105]) + parseFloat(fullGameData[112])).toFixed(2),
            teamStarterAvg: parseFloat((fullGameData[70] / 9).toFixed(2)),
            teamAboveProj: teamTwoAboveProj,
            teamBelowProj: teamTwoBelowProj,
            teamFlexRB: '',
            teamFlexWR: '',
            teamFlexTE: '',
            oppProj: fullGameData[68],
            oppPointPct: `${Math.round((fullGameData[69]/fullGameData[68]) * 10000) / 100}%`,
            oppGrade: '',
            oppWin: '',
            oppLoss: '',
            oppTie: '',
            oppWinLossPct: '',
            oppBenchPoints: teamOneBenchTotal,
            oppBenchProj: (parseFloat(fullGameData[73]) + parseFloat(fullGameData[80]) + parseFloat(fullGameData[87]) + parseFloat(fullGameData[94]) + parseFloat(fullGameData[101]) + parseFloat(fullGameData[108])).toFixed(2),
            oppStarterAvg: parseFloat((fullGameData[69] / 9).toFixed(2)),
            oppAboveProj: teamOneAboveProj,
            oppBelowProj: teamOneBelowProj,
            oppFlexRB: '',
            oppFlexWR: '',
            oppFlexTE: '',
            combinedPoints: (parseFloat(fullGameData[69]) + parseFloat(fullGameData[70])).toFixed(2),
            spread: projTeamTwoSpread.toFixed(2),
            coveredUncovered: teamTwoAgainstTheSpread,
            overUnder: combinedProjPointsTotal,
            overUnderRes: overUnderResult
        });

        completedGameData.push({
            week: '',
            date: '',
            year: '',
            result: '',
            teamRank: '',
            team: '',
            teamConference: '',
            location: '',
            oppRank: '',
            opponent: '',
            oppConference: '',
            gameType: '',
            teamScore: '',
            oppScore: '',
            teamProj: '',
            teamPointPct: '',
            teamGrade: '',
            teamWin: '',
            teamLoss: '',
            teamTie: '',
            teamWinLossPct: '',
            teamBenchPoints: '',
            teamBenchProj: '',
            teamStarterAvg: '',
            teamAboveProj: '',
            teamBelowProj: '',
            teamFlexRB: '',
            teamFlexWR: '',
            teamFlexTE: '',
            oppProj: '',
            oppPointPct: '',
            oppGrade: '',
            oppWin: '',
            oppLoss: '',
            oppTie: '',
            oppWinLossPct: '',
            oppBenchPoints: '',
            oppBenchProj: '',
            oppStarterAvg: '',
            oppAboveProj: '',
            oppBelowProj: '',
            oppFlexRB: '',
            oppFlexWR: '',
            oppFlexTE: '',
            combinedPoints: '',
            spread: '',
            coveredUncovered: '',
            overUnder: '',
            overUnderRes: ''
        });

        await browser.close();

        let numberGamesWritten = 1 + j;

        const csvPlayerData = csvjson.toCSV(completedPlayerData, {
            headers: 'key'
        });

        fs.appendFile('./test/2012-player-data.csv', csvPlayerData, (err) => {
            if (err) {
                console.log(err);

                throw new Error(err);
            }
            console.log(`${numberGamesWritten} Player Data Written to player-data.csv`);
        });

        const csvGameData = csvjson.toCSV(completedGameData, {
            headers: 'key'
        });

        fs.appendFile('./test/game-data-test.csv', csvGameData, (err) => {
            if (err) {
                console.log(err);

                throw new Error(err);
            }
            console.log(`${numberGamesWritten} Game Data Written to CSV game-data.csv`);
        });



    }
})();