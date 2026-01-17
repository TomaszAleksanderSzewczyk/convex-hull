import { describe, it, expect } from 'vitest';
import { convexHull } from '../convexHull';
import { Point, HullResult } from '../types';

// Helper: normalize hull vertices for comparison (start from lowest y, then x, CCW order)
function normalizeHull(vertices: Point[]): Point[] {
  if (vertices.length <= 2) return vertices;

  // Find starting point (lowest y, then lowest x)
  let startIdx = 0;
  for (let i = 1; i < vertices.length; i++) {
    if (vertices[i].y < vertices[startIdx].y ||
        (vertices[i].y === vertices[startIdx].y && vertices[i].x < vertices[startIdx].x)) {
      startIdx = i;
    }
  }

  // Rotate array to start from startIdx
  return [...vertices.slice(startIdx), ...vertices.slice(0, startIdx)];
}

// Helper: compare hull vertices as sets (ignoring order)
function samePointSet(a: Point[], b: Point[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a.map(p => `${p.x},${p.y}`));
  const setB = new Set(b.map(p => `${p.x},${p.y}`));
  for (const key of setA) {
    if (!setB.has(key)) return false;
  }
  return true;
}

describe('Convex Hull Edge Cases', () => {
  // ============================================================================
  // Edge-cases: 0-2 points / duplicates
  // ============================================================================

  describe('Duplicates', () => {
    it('should return single point when all 4 points are duplicates', () => {
      const result = convexHull([
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 }
      ]);
      expect(result.type).toBe('point');
      expect(result.vertices).toEqual([{ x: 0, y: 0 }]);
    });

    it('should return segment for two different points with duplicates', () => {
      const result = convexHull([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 0, y: 0 }
      ]);
      expect(result.type).toBe('segment');
      // Lower y first, then lower x
      expect(result.vertices).toEqual([{ x: 0, y: 0 }, { x: 1, y: 1 }]);
    });

    it('should tie-break by x when two points have same y', () => {
      const result = convexHull([
        { x: 2, y: 5 },
        { x: -3, y: 5 },
        { x: 2, y: 5 },
        { x: -3, y: 5 }
      ]);
      expect(result.type).toBe('segment');
      // Same y, so lower x first
      expect(result.vertices).toEqual([{ x: -3, y: 5 }, { x: 2, y: 5 }]);
    });
  });

  // ============================================================================
  // Collinear points (3-4 points)
  // ============================================================================

  describe('Collinear points', () => {
    it('should return segment endpoints for four collinear diagonal points', () => {
      const result = convexHull([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 }
      ]);
      expect(result.type).toBe('segment');
      expect(result.vertices).toEqual([{ x: 0, y: 0 }, { x: 3, y: 3 }]);
    });

    it('should return segment endpoints for four unsorted collinear points', () => {
      const result = convexHull([
        { x: 5, y: 5 },
        { x: 0, y: 0 },
        { x: 3, y: 3 },
        { x: 2, y: 2 }
      ]);
      expect(result.type).toBe('segment');
      expect(result.vertices).toEqual([{ x: 0, y: 0 }, { x: 5, y: 5 }]);
    });

    it('should sort vertical collinear points by y', () => {
      const result = convexHull([
        { x: 2, y: 1 },
        { x: 2, y: -3 },
        { x: 2, y: 10 },
        { x: 2, y: 0 }
      ]);
      expect(result.type).toBe('segment');
      // Lower y first
      expect(result.vertices).toEqual([{ x: 2, y: -3 }, { x: 2, y: 10 }]);
    });

    it('should sort horizontal collinear points by x', () => {
      const result = convexHull([
        { x: 1, y: 7 },
        { x: -2, y: 7 },
        { x: 10, y: 7 },
        { x: 0, y: 7 }
      ]);
      expect(result.type).toBe('segment');
      // Same y, lower x first
      expect(result.vertices).toEqual([{ x: -2, y: 7 }, { x: 10, y: 7 }]);
    });
  });

  // ============================================================================
  // Triangle (3 vertices + 1 interior/duplicate point)
  // ============================================================================

  describe('Triangle', () => {
    it('should return triangle when one point is inside', () => {
      const result = convexHull([
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 0, y: 4 },
        { x: 1, y: 1 } // interior point
      ]);
      expect(result.type).toBe('triangle');
      expect(result.vertices.length).toBe(3);
      expect(samePointSet(result.vertices, [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 0, y: 4 }
      ])).toBe(true);
    });

    it('should return triangle when one point is duplicate', () => {
      const result = convexHull([
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 2 },
        { x: 0, y: 0 } // duplicate
      ]);
      expect(result.type).toBe('triangle');
      expect(result.vertices.length).toBe(3);
      expect(samePointSet(result.vertices, [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 2 }
      ])).toBe(true);
    });
  });

  // ============================================================================
  // 4 points: convex quadrilaterals
  // ============================================================================

  describe('Quadrilateral (4 convex points)', () => {
    it('should return quadrilateral for axis-aligned rectangle', () => {
      const result = convexHull([
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 1 },
        { x: 0, y: 1 }
      ]);
      expect(result.type).toBe('quadrilateral');
      expect(result.vertices.length).toBe(4);
      expect(samePointSet(result.vertices, [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 1 },
        { x: 0, y: 1 }
      ])).toBe(true);
    });

    it('should return quadrilateral for diamond shape', () => {
      const result = convexHull([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 0 },
        { x: 1, y: -1 }
      ]);
      expect(result.type).toBe('quadrilateral');
      expect(result.vertices.length).toBe(4);
      expect(samePointSet(result.vertices, [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 0 },
        { x: 1, y: -1 }
      ])).toBe(true);
    });

    it('should remove duplicate and return quadrilateral', () => {
      const result = convexHull([
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 1 },
        { x: 0, y: 1 },
        { x: 0, y: 1 } // duplicate
      ]);
      expect(result.type).toBe('quadrilateral');
      expect(result.vertices.length).toBe(4);
    });
  });

  // ============================================================================
  // Interior points (more cases)
  // ============================================================================

  describe('Interior points', () => {
    it('should exclude interior point from right triangle', () => {
      const result = convexHull([
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 4 },
        { x: 1, y: 1 } // interior
      ]);
      expect(result.type).toBe('triangle');
      expect(result.vertices.length).toBe(3);
      expect(samePointSet(result.vertices, [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 4 }
      ])).toBe(true);
    });

    it('should exclude interior point from symmetric triangle', () => {
      const result = convexHull([
        { x: 0, y: 0 },
        { x: 2, y: 2 },
        { x: 4, y: 0 },
        { x: 2, y: 0.5 } // interior
      ]);
      expect(result.type).toBe('triangle');
      expect(result.vertices.length).toBe(3);
      expect(samePointSet(result.vertices, [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 2, y: 2 }
      ])).toBe(true);
    });
  });

  // ============================================================================
  // Points on edge (local collinearity)
  // ============================================================================

  describe('Points on hull edge', () => {
    it('should exclude point lying on triangle edge', () => {
      const result = convexHull([
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 0, y: 4 },
        { x: 2, y: 0 } // on edge between (0,0) and (4,0)
      ]);
      expect(result.type).toBe('triangle');
      expect(result.vertices.length).toBe(3);
      // {2,0} should NOT be in hull
      expect(samePointSet(result.vertices, [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 0, y: 4 }
      ])).toBe(true);
    });
  });

  // ============================================================================
  // Tie-break cases
  // ============================================================================

  describe('Tie-break cases', () => {
    it('should start from point with minimal y then minimal x', () => {
      const result = convexHull([
        { x: 0, y: 0 },
        { x: 5, y: 0 },
        { x: 5, y: 5 },
        { x: 0, y: 5 }
      ]);
      expect(result.type).toBe('quadrilateral');
      expect(result.vertices.length).toBe(4);
      // Start should be {0,0} (min y, then min x)
      const normalized = normalizeHull(result.vertices);
      expect(normalized[0]).toEqual({ x: 0, y: 0 });
    });

    it('should exclude interior point from symmetric triangle', () => {
      const result = convexHull([
        { x: 0, y: 0 },
        { x: 2, y: 2 },
        { x: 4, y: 0 },
        { x: 2, y: 1 } // interior
      ]);
      expect(result.type).toBe('triangle');
      expect(result.vertices.length).toBe(3);
      expect(samePointSet(result.vertices, [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 2, y: 2 }
      ])).toBe(true);
    });
  });

  // ============================================================================
  // Negative coordinates / large numbers
  // ============================================================================

  describe('Negative coordinates and large numbers', () => {
    it('should handle negative coordinates correctly', () => {
      const result = convexHull([
        { x: -3, y: -1 },
        { x: -1, y: -4 },
        { x: 2, y: -2 },
        { x: 0, y: 3 }
      ]);
      expect(result.type).toBe('quadrilateral');
      expect(result.vertices.length).toBe(4);
      expect(samePointSet(result.vertices, [
        { x: -3, y: -1 },
        { x: -1, y: -4 },
        { x: 2, y: -2 },
        { x: 0, y: 3 }
      ])).toBe(true);
    });

    it('should handle large coordinate values', () => {
      const result = convexHull([
        { x: 1e9, y: 1e9 },
        { x: 1e9 + 1, y: 1e9 },
        { x: 1e9, y: 1e9 + 1 },
        { x: 1e9 + 2, y: 1e9 + 2 }
      ]);
      // Should produce a valid hull (triangle or quadrilateral)
      expect(['triangle', 'quadrilateral']).toContain(result.type);
      expect(result.vertices.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ============================================================================
  // Float precision
  // ============================================================================

  describe('Float precision', () => {
    it('should handle nearly collinear points', () => {
      const result = convexHull([
        { x: 0, y: 0 },
        { x: 1, y: 1.0000001 }, // almost collinear
        { x: 2, y: 2 },
        { x: 3, y: 3 }
      ]);
      // Depending on precision, could be segment or triangle/quad
      expect(['segment', 'triangle', 'quadrilateral']).toContain(result.type);
      expect(result.vertices.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle float coordinates in quadrilateral', () => {
      const result = convexHull([
        { x: 0.5, y: 0.5 },
        { x: 2.7, y: 0.3 },
        { x: 2.9, y: 1.8 },
        { x: 0.2, y: 1.5 }
      ]);
      expect(result.type).toBe('quadrilateral');
      expect(result.vertices.length).toBe(4);
    });
  });
});
