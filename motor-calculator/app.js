const ids = [
  "statorOd",
  "statorId",
  "stackHeight",
  "slots",
  "poles",
  "voltage",
  "turns",
  "parallelPaths",
  "wireDiameter",
  "strands",
  "windingFactor",
  "endTurnFactor",
  "gapFlux",
  "magnetArc",
  "thermalWatts",
  "peakCurrent",
  "ratedSpeed",
  "windingTemp",
  "sunTeeth",
  "ringTeeth",
  "planetCount",
  "customRatio",
  "gearEfficiency",
];

const state = {
  gearMode: "planetary",
};

const jointTargets = {
  simple: [
    ["Hip pitch", 60, 18, 10],
    ["Hip roll", 45, 14, 9],
    ["Knee", 70, 22, 10],
    ["Ankle pitch", 50, 16, 12],
    ["Ankle roll", 35, 10, 10],
    ["Shoulder", 25, 7, 8],
    ["Elbow", 20, 5, 8],
    ["Wrist", 8, 2, 12],
  ],
  g1: [
    ["Hip pitch", 120, 35, 12],
    ["Hip roll", 100, 28, 10],
    ["Knee", 120, 35, 12],
    ["Ankle pitch", 80, 24, 14],
    ["Ankle roll", 60, 18, 12],
    ["Shoulder", 60, 15, 9],
    ["Elbow", 40, 10, 9],
    ["Wrist", 20, 4, 12],
  ],
  arm: [
    ["Shoulder pitch", 35, 10, 8],
    ["Shoulder roll", 30, 8, 8],
    ["Shoulder yaw", 20, 5, 10],
    ["Elbow", 25, 7, 9],
    ["Forearm roll", 12, 3, 12],
    ["Wrist pitch", 8, 2, 14],
    ["Wrist roll", 5, 1.5, 18],
  ],
};

const els = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
const motorMetrics = document.getElementById("motorMetrics");
const outputMetrics = document.getElementById("outputMetrics");
const jointTable = document.getElementById("jointTable");
const motorSvg = document.getElementById("motorSvg");
const gearSvg = document.getElementById("gearSvg");
const ratioLabel = document.getElementById("ratioLabel");
const slotPoleLabel = document.getElementById("slotPoleLabel");
const outputClass = document.getElementById("outputClass");
const warningBox = document.getElementById("warningBox");
const confidenceBadge = document.getElementById("confidenceBadge");
const robotClass = document.getElementById("robotClass");
const planetaryInputs = document.getElementById("planetaryInputs");
const customInputs = document.getElementById("customInputs");

