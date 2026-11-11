/**
 * Pure coordinate transforms, scroll ancestor clipping, and budget arbitration for WebGL scissor stages.
 */

/**
 * Converts DOMRects into WebGL bottom-left viewport and scissor clipping rectangles.
 * Keeps unclipped viewport dimensions to maintain camera perspective while clipping
 * scissor bounds to the intersection of the screen and any scrolling container.
 *
 * @param {{ left: number, top: number, width: number, height: number, right?: number, bottom?: number }} stageRect
 * @param {{ left: number, top: number, width: number, height: number, right?: number, bottom?: number } | null} scrollClipRect
 * @param {number} viewportWidth
 * @param {number} viewportHeight
 * @returns {{ visible: boolean, vpX: number, vpY: number, vpW: number, vpH: number, scX: number, scY: number, scW: number, scH: number, visibleAreaPx: number }}
 */
export function computeScissorViewport(stageRect, scrollClipRect, viewportWidth, viewportHeight) {
  if (!stageRect || viewportWidth <= 0 || viewportHeight <= 0) {
    return { visible: false, vpX: 0, vpY: 0, vpW: 0, vpH: 0, scX: 0, scY: 0, scW: 0, scH: 0, visibleAreaPx: 0 };
  }

  const stageLeft = stageRect.left;
  const stageTop = stageRect.top;
  const stageRight = stageRect.right !== undefined ? stageRect.right : stageLeft + stageRect.width;
  const stageBottom = stageRect.bottom !== undefined ? stageRect.bottom : stageTop + stageRect.height;

  let clipLeft = Math.max(0, stageLeft);
  let clipRight = Math.min(viewportWidth, stageRight);
  let clipTop = Math.max(0, stageTop);
  let clipBottom = Math.min(viewportHeight, stageBottom);

  if (scrollClipRect) {
    const scrollLeft = scrollClipRect.left;
    const scrollTop = scrollClipRect.top;
    const scrollRight = scrollClipRect.right !== undefined ? scrollClipRect.right : scrollLeft + scrollClipRect.width;
    const scrollBottom = scrollClipRect.bottom !== undefined ? scrollClipRect.bottom : scrollTop + scrollClipRect.height;

    clipLeft = Math.max(clipLeft, scrollLeft);
    clipRight = Math.min(clipRight, scrollRight);
    clipTop = Math.max(clipTop, scrollTop);
    clipBottom = Math.min(clipBottom, scrollBottom);
  }

  if (clipRight <= clipLeft || clipBottom <= clipTop) {
    return { visible: false, vpX: 0, vpY: 0, vpW: 0, vpH: 0, scX: 0, scY: 0, scW: 0, scH: 0, visibleAreaPx: 0 };
  }

  const vpX = Math.round(stageLeft);
  const vpY = Math.round(viewportHeight - stageBottom);
  const vpW = Math.max(1, Math.round(stageRect.width));
  const vpH = Math.max(1, Math.round(stageRect.height));

  const scX = Math.round(clipLeft);
  const scY = Math.round(viewportHeight - clipBottom);
  const scW = Math.round(clipRight - clipLeft);
  const scH = Math.round(clipBottom - clipTop);
  const visibleAreaPx = scW * scH;

  return { visible: true, vpX, vpY, vpW, vpH, scX, scY, scW, scH, visibleAreaPx };
}

/**
 * Computes normalized vertical progress [0..1] of an element moving through the viewport:
 * 0 = top just entering bottom of screen, 1 = bottom leaving top of screen.
 *
 * @param {{ top: number, height: number }} stageRect
 * @param {number} viewportHeight
 * @returns {number}
 */
export function computeScrollProgress(stageRect, viewportHeight) {
  if (!stageRect || viewportHeight <= 0) return 0;
  const totalTravel = viewportHeight + stageRect.height;
  if (totalTravel <= 0) return 0;
  const raw = (viewportHeight - stageRect.top) / totalTravel;
  return Math.max(0, Math.min(1, raw));
}

/**
 * Partitions visible stages into rendered, over-budget, and modal-preempted sets
 * based on visibility, modal preemption, priority, and visible area.
 *
 * @param {Array<{ id: string, layer?: 'page' | 'modal', priority?: number, visibleAreaPx?: number, scissor?: { visible?: boolean } }>} entries
 * @param {number} maxVisibleStages
 * @returns {{ renderedIds: Set<string>, overBudgetIds: Set<string>, preemptedIds: Set<string> }}
 */
export function selectBudgetedStages(entries, maxVisibleStages) {
  const renderedIds = new Set();
  const overBudgetIds = new Set();
  const preemptedIds = new Set();

  if (!Array.isArray(entries) || entries.length === 0) {
    return { renderedIds, overBudgetIds, preemptedIds };
  }

  const visibleEntries = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry || (entry.visibleAreaPx ?? 0) <= 0 || entry.scissor?.visible === false) {
      continue;
    }
    visibleEntries.push(entry);
  }

  if (visibleEntries.length === 0) {
    return { renderedIds, overBudgetIds, preemptedIds };
  }

  const hasModal = visibleEntries.some((e) => e.layer === 'modal');
  const candidates = [];

  for (let i = 0; i < visibleEntries.length; i++) {
    const entry = visibleEntries[i];
    if (hasModal && entry.layer !== 'modal') {
      preemptedIds.add(entry.id);
    } else {
      candidates.push(entry);
    }
  }

  if (maxVisibleStages <= 0) {
    for (let i = 0; i < candidates.length; i++) {
      overBudgetIds.add(candidates[i].id);
    }
    return { renderedIds, overBudgetIds, preemptedIds };
  }

  candidates.sort((a, b) => {
    const pDiff = (b.priority ?? 0) - (a.priority ?? 0);
    if (pDiff !== 0) return pDiff;
    return (b.visibleAreaPx ?? 0) - (a.visibleAreaPx ?? 0);
  });

  const allowed = Math.max(0, maxVisibleStages);
  for (let i = 0; i < candidates.length; i++) {
    if (i < allowed) {
      renderedIds.add(candidates[i].id);
    } else {
      overBudgetIds.add(candidates[i].id);
    }
  }

  return { renderedIds, overBudgetIds, preemptedIds };
}

/**
 * Finds the nearest ancestor element applying vertical overflow clipping.
 * Used to clip modal stages when scrolled within dialog scroll bodies.
 *
 * @param {HTMLElement | null} element
 * @returns {HTMLElement | null}
 */
export function findScrollClipAncestor(element) {
  if (!element || typeof window === 'undefined') return null;
  let current = element.parentElement;
  const body = document.body;
  const docEl = document.documentElement;

  while (current && current !== body && current !== docEl && current !== document) {
    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'hidden') {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}
