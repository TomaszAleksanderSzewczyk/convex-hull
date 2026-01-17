export interface Point {
  x: number;
  y: number;
}

export type HullType = 'point' | 'segment' | 'triangle' | 'quadrilateral';

export interface HullResult {
  type: HullType;
  vertices: Point[];
}