function num(id) {
  return Number(els[id].value);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function fmt(value, digits = 1) {
  if (!Number.isFinite(value)) return "-";
  if (Math.abs(value) >= 1000) return value.toFixed(0);
  if (Math.abs(value) >= 100) return value.toFixed(1);
  if (Math.abs(value) >= 10) return value.toFixed(digits);
  return value.toFixed(Math.max(digits, 2));
}

function metric(label, value, unit, hint = "") {
  return `
    <div class="metric">
      <div class="label">${label}</div>
      <span class="value">${value}</span>
      <span class="unit">${unit}${hint ? " - " + hint : ""}</span>
    </div>
  `;
}

function calc() {
  const statorOdMm = num("statorOd");
  const statorIdMm = num("statorId");
  const stackMm = num("stackHeight");
  const slots = Math.max(3, Math.round(num("slots")));
  const poles = Math.max(2, Math.round(num("poles") / 2) * 2);
  const polePairs = poles / 2;
  const voltage = num("voltage");
  const turns = num("turns");
  const parallelPaths = Math.max(1, num("parallelPaths"));
  const wireDiameterMm = num("wireDiameter");
  const strands = Math.max(1, num("strands"));
  const windingFactor = num("windingFactor");
  const endTurnFactor = num("endTurnFactor");
  const gapFlux = num("gapFlux");
  const magnetArc = num("magnetArc");
  const thermalWatts = num("thermalWatts");
  const peakCurrent = num("peakCurrent");
  const ratedSpeed = num("ratedSpeed");
  const windingTemp = num("windingTemp");
  const gearEfficiency = num("gearEfficiency");

  const radiusM = (statorOdMm / 2) / 1000;
  const stackM = stackMm / 1000;
  const polePitchM = (2 * Math.PI * radiusM) / poles;
  const poleAreaM2 = polePitchM * stackM * magnetArc;
  const fluxPerPoleWb = gapFlux * poleAreaM2;
  const coilsPerPhase = slots / 3;
  const seriesTurnsPerPhase = (turns * coilsPerPhase) / parallelPaths;
  const fluxLinkageWb = seriesTurnsPerPhase * windingFactor * fluxPerPoleWb;
  const kt = 1.5 * polePairs * fluxLinkageWb;
  const kv = kt > 0 ? 9.549 / kt : 0;

  const wireAreaM2 = strands * Math.PI * Math.pow((wireDiameterMm / 1000) / 2, 2);
  const slotPitchM = (Math.PI * (statorOdMm / 1000)) / slots;
  const meanTurnLengthM = 2 * stackM + 2 * endTurnFactor * slotPitchM;
  const phaseLengthM = meanTurnLengthM * turns * coilsPerPhase / parallelPaths;
  const copperResistivity20 = 1.724e-8;
  const tempCoeff = 0.00393;
  const phaseResistance20 = copperResistivity20 * phaseLengthM / wireAreaM2;
  const phaseResistanceHot = phaseResistance20 * (1 + tempCoeff * (windingTemp - 20));
  const lineResistanceHot = 2 * phaseResistanceHot;
  const copperVolumeM3 = meanTurnLengthM * turns * slots * wireAreaM2;
  const copperMassKg = copperVolumeM3 * 8960;
  const continuousCurrent = Math.sqrt(Math.max(0, thermalWatts) / (3 * phaseResistanceHot));
  const continuousTorqueMotor = kt * continuousCurrent;
  const peakTorqueMotor = kt * peakCurrent;
  const electricalHzAtRated = ratedSpeed * polePairs / 60;
  const noLoadSpeed = voltage * kv;
  const mechPowerRatedW = continuousTorqueMotor * ratedSpeed * 2 * Math.PI / 60;
  const copperLossAtPeak = 3 * peakCurrent * peakCurrent * phaseResistanceHot;

  let gearRatio = num("customRatio");
  let planetTeeth = null;
  if (state.gearMode === "planetary") {
    const sun = num("sunTeeth");
    const ring = num("ringTeeth");
    gearRatio = 1 + ring / sun;
    planetTeeth = (ring - sun) / 2;
  }

  const outputContinuousTorque = continuousTorqueMotor * gearRatio * gearEfficiency;
  const outputPeakTorque = peakTorqueMotor * gearRatio * gearEfficiency;
  const outputRatedSpeedRpm = ratedSpeed / gearRatio;
  const outputNoLoadSpeedRpm = noLoadSpeed / gearRatio;
  const outputRadSec = outputNoLoadSpeedRpm * 2 * Math.PI / 60;

  return {
    statorOdMm,
    statorIdMm,
    stackMm,
    slots,
    poles,
    polePairs,
    voltage,
    turns,
    parallelPaths,
    wireDiameterMm,
    strands,
    windingFactor,
    endTurnFactor,
    gapFlux,
    magnetArc,
    thermalWatts,
    peakCurrent,
    ratedSpeed,
    windingTemp,
    radiusM,
    poleAreaM2,
    fluxPerPoleWb,
    coilsPerPhase,
    seriesTurnsPerPhase,
    kt,
    kv,
    wireAreaM2,
    meanTurnLengthM,
    phaseLengthM,
    phaseResistance20,
    phaseResistanceHot,
    lineResistanceHot,
    copperMassKg,
    continuousCurrent,
    continuousTorqueMotor,
    peakTorqueMotor,
    electricalHzAtRated,
    noLoadSpeed,
    mechPowerRatedW,
    copperLossAtPeak,
    gearRatio,
    gearEfficiency,
    planetTeeth,
    outputContinuousTorque,
    outputPeakTorque,
    outputRatedSpeedRpm,
    outputNoLoadSpeedRpm,
    outputRadSec,
  };
}

function polar(cx, cy, r, angle) {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

function arcPath(cx, cy, innerR, outerR, a0, a1) {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const p1 = polar(cx, cy, outerR, a0);
  const p2 = polar(cx, cy, outerR, a1);
  const p3 = polar(cx, cy, innerR, a1);
  const p4 = polar(cx, cy, innerR, a0);
  return [
    `M ${p1[0]} ${p1[1]}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${p2[0]} ${p2[1]}`,
    `L ${p3[0]} ${p3[1]}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${p4[0]} ${p4[1]}`,
    "Z",
  ].join(" ");
}

function drawMotor(c) {
  const cx = 210;
  const cy = 210;
  const outerR = 178;
  const boreR = clamp((c.statorIdMm / c.statorOdMm) * outerR, 40, 150);
  const slotBase = boreR + (outerR - boreR) * 0.28;
  const toothOuter = outerR - 18;
  const slotAngle = (2 * Math.PI) / c.slots;
  let svg = "";

  svg += `<circle cx="${cx}" cy="${cy}" r="${outerR + 15}" class="rotor"></circle>`;

  for (let i = 0; i < c.poles; i += 1) {
    const a0 = -Math.PI / 2 + i * (2 * Math.PI / c.poles) + 0.008;
    const a1 = -Math.PI / 2 + (i + 1) * (2 * Math.PI / c.poles) - 0.008;
    const klass = i % 2 === 0 ? "magnet-red" : "magnet-blue";
    svg += `<path class="${klass}" d="${arcPath(cx, cy, outerR + 3, outerR + 28, a0, a1)}"></path>`;
  }

  svg += `<circle cx="${cx}" cy="${cy}" r="${toothOuter}" fill="#edf3f1" stroke="#81918c" stroke-width="1"></circle>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${boreR}" fill="#ffffff" stroke="#81918c" stroke-width="2"></circle>`;

  for (let i = 0; i < c.slots; i += 1) {
    const a = -Math.PI / 2 + i * slotAngle;
    const width = slotAngle * 0.38;
    svg += `<path class="tooth" d="${arcPath(cx, cy, slotBase, toothOuter, a - width, a + width)}"></path>`;
    const copperA0 = a + width * 1.08;
    const copperA1 = a + slotAngle - width * 1.08;
    svg += `<path class="copper" d="${arcPath(cx, cy, slotBase + 8, toothOuter - 12, copperA0, copperA1)}"></path>`;
  }

  svg += `<text x="${cx}" y="${cy - 8}" class="center-label">${c.statorOdMm} x ${c.stackMm} mm</text>`;
  svg += `<text x="${cx}" y="${cy + 18}" class="center-label">${c.slots}S / ${c.poles}P</text>`;
  motorSvg.innerHTML = svg;
}

function drawGear(c) {
  const cx = 210;
  const cy = 210;
  let svg = "";
  const ringR = 160;
  const sunR = state.gearMode === "planetary" ? clamp(42 + num("sunTeeth") * 0.8, 48, 82) : 62;
  const orbitR = state.gearMode === "planetary" ? (ringR - sunR) / 2 + sunR : 104;
  const planetR = state.gearMode === "planetary" ? clamp((ringR - sunR) / 2 - 8, 28, 54) : 42;
  const planetCount = state.gearMode === "planetary" ? Math.max(1, Math.round(num("planetCount"))) : 3;

  svg += `<circle cx="${cx}" cy="${cy}" r="${ringR}" class="gear-ring"></circle>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${ringR - 28}" fill="#fff"></circle>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${orbitR}" class="orbit"></circle>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${sunR}" class="gear-sun"></circle>`;

  for (let i = 0; i < planetCount; i += 1) {
    const a = -Math.PI / 2 + i * (2 * Math.PI / planetCount);
    const [x, y] = polar(cx, cy, orbitR, a);
    svg += `<circle cx="${x}" cy="${y}" r="${planetR}" class="gear-planet"></circle>`;
    svg += `<circle cx="${x}" cy="${y}" r="5" fill="#3b4542"></circle>`;
  }

  svg += `<text x="${cx}" y="${cy - 8}" class="center-label">${fmt(c.gearRatio, 2)}:1</text>`;
  svg += `<text x="${cx}" y="${cy + 20}" class="center-label">reduction</text>`;
  gearSvg.innerHTML = svg;
}

function renderMetrics(c) {
  motorMetrics.innerHTML = [
    metric("Kt", fmt(c.kt, 3), "Nm/A", "phase current estimate"),
    metric("Kv", fmt(c.kv, 1), "rpm/V", "from Kt"),
    metric("Continuous torque", fmt(c.continuousTorqueMotor, 2), "Nm", `${fmt(c.continuousCurrent, 1)} A thermal`),
    metric("Peak torque", fmt(c.peakTorqueMotor, 2), "Nm", `${fmt(c.peakCurrent, 1)} A limit`),
    metric("No-load speed", fmt(c.noLoadSpeed, 0), "rpm", `${fmt(c.voltage, 0)} V`),
    metric("Rated mech power", fmt(c.mechPowerRatedW, 0), "W", "at target rpm"),
    metric("Phase resistance", fmt(c.phaseResistanceHot, 3), "ohm", `hot, ${fmt(c.lineResistanceHot, 3)} L-L`),
    metric("Copper mass", fmt(c.copperMassKg * 1000, 0), "g", `${fmt(c.phaseLengthM, 1)} m/phase`),
    metric("Series turns/phase", fmt(c.seriesTurnsPerPhase, 0), "turns", `${fmt(c.meanTurnLengthM * 1000, 1)} mm MTL`),
    metric("Flux per pole", fmt(c.fluxPerPoleWb * 1000, 3), "mWb", `${fmt(c.gapFlux, 2)} T gap`),
    metric("Electrical frequency", fmt(c.electricalHzAtRated, 0), "Hz", `at ${fmt(c.ratedSpeed, 0)} rpm`),
    metric("Peak copper loss", fmt(c.copperLossAtPeak, 0), "W", "short burst only"),
  ].join("");

  outputMetrics.innerHTML = [
    metric("Gear ratio", fmt(c.gearRatio, 2), ":1", `${fmt(c.gearEfficiency * 100, 0)}% efficient`),
    metric("Output continuous", fmt(c.outputContinuousTorque, 1), "Nm", "thermal estimate"),
    metric("Output peak", fmt(c.outputPeakTorque, 1), "Nm", "controller-limited"),
    metric("Output rated speed", fmt(c.outputRatedSpeedRpm, 0), "rpm", `${fmt(c.outputRatedSpeedRpm * 2 * Math.PI / 60, 1)} rad/s`),
    metric("Output no-load", fmt(c.outputNoLoadSpeedRpm, 0), "rpm", `${fmt(c.outputRadSec, 1)} rad/s`),
    metric("Planet teeth", c.planetTeeth === null ? "-" : fmt(c.planetTeeth, 1), "teeth", "must be integer"),
    metric("Peak output power", fmt(c.outputPeakTorque * c.outputRatedSpeedRpm * 2 * Math.PI / 60, 0), "W", "speed-limited ideal"),
    metric("Rated output power", fmt(c.outputContinuousTorque * c.outputRatedSpeedRpm * 2 * Math.PI / 60, 0), "W", "after efficiency"),
  ].join("");
}

function classifyOutput(c) {
  let label = "Light joint";
  let klass = "warn";
  if (c.outputPeakTorque >= 80 && c.outputRadSec >= 8) {
    label = "Leg-class";
    klass = "good";
  } else if (c.outputPeakTorque >= 35 && c.outputRadSec >= 6) {
    label = "Small leg / elbow";
    klass = "warn";
  } else if (c.outputPeakTorque < 15) {
    label = "Arm/wrist class";
    klass = "bad";
  }
  outputClass.textContent = label;
  outputClass.className = `mini-pill ${klass}`;
}

function renderWarnings(c) {
  const warnings = [];
  if (c.statorIdMm >= c.statorOdMm * 0.92) warnings.push("Stator bore is very large versus OD; tooth area may be too small.");
  if (c.poles % 2 !== 0) warnings.push("Rotor pole count should be even.");
  if (c.slots % 3 !== 0) warnings.push("Slot count should usually be divisible by 3 for a simple three-phase winding.");
  if (c.electricalHzAtRated > 1000) warnings.push("Electrical frequency is high; controller losses and encoder timing matter.");
  if (c.noLoadSpeed < c.ratedSpeed * 1.15) warnings.push("Voltage margin is tight for the rated speed target.");
  if (c.copperLossAtPeak > c.thermalWatts * 8) warnings.push("Peak current creates far more heat than the thermal budget; use only very short bursts.");
  if (c.planetTeeth !== null && Math.abs(c.planetTeeth - Math.round(c.planetTeeth)) > 0.001) warnings.push("Planet tooth count is not an integer. Ring-sun difference must be even.");
  if (c.gapFlux > 0.85) warnings.push("Airgap flux above 0.85 T is optimistic without detailed magnet/iron FEA.");

  warningBox.textContent = warnings.join(" ");
  warningBox.classList.toggle("visible", warnings.length > 0);

  const confidence = warnings.length === 0 ? ["Clean estimate", "good"] : warnings.length <= 2 ? ["Check assumptions", "warn"] : ["High uncertainty", "bad"];
  confidenceBadge.textContent = confidence[0];
  confidenceBadge.className = `status-pill ${confidence[1]}`;
}

function renderJoints(c) {
  const rows = jointTargets[robotClass.value];
  jointTable.innerHTML = rows.map(([name, peakReq, contReq, speedReq]) => {
    const peakRatio = c.outputPeakTorque / peakReq;
    const contRatio = c.outputContinuousTorque / contReq;
    const speedRatio = c.outputRadSec / speedReq;
    const score = Math.min(peakRatio, contRatio, speedRatio);
    const klass = score >= 1 ? "good" : score >= 0.7 ? "warn" : "bad";
    const text = score >= 1 ? "meets" : score >= 0.7 ? "close" : "short";
    return `
      <div class="joint-row">
        <div class="joint-name">${name}</div>
        ${bar("Peak", c.outputPeakTorque, peakReq, "Nm")}
        ${bar("Cont", c.outputContinuousTorque, contReq, "Nm")}
        ${bar("Speed", c.outputRadSec, speedReq, "rad/s")}
        <div class="match ${klass}">${text}</div>
      </div>
    `;
  }).join("");
}

function bar(label, actual, target, unit) {
  const ratio = target > 0 ? actual / target : 0;
  const width = clamp(ratio * 100, 0, 140);
  const klass = ratio >= 1 ? "good" : ratio >= 0.7 ? "warn" : "bad";
  return `
    <div class="bar-block">
      <div class="bar-label"><span>${label}</span><span>${fmt(actual, 1)} / ${fmt(target, 1)} ${unit}</span></div>
      <div class="track"><div class="fill ${klass}" style="width:${width}%"></div></div>
    </div>
  `;
}

function render() {
  const c = calc();
  slotPoleLabel.textContent = `${c.slots} slots / ${c.poles} poles`;
  ratioLabel.textContent = `${fmt(c.gearRatio, 2)}:1`;
  drawMotor(c);
  drawGear(c);
  renderMetrics(c);
  classifyOutput(c);
  renderWarnings(c);
  renderJoints(c);
}

function setPreset10012() {
  const values = {
    statorOd: 100,
    statorId: 78,
    stackHeight: 12,
    slots: 36,
    poles: 42,
    voltage: 48,
    turns: 18,
    parallelPaths: 1,
    wireDiameter: 0.65,
    strands: 2,
    windingFactor: 0.93,
    endTurnFactor: 1.6,
    gapFlux: 0.65,
    magnetArc: 0.72,
    thermalWatts: 40,
    peakCurrent: 30,
    ratedSpeed: 1000,
    windingTemp: 120,
    sunTeeth: 34,
    ringTeeth: 68,
    planetCount: 3,
    customRatio: 10,
    gearEfficiency: 0.85,
  };
  Object.entries(values).forEach(([key, value]) => {
    els[key].value = value;
  });
  state.gearMode = "planetary";
  updateGearModeButtons();
  render();
}

function updateGearModeButtons() {
  document.querySelectorAll(".seg").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === state.gearMode);
  });
  planetaryInputs.classList.toggle("hidden", state.gearMode !== "planetary");
  customInputs.classList.toggle("hidden", state.gearMode !== "custom");
}

ids.forEach((id) => {
  els[id].addEventListener("input", render);
});

robotClass.addEventListener("change", render);

document.querySelectorAll(".seg").forEach((button) => {
  button.addEventListener("click", () => {
    state.gearMode = button.dataset.mode;
    updateGearModeButtons();
    render();
  });
});

document.getElementById("preset10012").addEventListener("click", setPreset10012);

updateGearModeButtons();
render();
