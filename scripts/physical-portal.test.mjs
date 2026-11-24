import assert from 'node:assert/strict';
import test from 'node:test';
import { getMakingOfGeometry } from '../src/components/making-of/galleryGeometry.js';
import { PortalPhysics, presets } from '../src/components/physical-portal/physics.js';
import { PortalTransitionMachine } from '../src/components/physical-portal/TransitionMachine.js';
import { PhysicsController, PORTAL_FIXED_STEP } from '../src/components/physical-portal/PhysicsController.js';

test('making-of geometry preserves the desktop canvas center and radius', () => {
  const geometry = getMakingOfGeometry(1440, 900);
  assert.equal(geometry.width, 1440);
  assert.equal(geometry.height, 900);
  assert.equal(geometry.centerX, 720);
  assert.ok(Math.abs(geometry.radius - 333) < 1e-9);
  assert.ok(Math.abs(geometry.centerY - 459) < 1e-9);
  assert.ok(Math.abs(geometry.distance - 1498.5) < 1e-9);
});

test('making-of geometry preserves the narrow-screen canvas center and radius', () => {
  const geometry = getMakingOfGeometry(390, 844);
  assert.equal(geometry.width, 390);
  assert.equal(geometry.height, 844);
  assert.equal(geometry.centerX, 195);
  assert.ok(Math.abs(geometry.radius - 140.4) < 1e-9);
  assert.ok(Math.abs(geometry.centerY - 447.32) < 1e-9);
  assert.ok(Math.abs(geometry.distance - 631.8) < 1e-9);
});

test('source material presets keep their impact trajectories and settle into the portal', () => {
  const trajectories = {};
  for (const material of Object.keys(presets)) {
    const impacts = [];
    const physics = new PortalPhysics(800, 440, (speed) => impacts.push(speed));
    physics.material = material;
    physics.e = presets[material].e;
    physics.launch();
    for (let index = 0; index < 1200; index += 1) physics.step(1 / 240);

    assert.equal(physics.state, 'inside');
    assert.ok(impacts.length >= 2);
    assert.ok(impacts.every((speed, index) => index === 0 || speed < impacts[index - 1]));
    assert.equal(physics.x, 400);
    physics.exit();
    for (let index = 0; index < 250; index += 1) physics.step(1 / 240);
    assert.equal(physics.state, 'idle');
    trajectories[material] = impacts.map(Math.round);
  }
  assert.deepEqual(trajectories, {
    soft: [678, 361, 202, 119, 68],
    glass: [678, 451, 317, 230, 170, 128, 97, 71, 53, 41],
    rubber: [678, 208, 65],
  });
});

test('custom portal geometry uses the real gallery target and trigger origin', () => {
  const physics = new PortalPhysics(1440, 900, () => {}, {
    origin: { x: 1384, y: 112, radius: 31 },
    destination: { x: 720, y: 459, radius: 333 },
  });
  physics.launch();
  for (let index = 0; index < 1200; index += 1) physics.step(1 / 240);

  assert.equal(physics.state, 'inside');
  assert.equal(physics.x, 720);
  assert.equal(physics.y, 459);
  assert.ok(Math.abs(physics.scale - 333 / 32) < 1e-9);
});

test('entry and return preserve the measured mobile bubble size', () => {
  const physics = new PortalPhysics(390, 844, () => {}, {
    origin: { x: 349, y: 82, radius: 28 },
    destination: { x: 195, y: 447.32, radius: 140.4 },
  });
  physics.launch();
  assert.equal(physics.scale, 28 / 32);
  for (let index = 0; index < 1200; index += 1) physics.step(1 / 240);
  assert.equal(physics.state, 'inside');
  physics.exit();
  for (let index = 0; index < 240; index += 1) physics.step(1 / 240);
  assert.equal(physics.state, 'idle');
  assert.equal(physics.scale, 28 / 32);
});

test('reduced motion skips entry and exit animation', () => {
  const physics = new PortalPhysics(400, 440);
  physics.launch(true);
  assert.equal(physics.state, 'inside');
  assert.equal(physics.reveal, 1);
  physics.exit(true);
  assert.equal(physics.state, 'idle');
  assert.equal(physics.reveal, 0);
});

test('transition machine guards repeated entry and supports normal return', () => {
  const phases = [];
  const machine = new PortalTransitionMachine((phase) => phases.push(phase));

  assert.equal(machine.startEntry(), true);
  assert.equal(machine.phase, 'launch');
  assert.equal(machine.startEntry(), false);
  assert.equal(machine.advance('expand'), true);
  assert.equal(machine.advance('inside'), true);
  assert.equal(machine.startExit(), true);
  assert.equal(machine.startExit(), false);
  assert.equal(machine.finishExit(), true);
  assert.equal(machine.phase, 'idle');
  assert.deepEqual(phases, ['launch', 'expand', 'inside', 'exit', 'idle']);
});

test('transition machine allows interrupted entry and browser-forward recovery', () => {
  const machine = new PortalTransitionMachine();
  assert.equal(machine.startEntry(), true);
  assert.equal(machine.startExit(), true);
  assert.equal(machine.finishExit(), true);

  assert.equal(machine.startEntry(), true);
  assert.equal(machine.advance('expand'), true);
  assert.equal(machine.startExit(true), true);
  assert.equal(machine.phase, 'idle');

  assert.equal(machine.startEntry(true), true);
  assert.equal(machine.phase, 'inside');
  assert.equal(machine.startExit(), true);
  assert.equal(machine.resumeInside(), true);
  assert.equal(machine.phase, 'inside');
});

test('physics controller accumulates fixed steps and clamps long frame gaps', () => {
  const steps = [];
  const phases = [];
  const physics = {
    state: 'launch',
    step(dt) {
      steps.push(dt);
      if (steps.length === 2) this.state = 'expand';
    },
  };
  const controller = new PhysicsController({
    physics,
    onPhaseChange: (phase) => phases.push(phase),
  });

  controller.advanceFrame(0);
  controller.advanceFrame(20);
  assert.equal(steps.length, 4);
  controller.advanceFrame(520);
  assert.equal(steps.length, 16);
  assert.ok(steps.every((dt) => dt === PORTAL_FIXED_STEP));
  assert.deepEqual(phases, ['expand']);
  controller.dispose();
});
