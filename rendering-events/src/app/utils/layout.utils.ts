import { ParsedEvent, DAY_START_MIN, DAY_END_MIN } from '../models/event.model';

export interface LayoutEvent extends ParsedEvent {
  top: number; // px
  height: number; // px
  left: number; // px
  width: number; // px
  column: number;
  totalColumns: number;
}

export function minutesToY(min: number, containerHeight: number): number {
  const start = DAY_START_MIN;
  const end = DAY_END_MIN;
  const clamped = Math.min(Math.max(min, start), end);
  const total = end - start;
  const ratio = (clamped - start) / total;
  return ratio * containerHeight;
}

export function pixelsPerMinute(containerHeight: number): number {
  return containerHeight / (DAY_END_MIN - DAY_START_MIN);
}

// Group events into clusters where any event intersects another in the same cluster
export function clusterEvents(events: ParsedEvent[]): ParsedEvent[][] {
  if (!events || events.length === 0) return [];
  const sorted = [...events].sort((a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes);
  const clusters: ParsedEvent[][] = [];
  let currentCluster: ParsedEvent[] = [sorted[0]];
  let currentMaxEnd = sorted[0].endMinutes;

  for (let i = 1; i < sorted.length; i++) {
    const ev = sorted[i];
    if (ev.startMinutes < currentMaxEnd) {
      currentCluster.push(ev);
      currentMaxEnd = Math.max(currentMaxEnd, ev.endMinutes);
    } else {
      clusters.push(currentCluster);
      currentCluster = [ev];
      currentMaxEnd = ev.endMinutes;
    }
  }
  clusters.push(currentCluster);
  return clusters;
}

// Assign columns for events in a cluster using a greedy algorithm (interval graph coloring)
function assignColumns(cluster: ParsedEvent[]): { assign: Map<number, number>; columns: number } {
  const columnsEnd: number[] = []; // end time per column
  const assign = new Map<number, number>(); // event id -> column index

  for (const ev of cluster) {
    let placed = false;
    for (let c = 0; c < columnsEnd.length; c++) {
      if (ev.startMinutes >= columnsEnd[c]) {
        // place in this column
        assign.set(ev.id, c);
        columnsEnd[c] = ev.endMinutes;
        placed = true;
        break;
      }
    }
    if (!placed) {
      // new column
      const idx = columnsEnd.length;
      columnsEnd.push(ev.endMinutes);
      assign.set(ev.id, idx);
    }
  }
  return { assign, columns: columnsEnd.length };
}

// Main layout function: returns layouted events with top/height/left/width in pixels
export function layoutEvents(events: ParsedEvent[], containerWidth: number, containerHeight: number): LayoutEvent[] {
  const ppm = pixelsPerMinute(containerHeight);
  const clusters = clusterEvents(events);
  const result: LayoutEvent[] = [];

  for (const cluster of clusters) {
    const { assign, columns } = assignColumns(cluster);
    const columnWidth = containerWidth / Math.max(1, columns);

    // For each event, compute occupied columns by overlapping events, then expand into
    // consecutive free columns to the right of its assigned column.
    for (const ev of cluster) {
      const col = assign.get(ev.id) ?? 0;

      const occupied = new Set<number>();
      for (const other of cluster) {
        if (other.id === ev.id) continue;
        if (other.startMinutes < ev.endMinutes && other.endMinutes > ev.startMinutes) {
          const oc = assign.get(other.id);
          if (oc !== undefined) occupied.add(oc);
        }
      }

      // Count how many consecutive free columns starting at `col` are available
      let freeCols = 0;
      for (let c = col; c < columns; c++) {
        if (occupied.has(c)) break;
        freeCols++;
      }

      const top = minutesToY(ev.startMinutes, containerHeight);
      const height = Math.max(1, ev.duration * ppm);
      const left = col * columnWidth;
      const width = columnWidth * Math.max(1, freeCols);

      result.push({
        ...ev,
        top,
        height,
        left,
        width,
        column: col,
        totalColumns: columns
      });
    }
  }

  return result;
}
