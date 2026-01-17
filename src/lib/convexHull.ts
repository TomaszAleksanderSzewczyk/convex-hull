/**
 * Convex Hull - main module
 *
 * Uses Jarvis March (Gift Wrapping) algorithm
 * @see ./algorithm/jarvisMarch.ts
 */

import { Point, HullResult, HullType } from './types';
import { jarvisMarch } from './algorithm/jarvisMarch';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function pointsEqual(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

function removeDuplicates(points: Point[]): Point[] {
  const unique: Point[] = [];
  for (const p of points) {
    if (!unique.some(u => pointsEqual(u, p))) {
      unique.push(p);
    }
  }
  return unique;
}

function crossProduct(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function areCollinear(points: Point[]): boolean {
  if (points.length < 3) return true;
  for (let i = 2; i < points.length; i++) {
    if (crossProduct(points[0], points[1], points[i]) !== 0) {
      return false;
    }
  }
  return true;
}

function getSegmentEndpoints(points: Point[]): Point[] {
  if (points.length <= 1) return points;

  let maxDist = -1;
  let p1 = points[0];
  let p2 = points[0];

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dist = (points[i].x - points[j].x) ** 2 + (points[i].y - points[j].y) ** 2;
      if (dist > maxDist) {
        maxDist = dist;
        p1 = points[i];
        p2 = points[j];
      }
    }
  }

  if (p1.y < p2.y || (p1.y === p2.y && p1.x < p2.x)) {
    return [p1, p2];
  }
  return [p2, p1];
}

function getHullType(vertexCount: number): HullType {
  switch (vertexCount) {
    case 1: return 'point';
    case 2: return 'segment';
    case 3: return 'triangle';
    default: return 'quadrilateral';
  }
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Computes the convex hull for a set of points
 */
export function convexHull(points: Point[]): HullResult {
  const unique = removeDuplicates(points);

  // Degenerate cases
  if (unique.length === 0) {
    return { type: 'point', vertices: [] };
  }

  if (unique.length === 1) {
    return { type: 'point', vertices: unique };
  }

  if (unique.length === 2) {
    return { type: 'segment', vertices: getSegmentEndpoints(unique) };
  }

  if (areCollinear(unique)) {
    return { type: 'segment', vertices: getSegmentEndpoints(unique) };
  }

  // Jarvis March algorithm
  const hull = jarvisMarch(unique);

  return {
    type: getHullType(hull.length),
    vertices: hull
  };
}
