"use client";

import Matter from "matter-js";
import { useEffect, useRef, type RefObject } from "react";
import {
  CHARACTER_IDS,
  CHARACTERS,
  EMPTY_PROBABILITIES,
  type CharacterId,
  type Probabilities,
} from "@/lib/characters";

const CAT_WALL = 0x0001;
const CAT_GIF = 0x0002;
const CAT_MAGNETIZED = 0x0004;

const SPRING_STIFFNESS = 0.028;
const SPRING_DAMPING = 0.48;
const MAX_SPRING_ACCELERATION = 7;
const PHYSICS_STEP_MS = 1000 / 60;
const SMOOTHING_MS = 550;
const RESTING_SCALE = 0.65;
const MAGNETIZED_SCALE = 1.15;
const COLLISION_SCALE = 0.74;
const MAGNET_GAP = 40;

const GIFS = CHARACTER_IDS.flatMap((id) =>
  CHARACTERS[id].gifs.map((src, index) => ({ id, src, key: `${id}-${index}` })),
);

type GifPileProps = {
  targetsRef: RefObject<Probabilities>;
  magnetRef: RefObject<HTMLElement | null>;
};

type DragStart = (
  index: number,
  clientX: number,
  clientY: number,
  pointerId: number,
) => void;

export function GifPile({ targetsRef, magnetRef }: GifPileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const startDragRef = useRef<DragStart | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { Engine, Bodies, Body, Composite, Constraint, Vector } = Matter;
    const engine = Engine.create({ gravity: { x: 0, y: 1, scale: 0.001 } });
    const world = engine.world;

    let width = container.clientWidth;
    let height = container.clientHeight;
    const originalSize = Math.round(
      Math.max(72, Math.min(150, Math.min(width, height) * 0.15)),
    );
    const size = originalSize * RESTING_SCALE;
    const collisionSize = size * COLLISION_SCALE;
    container.style.setProperty("--gif-size", `${size}px`);

    const wallThickness = 400;
    const wallOptions = {
      isStatic: true,
      collisionFilter: { category: CAT_WALL, mask: CAT_GIF | CAT_MAGNETIZED },
    };
    let walls: Matter.Body[] = [];
    const buildWalls = () => {
      Composite.remove(world, walls);
      walls = [
        Bodies.rectangle(
          width / 2,
          height - (size - collisionSize) / 2 + wallThickness / 2,
          width * 3,
          wallThickness,
          wallOptions,
        ),
        Bodies.rectangle(
          -wallThickness / 2,
          -height,
          wallThickness,
          height * 6,
          wallOptions,
        ),
        Bodies.rectangle(
          width + wallThickness / 2,
          -height,
          wallThickness,
          height * 6,
          wallOptions,
        ),
      ];
      Composite.add(world, walls);
    };
    buildWalls();

    let magnetBounds = {
      left: width / 2,
      right: width / 2,
      bottom: height / 2,
    };
    const updateMagnetBounds = () => {
      const el = magnetRef.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      const origin = container.getBoundingClientRect();
      magnetBounds = {
        left: box.left - origin.left,
        right: box.right - origin.left,
        bottom: box.bottom - origin.top,
      };
    };
    updateMagnetBounds();

    const dropOrder = GIFS.map((_, i) => i).sort(() => Math.random() - 0.5);
    const magnetSlots = GIFS.map((gif) => {
      const siblings = GIFS.filter((other) => other.id === gif.id);
      return {
        index: siblings.findIndex((other) => other.key === gif.key),
        count: siblings.length,
      };
    });
    // Give each GIF a stable personality instead of assigning random targets
    // every frame, which would make the springs jitter.
    const magnetStyles = GIFS.map(() => ({
      offsetX: Math.random() - 0.5,
      offsetY: Math.random() - 0.5,
      tilt: (Math.random() - 0.5) * 0.6,
      scale: 0.88 + Math.random() * 0.24,
      phase: Math.random() * Math.PI * 2,
      speed: 0.7 + Math.random() * 0.6,
    }));
    const bodies = GIFS.map((_, i) => {
      const slot = dropOrder.indexOf(i);
      const fallSpace = Math.max(0, height - magnetBounds.bottom - size);
      return Bodies.rectangle(
        size / 2 + Math.random() * Math.max(1, width - size),
        magnetBounds.bottom +
          size / 2 +
          8 +
          (slot / GIFS.length) * fallSpace * 0.45,
        collisionSize,
        collisionSize,
        {
          chamfer: { radius: collisionSize * 0.14 },
          restitution: 0.12,
          friction: 0.75,
          frictionStatic: 0.8,
          frictionAir: 0.03,
          angle: (Math.random() - 0.5) * 0.8,
          collisionFilter: { category: CAT_GIF, mask: CAT_WALL | CAT_GIF },
        },
      );
    });
    Composite.add(world, bodies);

    const toLocal = (clientX: number, clientY: number) => {
      const origin = container.getBoundingClientRect();
      return { x: clientX - origin.left, y: clientY - origin.top };
    };

    let drag: {
      constraint: Matter.Constraint;
      pointerId: number;
      body: Matter.Body;
    } | null = null;
    const endDrag = () => {
      if (!drag) return;
      Composite.remove(world, drag.constraint);
      drag = null;
    };
    startDragRef.current = (index, clientX, clientY, pointerId) => {
      endDrag();
      const body = bodies[index];
      const point = toLocal(clientX, clientY);
      const constraint = Constraint.create({
        pointA: point,
        bodyB: body,
        pointB: Vector.rotate(Vector.sub(point, body.position), -body.angle),
        stiffness: 0.08,
        damping: 0.1,
        length: 0,
      });
      Composite.add(world, constraint);
      drag = { constraint, pointerId, body };
    };
    const onPointerMove = (event: PointerEvent) => {
      if (drag && event.pointerId === drag.pointerId) {
        drag.constraint.pointA = toLocal(event.clientX, event.clientY);
      }
    };
    const onPointerUp = (event: PointerEvent) => {
      if (drag && event.pointerId === drag.pointerId) endDrag();
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    const resizeObserver = new ResizeObserver(() => {
      width = container.clientWidth;
      height = container.clientHeight;
      buildWalls();
      updateMagnetBounds();
      for (const body of bodies) {
        const x = Math.min(
          Math.max(body.position.x, size / 2),
          width - size / 2,
        );
        if (x !== body.position.x)
          Body.setPosition(body, { x, y: body.position.y });
      }
    });
    resizeObserver.observe(container);
    if (magnetRef.current) resizeObserver.observe(magnetRef.current);

    const current: Record<CharacterId, number> = { ...EMPTY_PROBABILITIES };
    const bodyScales = GIFS.map(() => 1);
    const gravity = engine.gravity.scale * engine.gravity.y;
    let frame = 0;
    let last = performance.now();
    let elapsed = 0;
    let activeWinner: CharacterId | null = null;
    const magnetOrigins = bodies.map((body) => ({ ...body.position }));

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      elapsed = Math.min(elapsed + dt, PHYSICS_STEP_MS * 3);

      const targets = targetsRef.current ?? EMPTY_PROBABILITIES;
      const blend = 1 - Math.exp(-dt / SMOOTHING_MS);
      for (const id of CHARACTER_IDS) {
        current[id] += (targets[id] - current[id]) * blend;
      }
      const topId = CHARACTER_IDS.reduce((best, id) =>
        targets[id] > targets[best] ? id : best,
      );
      const winner = targets[topId] > 0 ? topId : null;
      if (winner !== activeWinner) {
        activeWinner = winner;
        if (winner) {
          bodies.forEach((body, i) => {
            if (GIFS[i].id === winner) {
              magnetOrigins[i] = { ...body.position };
            }
          });
        }
      }
      const winnerPull = winner ? Math.min(1, Math.max(0, current[winner])) : 0;
      const magnetWidth = magnetBounds.right - magnetBounds.left;
      const magnetSize = size * (MAGNETIZED_SCALE / RESTING_SCALE);

      bodies.forEach((body, i) => {
        const pull = GIFS[i].id === winner ? winnerPull : 0;
        const style = magnetStyles[i];
        const targetScale =
          (1 + (MAGNETIZED_SCALE / RESTING_SCALE - 1) * pull) *
          (1 + (style.scale - 1) * pull);
        const visualScale =
          bodyScales[i] +
          (targetScale - bodyScales[i]) * (1 - Math.exp(-dt / 120));
        if (Math.abs(visualScale - bodyScales[i]) > 0.001) {
          Body.scale(
            body,
            visualScale / bodyScales[i],
            visualScale / bodyScales[i],
          );
          bodyScales[i] = visualScale;
        }
        const freeMoving =
          pull > 0.1 || drag?.body === body || bodyScales[i] > 1.08;
        body.collisionFilter.category = freeMoving ? CAT_MAGNETIZED : CAT_GIF;
        body.collisionFilter.mask = freeMoving ? CAT_WALL : CAT_WALL | CAT_GIF;
        if (pull > 0 && drag?.body !== body) {
          const halfSize = (size * visualScale) / 2;
          const rotatedHalfHeight =
            halfSize *
            (Math.abs(Math.sin(body.angle)) + Math.abs(Math.cos(body.angle)));
          const { index, count } = magnetSlots[i];
          const maxColumns = Math.max(
            2,
            Math.floor(magnetWidth / (magnetSize * 0.9)),
          );
          const columns =
            maxColumns >= count
              ? count
              : Math.min(maxColumns, Math.ceil(count / 2));
          const rows = Math.ceil(count / columns);
          const row = Math.floor(index / columns);
          const rowCount = Math.min(columns, count - row * columns);
          const column = index % columns;
          const sway = Math.sin((now / 1000) * style.speed + style.phase);
          const finalX =
            magnetBounds.left +
            magnetWidth * ((column + 0.5) / rowCount) +
            style.offsetX * (magnetWidth / rowCount) * 0.55 +
            sway * magnetSize * 0.045;
          const targetX = Math.min(
            width - halfSize,
            Math.max(
              halfSize,
              magnetOrigins[i].x + (finalX - magnetOrigins[i].x) * pull,
            ),
          );
          const highestY = magnetBounds.bottom + MAGNET_GAP + rotatedHalfHeight;
          const rowSpacing = Math.min(
            magnetSize * 0.82,
            Math.max(0, (height - highestY - halfSize) / Math.max(1, rows)),
          );
          const topY =
            highestY + row * rowSpacing + style.offsetY * magnetSize * 0.6;
          const targetY = Math.min(
            height - halfSize,
            Math.max(
              highestY,
              magnetOrigins[i].y +
                (topY - magnetOrigins[i].y) * pull +
                Math.cos((now / 1000) * style.speed + style.phase) *
                  magnetSize *
                  0.055 *
                  pull,
            ),
          );
          const dx = targetX - body.position.x;
          const dy = targetY - body.position.y;
          const springStrength = Math.min(1, 0.35 + pull * 1.3);
          // Matter velocities are pixels per physics step. A damped spring
          // loses force as it nears the target instead of overshooting it.
          const accelerationX =
            (dx * SPRING_STIFFNESS - body.velocity.x * SPRING_DAMPING) *
            springStrength;
          const accelerationY =
            (dy * SPRING_STIFFNESS - body.velocity.y * SPRING_DAMPING) *
            springStrength;
          const acceleration = Math.hypot(accelerationX, accelerationY);
          const limit =
            acceleration > MAX_SPRING_ACCELERATION
              ? MAX_SPRING_ACCELERATION / acceleration
              : 1;
          Body.applyForce(body, body.position, {
            x: (body.mass * accelerationX * limit) / PHYSICS_STEP_MS ** 2,
            y:
              (body.mass * accelerationY * limit) / PHYSICS_STEP_MS ** 2 -
              body.mass * gravity * springStrength,
          });
          if (pull > 0.1) {
            const targetAngle =
              style.tilt +
              Math.sin((now / 1000) * style.speed + style.phase) * 0.045;
            const angleError = Math.atan2(
              Math.sin(body.angle - targetAngle),
              Math.cos(body.angle - targetAngle),
            );
            Body.setAngularVelocity(
              body,
              body.angularVelocity * (1 - 0.14 * pull) -
                angleError * 0.018 * pull,
            );
          }
        }
        body.frictionAir = 0.03 + 0.075 * pull;
      });

      while (elapsed >= PHYSICS_STEP_MS) {
        Engine.update(engine, PHYSICS_STEP_MS);
        elapsed -= PHYSICS_STEP_MS;
      }

      bodies.forEach((body, i) => {
        const pull = GIFS[i].id === winner ? winnerPull : 0;
        if (pull > 0) {
          const halfSize = (size * bodyScales[i]) / 2;
          const rotatedHalfHeight =
            halfSize *
            (Math.abs(Math.sin(body.angle)) + Math.abs(Math.cos(body.angle)));
          const minY = magnetBounds.bottom + MAGNET_GAP + rotatedHalfHeight;
          if (body.position.y < minY) {
            Body.setPosition(body, { x: body.position.x, y: minY });
            if (body.velocity.y < 0) {
              Body.setVelocity(body, { x: body.velocity.x, y: 0 });
            }
          }
        }
        const el = itemRefs.current[i];
        if (!el) return;
        el.style.transform = `translate3d(${body.position.x - size / 2}px, ${body.position.y - size / 2}px, 0) rotate(${body.angle}rad) scale(${bodyScales[i]})`;
        el.style.zIndex = String(1 + Math.round(pull * 20));
        el.style.boxShadow = `0 0 0 ${(pull * 10).toFixed(1)}px var(--primary), 0 6px 0 var(--foreground)`;
      });

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      startDragRef.current = null;
      Composite.clear(world, false);
      Engine.clear(engine);
    };
  }, [targetsRef, magnetRef]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
    >
      {GIFS.map((gif, i) => (
        <div
          key={gif.key}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          onPointerDown={(event) => {
            event.preventDefault();
            startDragRef.current?.(
              i,
              event.clientX,
              event.clientY,
              event.pointerId,
            );
          }}
          className="absolute top-0 left-0 cursor-grab touch-none overflow-hidden rounded-2xl border-4 border-card bg-card select-none will-change-transform active:cursor-grabbing"
          style={{
            width: "var(--gif-size)",
            height: "var(--gif-size)",
            transform: "translate3d(-9999px, 0, 0)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- animated GIFs from Giphy */}
          <img
            src={gif.src}
            alt=""
            draggable={false}
            className="pointer-events-none size-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
