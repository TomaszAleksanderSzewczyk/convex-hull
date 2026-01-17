import { Point, HullResult, HullType } from './types';

/**
 * Calculate cross product of vectors OA and OB
 * Returns positive if counter-clockwise, negative if clockwise, 0 if collinear
 */
export function crossProduct(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

/**
 * Check if two points are equal
 */
function pointsEqual(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

/**
 * Remove duplicate points from array
 */
export function removeDuplicates(points: Point[]): Point[] {
  const unique: Point[] = [];
  for (const p of points) {
    if (!unique.some(u => pointsEqual(u, p))) {
      unique.push(p);
    }
  }
  return unique;
}

/**
 * Check if all points are collinear
 */
export function areCollinear(points: Point[]): boolean {
  if (points.length < 3) return true;

  for (let i = 2; i < points.length; i++) {
    if (crossProduct(points[0], points[1], points[i]) !== 0) {
      return false;
    }
  }
  return true;
}

/**
 * Get the two extreme points of collinear points (for segment)
 */
function getSegmentEndpoints(points: Point[]): Point[] {
  if (points.length <= 1) return points;

  // Find the two points that are farthest apart
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

  // Return in order (lower y first, then lower x)
  if (p1.y < p2.y || (p1.y === p2.y && p1.x < p2.x)) {
    return [p1, p2];
  }
  return [p2, p1];
}

/**
 * Gift Wrapping (Jarvis March) algorithm for convex hull
 */
function giftWrap(points: Point[]): Point[] {
  const n = points.length;
  if (n < 3) return points;

  // Find the starting point (lowest y, tie-break by lowest x)
  let start = 0;
  for (let i = 1; i < n; i++) {
    if (points[i].y < points[start].y ||
        (points[i].y === points[start].y && points[i].x < points[start].x)) {
      start = i;
    }
  }

  const hull: Point[] = [];
  let current = start;

  do {
    hull.push(points[current]);
    let next = 0;

    for (let i = 1; i < n; i++) {
      if (next === current) {
        next = i;
        continue;
      }

      const cross = crossProduct(points[current], points[next], points[i]);

      // If i is more counter-clockwise than next, or collinear but farther
      if (cross < 0) {
        next = i;
      } else if (cross === 0) {
        // Collinear - take the one farther from current
        const distNext = (points[next].x - points[current].x) ** 2 +
                        (points[next].y - points[current].y) ** 2;
        const distI = (points[i].x - points[current].x) ** 2 +
                     (points[i].y - points[current].y) ** 2;
        if (distI > distNext) {
          next = i;
        }
      }
    }

    current = next;
  } while (current !== start && hull.length < n);

  return hull;
}

/**
 * Determine hull type based on number of vertices
 */
function getHullType(vertexCount: number): HullType {
  switch (vertexCount) {
    case 1: return 'point';
    case 2: return 'segment';
    case 3: return 'triangle';
    default: return 'quadrilateral';
  }
}

/**
 * Main function to compute convex hull of 4 points
 */
export function convexHull(points: Point[]): HullResult {
  // Remove duplicate points
  const unique = removeDuplicates(points);

  // Handle degenerate cases
  if (unique.length === 0) {
    return { type: 'point', vertices: [] };
  }

  if (unique.length === 1) {
    return { type: 'point', vertices: unique };
  }

  if (unique.length === 2) {
    return { type: 'segment', vertices: getSegmentEndpoints(unique) };
  }

  // Check if all points are collinear
  if (areCollinear(unique)) {
    return { type: 'segment', vertices: getSegmentEndpoints(unique) };
  }

  // Compute convex hull using gift wrapping
  const hull = giftWrap(unique);

  return {
    type: getHullType(hull.length),
    vertices: hull
  };
}
