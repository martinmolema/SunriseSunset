/***
 * Sunrise, sunset, moonrise, moon set demonstration using SVG-images
 * and HSL color schema to animate twilight time background
 */

window.onload = () => {
    setup();
    run();
}

// COloring info (HSL-schema)
let HSL_COLOR_NUMBER_SKY=210;
let HSL_LIGHTNESS_MAX_SKY=75;
let HSL_LIGHTNESS_MIN_SKY=0;
let HSL_SATURATION_SKY=100;

let HSL_COLOR_NUMBER_WINDOWS=63;
let HSL_LIGHTNESS_MIN_WINDOWS=30;
let HSL_LIGHTNESS_MAX_WINDOWS=60;
let HSL_SATURATION_WINDOWS=100;

// How many stars to draw, which colors and sizes
let MIN_STARS=10;
let MAX_STARS=50;
let STAR_COLORS_HSL=[
    0, // red
    233, //blue
    191, // blue
    63, // yellow
    20, // orange
];
let MAX_STAR_SIZE=2.0;
let MIN_STAR_SIZE=0.5;
let STARS_TWINKLE_HSL_MIN_LIGHTNESS=20;
let STARS_TWINKLE_HSL_MAX_LIGHTNESS=80;
let STARS_TWINKLE_HSL_RANGE= STARS_TWINKLE_HSL_MAX_LIGHTNESS - STARS_TWINKLE_HSL_MIN_LIGHTNESS;


// Variables to reference DOM Html elements
let htmlContainer;
let htmlImageSun, htmlImageMoon, htmlImageContainer, htmlWindows, htmlStars, htmlStarContainer;
let htmlGameDateTime;

// globals to set client width and height
let clientW, clientH ;

// how to setup your day......
const hoursDaylight = 10;
const hoursMoonlight = 24 - hoursDaylight;
const daylightStartsAtHour = 8;
const startDate = new Date();

// how to setup your updates.
let intervalLength = 100; // 100 milliseconds
const gameTimeFactor = 15000 * (1000 / intervalLength);
let tickCounter = 0;

/**
 * Calculate stuff only once and draw stuff once (like stars)
 */
function setup() {
    htmlContainer      = document.getElementById("sunrise");
    htmlImageSun       = document.getElementById("heavenlybodySun");
    htmlImageMoon      = document.getElementById("heavenlybodyMoon");
    htmlGameDateTime   = document.getElementById("dateTime");
    htmlImageContainer = document.getElementById("imageContainer");
    htmlWindows        = document.getElementById("windows");
    htmlStars          = document.getElementById("stars");
    htmlStarContainer  = document.getElementById("starsContainer");

    clientW    = htmlContainer.clientWidth;
    clientH    = htmlContainer.clientHeight;

    drawRandomStars();
}

function run() {
    setInterval(() => {
        moveHeavenlyBodies();
    }, 100);
}

/**
 * Move the heavenly bodies across an arc using cos/sin functions and change the background color according to
 * the time of day/night
 */
