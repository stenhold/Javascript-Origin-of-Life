let numMonomers = 5;
let numChains = 100;
let monomerSize = 10;
let chains = [];
let colors = [];
let mutationProbability = 1 / numMonomers;
let lastMutationTime = 0;
let mutationInterval = 200;
let plotCanvas;
let redCount = 0;
let blueCount = 0;
let redHistory = [];
let blueHistory = [];
let interactionThreshold = 40;
let activeSite = [];

let plotScale = 0.3; // Vertical height of measurement graph
let verticalShift = 0; // Amount to shift measurement graph upward

let plotCanvasY = 250; // Hardcoded Y position of plotCanvas

let maxHeight; // Defining maxHeight...

let numChainsSlider; // HTML controls

function setup() {
    createCanvas(800, 500);
    plotCanvas = createGraphics(800, 250);

    setupControls(); // Set up HTML controls
    initializeChains(); // Initialize chains at startup
}

function setupControls() {
    // Link to the number of chains slider
    numChainsSlider = select('#numChainsSlider');
    numChainsSlider.input(() => {
        numChains = parseInt(numChainsSlider.value(), 10); // Ensure numChains is an integer
        initializeChains(); // Reinitialize the simulation with the new value
    });
}

function initializeChains() {
    chains = []; // Reset the chains array
    colors = []; // Reset the colors array
    activeSite = []; // Reset the activeSite array
    for (let j = 0; j < numChains; j++) {
        chains[j] = [];
        colors[j] = [];
        activeSite[j] = [];
        for (let i = 0; i < numMonomers; i++) {
            chains[j][i] = createVector(random(width), random(height / 2));
            colors[j][i] = (i === 0) ? color(200, 0, 0) : color(0, 0, 200);
            activeSite[j][i] = (i === 0);
        }
    }
}


function draw() {
    background(220);
    for (let j = 0; j < numChains; j++) {
        for (let i = 0; i < numMonomers; i++) {
            noStroke();
            fill(colors[j][i]);
            ellipse(chains[j][i].x, chains[j][i].y, monomerSize, monomerSize);

            // Calculate the distance between the cursor and the monomer
            let dx = chains[j][i].x - mouseX;
            let dy = chains[j][i].y - mouseY;
            let distance = sqrt(dx * dx + dy * dy);

            // Define a repulsion force that is inversely proportional to the distance
            let repulsionForce = 100 / distance;

            // Apply the repulsion force to the monomer, in the direction away from the cursor
            chains[j][i].x += dx / distance * repulsionForce;
            chains[j][i].y += dy / distance * repulsionForce;

            // Apply correct constraint for x and corrected y
            chains[j][i].x = constrain(chains[j][i].x, monomerSize / 2, width - monomerSize / 2);
            chains[j][i].y = constrain(chains[j][i].y, monomerSize / 2, height / 2 - monomerSize / 2);

            chains[j][i].x += random(-1, 1);
            chains[j][i].y += random(-1, 1);

            // The correct constraint for x remains the same; y constraint is now consistent with the setup
            chains[j][i].x = constrain(chains[j][i].x, monomerSize / 2, width - monomerSize / 2);
            chains[j][i].y = constrain(chains[j][i].y, monomerSize / 2, height / 2 - monomerSize / 2);
        }
        stroke('black');
        for (let i = 0; i < numMonomers - 1; i++) {
            line(chains[j][i].x, chains[j][i].y, chains[j][i + 1].x, chains[j][i + 1].y);
            let d = dist(chains[j][i].x, chains[j][i].y, chains[j][i + 1].x, chains[j][i + 1].y);
            if (d > monomerSize) {
                let diff = createVector(chains[j][i].x - chains[j][i + 1].x, chains[j][i].y - chains[j][i + 1].y);
                diff.setMag(d - monomerSize);
                chains[j][i].sub(diff);
            } else if (d < monomerSize) {
                let diff = createVector(chains[j][i].x - chains[j][i + 1].x, chains[j][i].y - chains[j][i + 1].y);
                diff.setMag(monomerSize - d);
                chains[j][i].add(diff);
            }
        }
    }
    if (millis() - lastMutationTime > mutationInterval) {
        mutateColors();
        lastMutationTime = millis();
    }
    redHistory.push(redCount);
    blueHistory.push(blueCount);
    image(plotCanvas, 0, plotCanvasY);
    plotCanvas.background(255);
    // Adjust the plotting for red history
    plotCanvas.stroke('red');
    for (let i = 0; i < redHistory.length - 1; i++) {
        plotCanvas.line(
            i * (plotCanvas.width / redHistory.length),
            plotCanvas.height - (redHistory[i] * plotScale) - verticalShift, // Shifted upward
            (i + 1) * (plotCanvas.width / redHistory.length),
            plotCanvas.height - (redHistory[i + 1] * plotScale) - verticalShift // Shifted upward
        );
    }

    // Adjust the plotting for blue history
    plotCanvas.stroke('blue');
    for (let i = 0; i < blueHistory.length - 1; i++) {
        plotCanvas.line(
            i * (plotCanvas.width / blueHistory.length),
            plotCanvas.height - (blueHistory[i] * plotScale) - verticalShift, // Shifted upward
            (i + 1) * (plotCanvas.width / blueHistory.length),
            plotCanvas.height - (blueHistory[i + 1] * plotScale) - verticalShift // Shifted upward
        );
    }
}

function mutateColors() {
    redCount = 0;
    blueCount = 0;
    for (let j = 0; j < numChains; j++) {
        let activeCount = 0;
        for (let i = 0; i < numMonomers; i++) {
            if (red(colors[j][i]) === 200) {
                activeCount++;
            }
        }
        for (let i = 0; i < numMonomers; i++) {
            if (random() < activeCount / numMonomers) {
                colors[j][i] = (red(colors[j][i]) === 200) ? color(0, 0, 200) : color(200, 0, 0);
                activeSite[j][i] = !activeSite[j][i];
            }
            if (red(colors[j][i]) === 200) {
                redCount++;
            } else {
                blueCount++;
            }
        }
        for (let k = 0; k < numChains; k++) {
            if (k != j && dist(chains[j][0].x, chains[j][0].y, chains[k][0].x, chains[k][0].y) < interactionThreshold) {
                for (let i = 0; i < numMonomers; i++) {
                    if (activeSite[j][i] && random() < activeCount / numMonomers) {
                        colors[k][i] = color(200, 0, 0);
                        activeSite[k][i] = true;
                    }
                }
            }
        }
    }
}