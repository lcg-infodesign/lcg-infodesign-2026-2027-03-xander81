// ricordati di fare "go live"

let myTable;
let drivers = [];
let teams = [];

const teamColors = {
  "McLaren": "#FF8000",
  "Red Bull Racing": "#3671C6",
  "Mercedes": "#27F4D2",
  "Ferrari": "#E8002D",
  "Williams": "#64C4FF",
  "Aston Martin": "#229971",
  "Kick Sauber": "#52E252",
  "Racing Bulls": "#8E5CF7",
  "Haas": "#B6BABD",
  "Alpine": "#FF87BC"
};

const margin = { left: 70, right: 230, top: 60, bottom: 60 };

async function setup() {
  createCanvas(windowWidth, windowHeight);

  // carico i dati (in p5 v2 loadTable restituisce una Promise)
 myTable = await loadTable("assets/data.csv", ",", "header");
 console.log("righe caricate:", myTable.getRowCount());

  for (let numRiga = 0; numRiga < myTable.getRowCount(); numRiga++) {
    let d = {
      driver: myTable.getString(numRiga, "Driver"),
      team: myTable.getString(numRiga, "Team"),
      points: myTable.getNum(numRiga, "Points")
    };
    drivers.push(d);
    if (!teams.includes(d.team)) teams.push(d.team);
  }
}

function colorFor(team) {
  return color(teamColors[team] || "#888888");
}

function draw() {
  background("#100000");

  // se i dati non sono ancora pronti, non disegno nulla
  if (drivers.length === 0) return;

  let chartW = width - margin.left - margin.right;
  let chartH = height - margin.top - margin.bottom;
  let baseY = margin.top + chartH;

  let maxPoints = 0;
  for (let d of drivers) maxPoints = max(maxPoints, d.points);
  let axisMax = ceil(maxPoints / 50) * 50;

  // titolo
  noStroke();
  fill(255);
  textSize(22);
  textAlign(LEFT, CENTER);
  text("F1 Driver Standings", margin.left, 30);

  // griglia e valori asse y
  textSize(12);
  for (let v = 0; v <= axisMax; v += 50) {
    let y = map(v, 0, axisMax, baseY, margin.top);
    stroke(255, 40);
    strokeWeight(1);
    line(margin.left, y, margin.left + chartW, y);
    noStroke();
    fill(200);
    textAlign(RIGHT, CENTER);
    text(v, margin.left - 10, y);
  }

  // barre
  let slot = chartW / drivers.length;
  let barW = slot * 0.75;
  let hovered = null;

  for (let i = 0; i < drivers.length; i++) {
    let d = drivers[i];
    let x = margin.left + i * slot + (slot - barW) / 2;
    let h = map(d.points, 0, axisMax, 0, chartH);
    let y = baseY - h;

    let sopra = mouseX > x && mouseX < x + barW && mouseY > y && mouseY < baseY;
    if (sopra) hovered = d;

    noStroke();
    fill(colorFor(d.team));
    rect(x, y, barW, h, 3, 3, 0, 0);

    // contorno bianco sulla barra sotto il mouse
    if (sopra) {
      stroke(255);
      strokeWeight(2);
      noFill();
      rect(x, y, barW, h, 3, 3, 0, 0);
    }
  }

  // asse x
  stroke(255, 120);
  strokeWeight(1.5);
  line(margin.left, baseY, margin.left + chartW, baseY);

  drawLegend(chartW);

  // tooltip per ultimo, così sta sopra a tutto
  if (hovered) drawTooltip(hovered);
}

function drawLegend(chartW) {
  let lx = margin.left + chartW + 40;
  let ly = margin.top;

  noStroke();
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text("Teams", lx, ly);
  ly += 34;

  textSize(14);
  for (let t of teams) {
    noStroke();
    fill(colorFor(t));
    rect(lx, ly, 18, 18, 3);
    fill(230);
    textAlign(LEFT, CENTER);
    text(t, lx + 28, ly + 9);
    ly += 30;
  }
}

function drawTooltip(d) {
  let line1 = d.driver;
  let line2 = d.team + " - " + d.points + " pts";

  textSize(14);
  let w = max(textWidth(line1), textWidth(line2)) + 24;
  let h = 50;
  let tx = mouseX + 16;
  let ty = mouseY - h - 8;
  if (tx + w > width) tx = mouseX - w - 16;
  if (ty < 5) ty = mouseY + 16;

  fill(0, 230);
  stroke(colorFor(d.team));
  strokeWeight(2);
  rect(tx, ty, w, h, 6);

  noStroke();
  fill(255);
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  text(line1, tx + 12, ty + 16);
  textStyle(NORMAL);
  fill(210);
  text(line2, tx + 12, ty + 35);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
