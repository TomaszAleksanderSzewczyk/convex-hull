export interface Point {
  x: number;
  y: number;
}

export type HullType = 'point' | 'segment' | 'triangle' | 'quadrilateral';

export interface HullResult {
  type: HullType;
  vertices: Point[];
}

// Algorithm visualization types
export interface AlgorithmStep {
  type: 'start' | 'checking' | 'found' | 'complete';
  description: string;
  currentPoint: Point | null;
  candidatePoint: Point | null;
  checkingPoint: Point | null;
  hullSoFar: Point[];
  highlightLine: [Point, Point] | null;
}
