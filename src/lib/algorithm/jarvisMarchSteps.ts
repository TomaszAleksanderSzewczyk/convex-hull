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
  let isFirstPoint = true;
  do {
    hull.push(points[currentIndex]);

    const reason = isFirstPoint
      ? `(starting point - has lowest Y coordinate)`
      : `(most counterclockwise from previous point)`;

    steps.push({
      type: 'found',
      description: `Added P${currentIndex + 1} to hull ${reason}`,
      currentPoint: points[currentIndex],
      candidatePoint: null,
      checkingPoint: null,
      hullSoFar: [...hull],
      highlightLine: null,
    });

    isFirstPoint = false;

    // Initialize nextIndex to first point that isn't currentIndex
    let nextIndex = (currentIndex + 1) % n;

    const arrayOrder = points.map((_, i) => `P${i + 1}`).join('→');
    steps.push({
      type: 'checking',
      description: `From P${currentIndex + 1}: picking P${nextIndex + 1} as initial candidate (next in array: ${arrayOrder})`,
      currentPoint: points[currentIndex],
      candidatePoint: points[nextIndex],
      checkingPoint: null,
      hullSoFar: [...hull],
      highlightLine: [points[currentIndex], points[nextIndex]],
    });

    // Check all points to find the most counterclockwise
    for (let i = 0; i < n; i++) {
      if (i === currentIndex || i === nextIndex) continue;

      steps.push({
        type: 'checking',
        description: `From P${currentIndex + 1}: comparing candidate P${nextIndex + 1} against P${i + 1}`,
        currentPoint: points[currentIndex],
        candidatePoint: points[nextIndex],
        checkingPoint: points[i],
        hullSoFar: [...hull],
        highlightLine: [points[currentIndex], points[i]],
      });

      const cross = crossProduct(points[currentIndex], points[nextIndex], points[i]);
      const oldCandidateIndex = nextIndex;

      if (cross > 0) {
        nextIndex = i;
        steps.push({
          type: 'found',
          description: `P${i + 1} is more counterclockwise than P${oldCandidateIndex + 1} - P${i + 1} is new candidate!`,
          currentPoint: points[currentIndex],
          candidatePoint: points[nextIndex],
          checkingPoint: points[i],
          hullSoFar: [...hull],
          highlightLine: [points[currentIndex], points[nextIndex]],
        });
      } else if (cross === 0) {
        if (distanceSquared(points[currentIndex], points[i]) >
            distanceSquared(points[currentIndex], points[nextIndex])) {
          nextIndex = i;
          steps.push({
            type: 'found',
            description: `P${i + 1} is collinear with P${oldCandidateIndex + 1} but farther - P${i + 1} is new candidate!`,
            currentPoint: points[currentIndex],
            candidatePoint: points[nextIndex],
            checkingPoint: points[i],
            hullSoFar: [...hull],
            highlightLine: [points[currentIndex], points[nextIndex]],
          });
        } else {
          steps.push({
            type: 'checking',
            description: `P${i + 1} is collinear with P${nextIndex + 1} but closer - keeping P${nextIndex + 1}`,
            currentPoint: points[currentIndex],
            candidatePoint: points[nextIndex],
            checkingPoint: points[i],
            hullSoFar: [...hull],
            highlightLine: [points[currentIndex], points[nextIndex]],
          });
        }
      } else {
        steps.push({
          type: 'checking',
          description: `P${i + 1} is more clockwise than P${nextIndex + 1} - keeping P${nextIndex + 1}`,
          currentPoint: points[currentIndex],
          candidatePoint: points[nextIndex],
          checkingPoint: points[i],
          hullSoFar: [...hull],
          highlightLine: [points[currentIndex], points[nextIndex]],
        });
      }
    }

    currentIndex = nextIndex;
  } while (currentIndex !== startIndex && hull.length < n);

  const hullTypes: Record<number, string> = {
    1: 'Point',
    2: 'Segment',
    3: 'Triangle',
    4: 'Quadrilateral',
  };
  const hullType = hullTypes[hull.length] || `${hull.length}-gon`;

  steps.push({
    type: 'complete',
    description: `Convex hull complete: ${hullType} with ${hull.length} vertices`,
    currentPoint: null,
    candidatePoint: null,
    checkingPoint: null,
    hullSoFar: hull,
    highlightLine: null,
  });

  return steps;
}
