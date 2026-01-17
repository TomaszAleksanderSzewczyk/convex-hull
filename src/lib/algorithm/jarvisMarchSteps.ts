/**
 * ============================================================================
 * JARVIS MARCH - STEP-BY-STEP VERSION FOR VISUALIZATION
 * ============================================================================
 *
 * Generates all intermediate steps of the algorithm for animation purposes.
 * ============================================================================
 */

import { Point, AlgorithmStep } from '../types';

function crossProduct(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function distanceSquared(a: Point, b: Point): number {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

/**
 * Generates all steps of Jarvis March algorithm for visualization
 */
export function jarvisMarchWithSteps(points: Point[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const n = points.length;

  if (n < 3) {
    steps.push({
      type: 'complete',
      description: 'Not enough points for convex hull',
      currentPoint: null,
      candidatePoint: null,
      checkingPoint: null,
      hullSoFar: points,
      highlightLine: null,
    });
    return steps;
  }

  // STEP 1: Find starting point
  let startIndex = 0;
  for (let i = 1; i < n; i++) {
    if (points[i].y < points[startIndex].y ||
        (points[i].y === points[startIndex].y && points[i].x < points[startIndex].x)) {
      startIndex = i;
    }
  }

  steps.push({
    type: 'start',
    description: `Starting point found: lowest Y coordinate (P${startIndex + 1})`,
    currentPoint: points[startIndex],
    candidatePoint: null,
    checkingPoint: null,
    hullSoFar: [],
    highlightLine: null,
  });

  const hull: Point[] = [];
  let currentIndex = startIndex;

  // STEP 2: Gift wrapping
  do {
    hull.push(points[currentIndex]);

    steps.push({
      type: 'found',
      description: `Added P${currentIndex + 1} to hull`,
      currentPoint: points[currentIndex],
      candidatePoint: null,
      checkingPoint: null,
      hullSoFar: [...hull],
      highlightLine: null,
    });

    let nextIndex = 0;

    // Check all points to find the most counterclockwise
    for (let i = 0; i < n; i++) {
      if (i === currentIndex) continue;
      if (nextIndex === currentIndex) {
        nextIndex = i;
        continue;
      }

      steps.push({
        type: 'checking',
        description: `From P${currentIndex + 1}: checking P${i + 1} against candidate P${nextIndex + 1}`,
        currentPoint: points[currentIndex],
        candidatePoint: points[nextIndex],
        checkingPoint: points[i],
        hullSoFar: [...hull],
        highlightLine: [points[currentIndex], points[i]],
      });

      const cross = crossProduct(points[currentIndex], points[nextIndex], points[i]);

      if (cross > 0) {
        nextIndex = i;
        steps.push({
          type: 'checking',
          description: `P${i + 1} is more counterclockwise - new candidate`,
          currentPoint: points[currentIndex],
          candidatePoint: points[nextIndex],
          checkingPoint: null,
          hullSoFar: [...hull],
          highlightLine: [points[currentIndex], points[nextIndex]],
        });
      } else if (cross === 0) {
        if (distanceSquared(points[currentIndex], points[i]) >
            distanceSquared(points[currentIndex], points[nextIndex])) {
          nextIndex = i;
          steps.push({
            type: 'checking',
            description: `P${i + 1} is collinear but farther - new candidate`,
            currentPoint: points[currentIndex],
            candidatePoint: points[nextIndex],
            checkingPoint: null,
            hullSoFar: [...hull],
            highlightLine: [points[currentIndex], points[nextIndex]],
          });
        }
      }
    }

    currentIndex = nextIndex;
  } while (currentIndex !== startIndex && hull.length < n);

  steps.push({
    type: 'complete',
    description: `Convex hull complete with ${hull.length} vertices`,
    currentPoint: null,
    candidatePoint: null,
    checkingPoint: null,
    hullSoFar: hull,
    highlightLine: null,
  });

  return steps;
}
