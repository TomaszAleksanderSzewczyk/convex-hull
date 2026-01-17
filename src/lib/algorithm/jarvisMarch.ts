/**
 * ============================================================================
 * JARVIS MARCH (GIFT WRAPPING) ALGORITHM
 * ============================================================================
 *
 * Algorithm for computing the convex hull of a set of points on a plane.
 *
 * Complexity: O(nh), where n = number of points, h = number of hull vertices
 *
 * How it works:
 * 1. Find starting point P₁ (lowest y, tie-break by lowest x)
 * 2. From current point, find the rightmost point (smallest angle)
 * 3. Repeat until returning to the starting point
 *
 * Result: hull points in counter-clockwise order
 *
 * @see https://en.wikipedia.org/wiki/Gift_wrapping_algorithm
 * ============================================================================
 */

import { Point } from '../types';

/**
 * Cross product of vectors OA and OB
 * @returns > 0: left turn (CCW), < 0: right turn (CW), = 0: collinear
 */
function crossProduct(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

/**
 * Squared distance between two points
 */
function distanceSquared(a: Point, b: Point): number {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

/**
 * Jarvis March - main algorithm function
 *
 * @param points - array of points (min 3, no duplicates, not collinear)
 * @returns convex hull vertices in CCW order
 */
export function jarvisMarch(points: Point[]): Point[] {
  const n = points.length;
  if (n < 3) return points;

  // STEP 1: Find starting point (lowest y, tie-break: lowest x)
  let startIndex = 0;
  for (let i = 1; i < n; i++) {
    if (points[i].y < points[startIndex].y ||
        (points[i].y === points[startIndex].y && points[i].x < points[startIndex].x)) {
      startIndex = i;
    }
  }

  const hull: Point[] = [];
  let currentIndex = startIndex;

  // STEP 2: Gift wrapping - find successive hull points
  do {
    hull.push(points[currentIndex]);
    let nextIndex = 0;

    for (let i = 0; i < n; i++) {
      if (i === currentIndex) continue;

      if (nextIndex === currentIndex) {
        nextIndex = i;
        continue;
      }

      const cross = crossProduct(points[currentIndex], points[nextIndex], points[i]);

      // If point i is more counterclockwise than next, select i
      if (cross > 0) {
        nextIndex = i;
      }
      // If points are collinear, select the farther one
      else if (cross === 0) {
        if (distanceSquared(points[currentIndex], points[i]) >
            distanceSquared(points[currentIndex], points[nextIndex])) {
          nextIndex = i;
        }
      }
    }

    currentIndex = nextIndex;
  } while (currentIndex !== startIndex && hull.length < n);

  return hull;
}
