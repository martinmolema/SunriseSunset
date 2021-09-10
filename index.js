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
let STAR_COLORS=['yellow', 'red', 'blue', 'orange', 'white'];
let MAX_STAR_SIZE=2.0;
let MIN_STAR_SIZE=0.5;

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
    }

    htmlStarContainer.style.opacity = starOpacity;

    htmlContainer.style.backgroundColor = `hsl(${HSL_COLOR_NUMBER_SKY}, ${HSL_SATURATION_SKY}%, ${hslLightnessSky}%)`;

}//moveHeavenlyBodies

function drawRandomStars() {
    const nrOfStars = Math.random() * (MAX_STARS - MIN_STARS) + MIN_STARS;
    let stars = '';
    for (let i = 0; i < nrOfStars; i++) {
        const x = Math.trunc( Math.random() * clientW ); // use full width
        const y = Math.trunc( Math.random() * clientH /2 ); // only fill top half
        const color = STAR_COLORS[Math.trunc(Math.random() * (STAR_COLORS.length)-1)];
        const size = Math.random() * (MAX_STAR_SIZE - MIN_STAR_SIZE) + MIN_STAR_SIZE;

        stars += `<circle r="${size}" cx="${x}" cy="${y}" stroke="none" fill="${color}" />`;
    }
    htmlStars.innerHTML = stars;
}
