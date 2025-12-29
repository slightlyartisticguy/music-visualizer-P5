
let song
var songName // relative path to the song file
let fft
let particles = []
let amp
let amplitude;
let bassThreshold
let scale;


function preload() {
    soundFormats('mp3');
    
    songName = 'music/Big Wild - When I Get There.mp3'
    song = loadSound( songName );
    
}



function setup() {
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.mousePressed(canvasPressed);
    angleMode(DEGREES);
    fft = new p5.FFT();
   // fft.smooth(1); // Smoothing to reduce rapid fluctuations (0-1, higher = smoother)
    amplitude = new p5.Amplitude();
    frameRate(30); // 30 seems to be ideal
    scale = min(width, height) / 600; // Scale factor for proportional sizing
    console.log("Scale factor: " + scale);
    noLoop();

    displaySongName();

}

function displaySongName() {
    document.getElementById('songName').innerText = songName.substring(0, songName.lastIndexOf('.'));
}

function draw() {
    background(0)
    stroke(255)
    translate(width / 2, height / 2)

    fft.analyze()
    amp = fft.getEnergy(20, 200)
    let bass = fft.getEnergy('bass')

    var wave = fft.waveform();  

    let level = amplitude.getLevel() // gets amp value between 0 and 1. This is basically the loudness.

    // textSize(20);
    // stroke(255);
    // textAlign(CENTER);
    // text('Current Amp Level: ' + Math.trunc(amp), 0, height / 2 - 50);
    // text('Current Bass Level: ' + Math.trunc(bass), 0, height / 2 - 20);
    
    

    colorArray = [level * 255, level * level * 255, level * level * level * 255]
    // let red = level * 255
    // let green = level * 255
    // let blue = level * 255
    // let colorAlt1 = level * level * 255
    // let colorAlt2 = level * level * level * 255
    let wavelength = wave.length - 1;

    if (bass > 220 && bass < 245) {
        bassThreshold = bass
    }
    if(bass > bassThreshold || bass > 245){
        shuffle(colorArray, true)
    }
    // inner spiky blob
    for (var t = -1; t <= 1; t += 2) { // plots two waveforms to make a full circle
        beginShape()
        noFill()

        stroke(colorArray[0], colorArray[1], colorArray[2])
        // stroke(red, colorAlt1, colorAlt2)
        strokeWeight(30 * scale)
        // Changing the step of i changes the smoothness of the wave
        for (var i = 0; i <= 180; i += 30) {
            // floor() rounds down to nearest integer
            var index = floor(map(i, 0, 180, 0, wavelength))
            // map(), first param is original value, 2nd two are original range.
            // last two parameters set new target range for radius. Decreasing difference of
            // these variables will make oscillations more subtle.
            var r = map(wave[index], -1, 1, 0, 30 * scale)
            var x = r * t * sin(i)
            var y = r * cos(i)
            vertex(x, y)
        }
        endShape()
    }
    if(bass > bassThreshold || bass > 250){ // if lots of bass, become colorful
        shuffle(colorArray, true)
    }

    // middle spiky blob
    for (var t = -1; t <= 1; t += 2) {
        beginShape()
        noFill()

        stroke(colorArray[0], colorArray[1], colorArray[2])
        // stroke(colorAlt1, green, colorAlt2)
        strokeWeight(18 * scale)
        for (var i = 0; i <= 180; i += 6) {
            var index = floor(map(i, 0, 180, 0, wavelength))
            var r = map(wave[index], -1, 1, 15 * scale, 40 * scale)
            var x = r * t * sin(i)
            var y = r * cos(i)
            vertex(x, y)
        }
        endShape()
    }
    if(bass > bassThreshold || bass > 250){
        shuffle(colorArray, true)
    }

    // outer spiky blob
    for (var t = -1; t <= 1; t += 2) {
        beginShape()
        noFill()

        stroke(colorArray[0], colorArray[1], colorArray[2])
        // stroke(colorAlt2, colorAlt1, blue)
        strokeWeight(12 * scale)
        for (var i = 0; i <= 180; i += 3) {
            var index = floor(map(i, 0, 180, 0, wavelength));
            var r = map(wave[index], -1, 1, 15 * scale, 35 * scale);
            var x = r * t * sin(i);
            var y = r * cos(i);
            vertex(x, y)
        }
        endShape()
    }
    if(bass > bassThreshold || bass > 250){
        shuffle(colorArray, true)
    }

    let eg = (amp / 100) / 2; // range from 0 to 2.5
    // layered waves
    for (var z = 1; z <= 10; z++){
        for (var t = -1; t <= 1; t += 2) {
            beginShape();
            noFill();

            if (z < 6) { // fade color for 6 rings, then reverse fade for last 4
                stroke(colorArray[0] * (1 / z), colorArray[1] * (1 / z) , colorArray[2] * (1 / z))
            } else {
                stroke(colorArray[0] * (1 / (-(z - 10) + 1)), colorArray[1] * (1 / (-(z - 10) + 1)) , colorArray[2] * (1 / (-(z - 10) + 1)))
            }
            // stroke(colorArray[0] * (1 / z), colorArray[1] * (1 / z) , colorArray[2] * (1 / z))
            // stroke(255 - red, 100, 55);
            strokeWeight(6 - z / 2); // decrease stroke weight for outer rings
            for (var i = 0; i <= 180; i += .5) { // any step over 3 is not smooth, anything under .5 will likely lag
                var index = floor(map(i, 0, 180, 0, wavelength));
                var r = map(wave[index], -1, 1, (100 + 10 ** eg + 4 * z) * scale, (150 + 15 ** eg + 8 * z) * scale)
                // var r = map(wave[index], -1, 1, (75 * eg + 4 * z) * scale, (175 * eg + 8 * z) * scale)
                var x = r * t * sin(i)
                var y = r * cos(i)
                vertex(x, y); 
                
            }
            endShape()
        }
    }


    for (var t = -1; t <= 1; t += 2) {
        var p = new Particle()
        particles.push(p)
        for (var i = particles.length - 1; i >= 0; i--) {
            if (!particles[i].edges()) {
                particles[i].update(amp > 230)
                particles[i].show()
            } else {
                particles.splice(i, 1)
            }

        }
        // for (var i = particles.length - 1; i >= 0; i--) {
        //     particles[i].updateBrightness()
        // }
    }

}

