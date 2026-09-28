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

const SPRING_STIFFNESS = 0.012;
const SPRING_DAMPING = 0.24;
const MAX_SPRING_ACCELERATION = 4;
const PHYSICS_STEP_MS = 1000 / 60;
const SMOOTHING_MS = 260;
const RESTING_SCALE = 0.65;
const MAGNETIZED_SCALE = 1.15;
const COLLISION_SCALE = 0.78;
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
      collisionFilter: { category: CAT_WALL, mask: CAT_GIF },
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
    const magnetPoints = GIFS.map((gif) => {
      const siblings = GIFS.filter((other) => other.id === gif.id);
      const index = siblings.findIndex((other) => other.key === gif.key);
      return 0.18 + (index / Math.max(1, siblings.length - 1)) * 0.64;
    });
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
          restitution: 0.25,
          friction: 0.4,
          frictionAir: 0.015,
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

    let drag: { constraint: Matter.Constraint; pointerId: number } | null =
      null;
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
      drag = { constraint, pointerId };
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

    const tick = (now: number) => {
      const dt = Math.min(now - last, 1000 / 30);
      last = now;

      const targets = targetsRef.current ?? EMPTY_PROBABILITIES;
      const blend = 1 - Math.exp(-dt / SMOOTHING_MS);
      for (const id of CHARACTER_IDS) {
        current[id] += (targets[id] - current[id]) * blend;
      }

      bodies.forEach((body, i) => {
        const p = current[GIFS[i].id];
        const visualScale = 1 + (MAGNETIZED_SCALE / RESTING_SCALE - 1) * p;
        if (Math.abs(visualScale - bodyScales[i]) > 0.001) {
          Body.scale(
            body,
            visualScale / bodyScales[i],
            visualScale / bodyScales[i],
          );
          bodyScales[i] = visualScale;
        }
        if (p > 0.02) {
          const halfSize = (size * visualScale) / 2;
          const rotatedHalfHeight =
            halfSize *
            (Math.abs(Math.sin(body.angle)) + Math.abs(Math.cos(body.angle)));
          const targetX =
            magnetBounds.left +
            (magnetBounds.right - magnetBounds.left) * magnetPoints[i];
          const highestY = magnetBounds.bottom + MAGNET_GAP + rotatedHalfHeight;
          const dropRange = Math.max(
            0,
            Math.min(
              180,
              (height - magnetBounds.bottom) * 0.5,
              height - halfSize - highestY,
            ),
          );
          const targetY = highestY + dropRange * (1 - p);
          const dx = targetX - body.position.x;
          const dy = targetY - body.position.y;
          // Matter velocities are pixels per physics step. A damped spring
          // loses force as it nears the target instead of overshooting it.
          const accelerationX =
            (dx * SPRING_STIFFNESS - body.velocity.x * SPRING_DAMPING) * p;
          const accelerationY =
            (dy * SPRING_STIFFNESS - body.velocity.y * SPRING_DAMPING) * p;
          const acceleration = Math.hypot(accelerationX, accelerationY);
          const limit =
            acceleration > MAX_SPRING_ACCELERATION
              ? MAX_SPRING_ACCELERATION / acceleration
              : 1;
          Body.applyForce(body, body.position, {
            x: (body.mass * accelerationX * limit) / PHYSICS_STEP_MS ** 2,
            y:
              (body.mass * accelerationY * limit) / PHYSICS_STEP_MS ** 2 -
              body.mass * gravity * p,
          });
          if (p > 0.05) {
            const uprightAngle = Math.atan2(
              Math.sin(body.angle),
              Math.cos(body.angle),
            );
            Body.setAngularVelocity(
              body,
              body.angularVelocity * (1 - 0.14 * p) - uprightAngle * 0.018 * p,
            );
          }
        }
        body.frictionAir = 0.015 + 0.05 * p;
      });

      Engine.update(engine, dt);

      bodies.forEach((body, i) => {
        const p = current[GIFS[i].id];
        if (p > 0.02) {
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
        el.style.zIndex = String(1 + Math.round(p * 20));
        el.style.boxShadow = `0 0 0 ${(p * 10).toFixed(1)}px var(--primary), 0 6px 0 var(--foreground)`;
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