function moveHeavenlyBodies() {
    tickCounter++;

    const gameDateTime = new Date(startDate.getTime() + (tickCounter * gameTimeFactor));

    htmlGameDateTime.innerText = gameDateTime.toDateString() + ' ' + gameDateTime.toTimeString();

    const hour = gameDateTime.getHours();

    let offset;
    let period;
    let isNight;
    let isDaytime;
    // determine icon needed
    if (hour >= daylightStartsAtHour && hour < daylightStartsAtHour + hoursDaylight) {
        offset = hour - daylightStartsAtHour;
        period = hoursDaylight;
        isDaytime = true;
        isNight = false;
    } else {
        offset = hour - (daylightStartsAtHour + hoursDaylight);
        if (offset < 0) {
            offset += 24;
        }
        period = 24 - hoursDaylight;
        isDaytime = false;
        isNight = true;
    }
    const fractHour = gameDateTime.getMinutes() / 60 ;
    offset += fractHour;

    // decide which image to display
    htmlImageMoon.style.display = isNight ? 'block' : 'none';
    htmlImageSun.style.display  = isDaytime ? 'block' : 'none';

    // get image size of the chosen image
    const imageSize = isNight ? htmlImageMoon.width.baseVal.value : htmlImageSun.width.baseVal.value;

    // now we know what the size of the image is.
    const availableW = clientW - imageSize;
    const availableH = clientH;
    const halfWidth  = availableW / 2;

    // divide half an arc (PI) by the number of hours of the selected period (day or night)
    const arcLengthOneHour = Math.PI / period;

    // calculate the position on the arc
    const positionOnArc = arcLengthOneHour * offset;

    // derive the position (x,y) from the position on the arc
    const circleX = Math.cos(Math.PI + positionOnArc); // -1 -> 0 -> 1
    const circleY = Math.sin(positionOnArc);

    // because the X-value runs from -1 to 1 we calculate starting from the middle
    const x = Math.trunc(halfWidth + halfWidth * circleX);
    const y = Math.trunc(availableH - availableH * circleY);

    // set (x,y) position on the container (DIV-element)
    htmlImageContainer.style.left   = `${x}px`
    htmlImageContainer.style.top = `${y}px`;

    /********* Start calculating the colors using HSL method *************/
    const lastHourOfDaylight  = (hour === daylightStartsAtHour + hoursDaylight -1) ;
    const firstHourOfDaylight = (hour === daylightStartsAtHour);
    const isTwilight = (lastHourOfDaylight  || firstHourOfDaylight );

    // only the lightness is changed during the twilight hours
    let hslLightnessSky, hslLightnessWindows;

    if (isTwilight) {
        if (firstHourOfDaylight) {
            // first hour --> make background lighter, make lights weaker
            hslLightnessSky     = HSL_LIGHTNESS_MIN_SKY     + fractHour * (HSL_LIGHTNESS_MAX_SKY     - HSL_LIGHTNESS_MIN_SKY);
            hslLightnessWindows = HSL_LIGHTNESS_MAX_WINDOWS - fractHour * (HSL_LIGHTNESS_MAX_WINDOWS - HSL_LIGHTNESS_MIN_WINDOWS);
            starOpacity = 1-fractHour;
        }
        else if (lastHourOfDaylight) {
            // last hour --> make background lighter, make lights brighter
            hslLightnessSky     = HSL_LIGHTNESS_MAX_SKY     - fractHour * (HSL_LIGHTNESS_MAX_SKY - HSL_LIGHTNESS_MIN_SKY);
            hslLightnessWindows = HSL_LIGHTNESS_MIN_WINDOWS + fractHour * (HSL_LIGHTNESS_MAX_WINDOWS - HSL_LIGHTNESS_MIN_WINDOWS);
            starOpacity = fractHour;
        }
        htmlWindows.style.fill = `hsl(${HSL_COLOR_NUMBER_WINDOWS}, ${HSL_SATURATION_WINDOWS}%, ${hslLightnessWindows}%)`;

    }
    else if(isDaytime) {
        hslLightnessSky = HSL_LIGHTNESS_MAX_SKY;
        htmlWindows.style.fill = 'transparent';
        starOpacity = 0;
    }
    else if (isNight){
        hslLightnessSky = HSL_LIGHTNESS_MIN_SKY;
        htmlWindows.style.fill = `hsl(${HSL_COLOR_NUMBER_WINDOWS}, ${HSL_SATURATION_WINDOWS}%, ${HSL_LIGHTNESS_MAX_WINDOWS}%)`;
        starOpacity = 1;
        twinkleStars();

    }

    htmlStarContainer.style.opacity = starOpacity;

    htmlContainer.style.backgroundColor = `hsl(${HSL_COLOR_NUMBER_SKY}, ${HSL_SATURATION_SKY}%, ${hslLightnessSky}%)`;

}//moveHeavenlyBodies

/**
 * Draw a random number of stars (within a certain range) and pick a random color from the HSL color array. Each
 * star is an SVG-circle with a small radius
 */
function drawRandomStars() {
    const nrOfStars = Math.random() * (MAX_STARS - MIN_STARS) + MIN_STARS;
    let stars = '';
    for (let i = 0; i < nrOfStars; i++) {
        const x = Math.trunc( Math.random() * clientW ); // use full width
        const y = Math.trunc( Math.random() * clientH /2 ); // only fill top half
        const color = STAR_COLORS_HSL[Math.trunc(Math.random() * (STAR_COLORS_HSL.length)-1)];
        const size = Math.random() * (MAX_STAR_SIZE - MIN_STAR_SIZE) + MIN_STAR_SIZE;

        stars += `<circle class="star" r="${size}" cx="${x}" cy="${y}" stroke="none" fill="hsl(${color}, 100%, 50%)" />`;
    }
    htmlStars.innerHTML = stars;
}// drawRandomStars

/**
 * Search for stars and make them twinkle by parsing the current HSL-information (fill) and change the lightness
 * This is done by increasing or decreasing the value of the HSL with a random value and keep it within certain ranges
 */
function twinkleStars() {
    // regex for parsing an HSL color
    let regex = /.*?\(([0-9]*)[\s,]*([0-9]*)[\s,%]*([0-9]*).*?\)/g;

    // find all stars by classname
    const stars = document.getElementsByClassName('star');

    // cycle through all stars
    for (const star of stars) {
        // get the color-string and parse it using regex
        const color = star.getAttribute('fill');

        // convert result to an array using spread operator
        const parts = [...color.matchAll(regex)];

        // check if found
        if (parts.length === 1) {
            // get the constituents (these are the pure numbers, without a %-sign e.g.
            const lightness  = parseInt(parts[0][3]);
            const colornr    = parts[0][1];
            const saturation = parts[0][2];

            // calculate a change value in the given range. the range is split in halve so both positive and negative
            // values are found, so the lightness can increase and decrease
            const change = (STARS_TWINKLE_HSL_RANGE / 2) -
                Math.trunc( Math.random() * STARS_TWINKLE_HSL_RANGE );

            // put the new value in range
            let newLightness = Math.max(
                Math.min( lightness + change , STARS_TWINKLE_HSL_MAX_LIGHTNESS),
                STARS_TWINKLE_HSL_MIN_LIGHTNESS);

            // compose a new HSL-string and apply it to the star's fill attribute.
            let hsl = `hsl(${colornr},${saturation}%,${newLightness}%)`;
            star.setAttribute('fill', hsl);
        }

    }
}// twinkleStars