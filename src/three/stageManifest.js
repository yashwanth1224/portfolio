/**
 * Palette design tokens, stage budgets, and priority hierarchy for ScissorEngine.
 */

export const PORTFOLIO_PALETTE = Object.freeze({
  terracotta: 0x542416,
  burntOrange: 0xD95D39,
  cream: 0xF5F2EB,
  sand: 0xE8DEC9,
  charcoal: 0x1A1A1A,
});

export const STAGE_BUDGET = Object.freeze({
  high: { maxVisibleStages: 12, maxDpr: 2 },
  mobile: { maxVisibleStages: 4, maxDpr: 1.5 },
  reduced: { maxVisibleStages: 0, maxDpr: 1 },
  fallback: { maxVisibleStages: 0, maxDpr: 1 },
});

export const STAGE_PRIORITY = Object.freeze({
  'modal-engine-sim': 100,
  'studio-diorama': 98,
  'hero-workspace': 95,
  'experience-helix': 85,
  'about-morph': 80,
  'skills-constellation': 75,
  'certificates-carousel': 70,
  'contact-beacon': 65,
  'project-preview': 50,
});

/**
 * Resolves priority ranking for a stage ID.
 * Supports exact IDs and 'project-preview-*' wildcard IDs.
 *
 * @param {string} stageId
 * @returns {number}
 */
export function resolveStagePriority(stageId) {
  if (typeof stageId === 'string') {
    if (stageId === 'project-preview' || stageId.startsWith('project-preview-')) {
      return STAGE_PRIORITY['project-preview'];
    }
    if (Object.prototype.hasOwnProperty.call(STAGE_PRIORITY, stageId)) {
      return STAGE_PRIORITY[stageId];
    }
  }
  throw new Error('Unknown stageId: ' + stageId);
}