function canvasPressed() {
    if (song.isPlaying()) {
        song.pause();
        noLoop();
    } else {
        song.play();
        loop();
    }

}

function keyPressed() {
    if (key === 'f' || key === 'F') {
        fullscreen(true);
    }
}

class Particle {
    constructor() {
        this.pos = p5.Vector.random2D().mult(200 * scale) // starting position of particle
        this.vel = createVector(0, 0)
        this.acc = this.pos.copy().mult(random(0.0001, 0.00001))

        this.w = random(1, 10)
        this.color = color(random(220, 255), random(20, 80), random(20, 80)) // particle color RGB, currently set for redder particles

        this.color.setAlpha(random(25, 150))
        this.alpha = alpha(this.color)

        this.alphaUpdateTime = 0
        this.alphaUpdateInterval = 4000;

    }
    update(cond) {
        this.vel.add(this.acc)
        this.pos.add(this.vel)

        this.alphaUpdateTime += deltaTime
        if (this.alphaUpdateTime >= this.alphaUpdateInterval) {
            this.color.setAlpha(this.alpha + random(-20, 20))
            this.alphaUpdateTime = 0
        }

        if (cond) {
            this.pos.add(this.vel)
            this.pos.add(this.vel)
            this.pos.add(this.vel)
        }
    }
    // this.pos.x < -width / 2 || this.pos.x > width / 2
    edges() {
        return Math.abs(this.pos.x) > width / 2 ||
            Math.abs(this.pos.y) > height / 2;
    }
    show() {
        noStroke()
        fill(this.color)
        ellipse(this.pos.x, this.pos.y, this.w)

    }
    // updateBrightness(){
    //     this.color.setAlpha(random(100, 255))
    // }
}




