/***
 * Sunrise, sunset, moonrise, moon set demonstration using images from https://www.iconfinder.com/laurareen
 * and HSL color schema to animate twilight time background
 */

window.onload = () => {
    setup();
    run();
}

let HSL_COLOR_NUMBER=240;
let HSL_LIGHTNESS_MAX=75;
let HSL_LIGHTNESS_MIN=0;
let HSL_SATURATION=100;

let htmlContainer;
let htmlImage;
let htmlGameDateTime;
let htmlTicker;

let clientW, clientH ;

const hoursDaylight = 10;
const hoursMoonlight = 24 - hoursDaylight;
const daylightStartsAtHour = 8;
const twilightLength = 1; //hours
const startDate = new Date();
const halfPi = Math.PI / 2;

let intervalLength = 100; // 100 milliseconds
const gameTimeFactor = 15000 * (1000 / intervalLength);
let tickCounter = 0;

/**
 * Calculate stuff only once
 */
function setup() {
    htmlContainer    = document.getElementById("sunrise");
    htmlImage        = document.getElementById("heavenlybody");
    htmlGameDateTime = document.getElementById("dateTime");
    htmlTicker       = document.getElementById("ticker");

    clientW    = htmlContainer.clientWidth;
    clientH    = htmlContainer.clientHeight;
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

    let image;
    let offset;
    let period;
    let isNight;
    let isDaytime;
    // determine icon needed
    if (hour >= daylightStartsAtHour && hour < daylightStartsAtHour + hoursDaylight) {
        image = 'sun';
        offset = hour - daylightStartsAtHour;
        period = hoursDaylight;
        isDaytime = true;
        isNight = false;
    } else {
        image = 'moon';
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
    htmlImage.src = `${image}.png`;

    // now we know what the size of the image is.
    const availableW = clientW - htmlImage.clientWidth;
    const availableH = clientH; // - htmlImage.clientHeight;
    const halfWidth  = availableW / 2;

    const arcLengthOneHour = Math.PI / period;
    const positionOnArc = arcLengthOneHour * offset;

    const circleX = Math.cos(Math.PI + positionOnArc); // -1 -> 0 -> 1
    const circleY = Math.sin(positionOnArc);

    const x = Math.trunc(halfWidth + halfWidth * circleX);
    const y = Math.trunc(availableH - (availableH * circleY));

    htmlImage.style.left = `${x}px`
    htmlImage.style.top = `${y}px`;

    /********* Start calculating the background color using HSL method *************/
    const lastHourOfDaylight  = (hour == daylightStartsAtHour + hoursDaylight -1) ;
    const firstHourOfDaylight = (hour == daylightStartsAtHour);
    const isTwilight = (lastHourOfDaylight  || firstHourOfDaylight );

    // only the lightness is changed during the twilight hours
    let hslLightness;

    if (isTwilight) {
        let darkness;
        if (firstHourOfDaylight)     hslLightness = HSL_LIGHTNESS_MIN + fractHour * (HSL_LIGHTNESS_MAX - HSL_LIGHTNESS_MIN);
        else if (lastHourOfDaylight) hslLightness = HSL_LIGHTNESS_MAX - fractHour * (HSL_LIGHTNESS_MAX - HSL_LIGHTNESS_MIN);
    }
    else if(isDaytime) {
        hslLightness = HSL_LIGHTNESS_MAX;
    }
    else if (isNight){
        hslLightness = HSL_LIGHTNESS_MIN;
    }
    htmlContainer.style.backgroundColor = `hsl(${HSL_COLOR_NUMBER}, ${HSL_SATURATION}%, ${hslLightness}%)`;
}//moveHeavenlyBodies
