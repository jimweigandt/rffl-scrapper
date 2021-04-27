const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const csvjson = require('csvjson');

const currentYear = '2019';

(async () => {

    const urls = require(`./rffl-urls/2019-urls.js`);

    for (let j = 0; j < 1; j++) {

        const url = urls[j];
        const browser = await puppeteer.launch({
            headless: true
        });
        const page = await browser.newPage();


        await page.goto(`${url}`, {
            waitUntil: 'networkidle2',
            timeout: 0
        });

        if (url.includes('2011')) {
            await page.type('[name=username]', 'jimweigandt');
            await page.click('[type=submit]');

            await page.waitForSelector('#login-passwd');
            await page.type('[name=password]', '@Vikings1961');
            await page.click('[type=submit]');

        };

        await page.waitFor(5000);
        await page.waitForSelector('#matchups', {
            visible: true,
        });

        await page.click('#bench-toggle');
        await page.waitFor(5000);


        const getWeek = await page.evaluate(() => {
            const weekData = document.querySelector('#fantasy').innerText;
            const playerIds = document.querySelectorAll(
                '[id^="playernote"], div > [href^="https://sports.yahoo.com/nfl/players/"], [href^="#pps-"], [class^="Alt Ta-end F-shade"]');
            //const playerNames = document.querySelectorAll('div > [href^="https://sports.yahoo.com/nfl/players/"]');

            //const first = links[0].innerText;

            const array = [];

            for (i = 0; i < playerIds.length; i++) {
                array.push(playerIds[i].id);
                array.push(playerIds[i].innerText);
                //array.push(playerNames[i].innerText);
            }

            for (i = 0; i < array.length; i++) {
                if (array[i] === 'No new player Notes' || array[i] === '') {
                    array.splice(i, 1);
                }
            }
            // for (i = 0; i < playerNames.length; i++) {
            //     array.push(playerNames[i].innerText);
            //     //array.push(playerNames[i].innerText);
            // }
            

            // const first = links[0].id;
            // const second = links[1].id;

            // array.push(first, second);

            //const convert = links[0].id;

            //const array = Array.from(links);

            //const convert = array.forEach((element) => console.log("dmx"));




            //const hydro = links[0].forEach(i => console.log(i));

            //var id = links.querySelector('[id^="playernote"]').id;

            //const cleanWeekData = weekData.split("\n");

            return array;
        })


        //Scrapes matchup data to an array
        const getMatchup = await page.evaluate(() => {
            const matchupData = document.querySelector('#matchup-header').innerText;
            const cleanMatchupData = matchupData.split("\n");

            return cleanMatchupData;
        });

        // Scrapes starting line-up scores to an array
        const getStartingLineup = await page.evaluate(() => {
            const startingData = document.querySelector('#matchups').getAttribute('href');
            //const cleanStartingData = startingData.split("\n");
            console.log(startingData);

            return startingData;
        });


        const getBenchLineup = await page.evaluate(() => {
            const benchData = document.querySelector('#matchupcontent2').innerText;
            const cleanBenchData = benchData.split("\n");

            return cleanBenchData;
        });

        const startingLineup = getWeek;



        // startingLineup.forEach(element => {
        //     console.log("dmx");
        // })

        console.log(startingLineup);

        //const convert = startingLineup.forEach(element => console.log(element.outerHTML))

        const bench = getBenchLineup.toString();

        //console.log(convert);

        await browser.close();

    }
})();