// src/core/constants.js
// Shared constants for the staircase-room architecture.

export const FLOOR_HEIGHT = 4.0 // vertical distance between room floor origins
export const ROOM_COUNT = 5
export const ROOM_WIDTH = 10.0 // x-axis extent of each room
export const ROOM_DEPTH = 10.0 // z-axis extent of each room
export const ROOM_CEILING = 3.8 // interior ceiling height within a room
export const STAIRWELL_X = 5.5 // x-position of stairwell center (to the right of rooms)
export const STAIRWELL_WIDTH = 3.0 // z-width of the stairwell shaft
export const EYE_HEIGHT = 1.6 // camera y-offset above floor within a room

// Progress mapping — each floor gets 15% for "in room" time,
// each staircase transition gets 5%.
// Floor 0: 0.00–0.15, Stair: 0.15–0.20
// Floor 1: 0.20–0.35, Stair: 0.35–0.40
// Floor 2: 0.40–0.55, Stair: 0.55–0.60
// Floor 3: 0.60–0.75, Stair: 0.75–0.80
// Floor 4: 0.80–1.00 (invitation gets extra time)
export const FLOORS = [
  { id: 'title', index: 0, progressStart: 0.0, progressEnd: 0.15, y: 0 * FLOOR_HEIGHT },
  { id: 'how-they-met', index: 1, progressStart: 0.2, progressEnd: 0.35, y: 1 * FLOOR_HEIGHT },
  { id: 'first-date', index: 2, progressStart: 0.4, progressEnd: 0.55, y: 2 * FLOOR_HEIGHT },
  { id: 'falling-in-love', index: 3, progressStart: 0.6, progressEnd: 0.75, y: 3 * FLOOR_HEIGHT },
  { id: 'invitation', index: 4, progressStart: 0.8, progressEnd: 1.0, y: 4 * FLOOR_HEIGHT },
]

// Staircase transitions occupy the gaps:
export const STAIRS = [
  { from: 0, to: 1, progressStart: 0.15, progressEnd: 0.2 },
  { from: 1, to: 2, progressStart: 0.35, progressEnd: 0.4 },
  { from: 2, to: 3, progressStart: 0.55, progressEnd: 0.6 },
  { from: 3, to: 4, progressStart: 0.75, progressEnd: 0.8 },
]
