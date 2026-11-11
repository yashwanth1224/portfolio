/**
 * Station definitions, camera poses, and query helpers for the 3D Studio Diorama Showroom.
 *
 * @typedef {Object} CameraPose
 * @property {[number, number, number]} position
 * @property {[number, number, number]} target
 * @property {number} fov
 *
 * @typedef {Object} StudioStation
 * @property {string} id
 * @property {number} index
 * @property {string} label
 * @property {string} title
 * @property {string} subtitle
 * @property {string} badge
 * @property {'hero' | 'about' | 'experience' | 'projects' | 'skills' | 'achievements' | 'contact'} navSectionId
 * @property {[number, number, number]} anchorPos
 * @property {CameraPose} cameraPose
 */

export const OVERVIEW_POSE = Object.freeze({
  position: [9.5, 7.6, 11.2],
  target: [0, 0.5, 0],
  fov: 40,
});

export const STUDIO_STATIONS = Object.freeze([
  {
    id: 'hero-avatar',
    index: 1,
    label: 'Station 01',
    title: 'Avatar & Workspace',
    subtitle: 'Frontend Developer Desk Showcase',
    badge: 'Hero Core',
    navSectionId: 'hero',
    anchorPos: [0, 0.95, 0],
    cameraPose: {
      position: [0, 1.45, 3.6],
      target: [0, 0.95, 0],
      fov: 38,
    },
  },
  {
    id: 'about-lab',
    index: 2,
    label: 'Station 02',
    title: 'Engineering Morph Lab',
    subtitle: 'Mechanical Kinematics → Modern React',
    badge: 'Engineering Roots',
    navSectionId: 'about',
    anchorPos: [-4.3, 1.0, -2.8],
    cameraPose: {
      position: [-4.3, 1.9, 0.4],
      target: [-4.3, 1.0, -2.8],
      fov: 38,
    },
  },
  {
    id: 'experience-helix',
    index: 3,
    label: 'Station 03',
    title: 'Career Double Helix',
    subtitle: 'JSPIDERS, TQS Lab, Manjushree & EWIT VTU',
    badge: 'Career Spine',
    navSectionId: 'experience',
    anchorPos: [-4.1, 1.5, 2.6],
    cameraPose: {
      position: [-4.1, 2.4, 5.8],
      target: [-4.1, 1.5, 2.6],
      fov: 38,
    },
  },
  {
    id: 'project-gallery',
    index: 4,
    label: 'Station 04',
    title: 'Artifact Showcase',
    subtitle: 'Zisti, Astrovedic, Sentiment ML & Engine Sim',
    badge: 'Live Deployments',
    navSectionId: 'projects',
    anchorPos: [4.3, 1.1, -2.5],
    cameraPose: {
      position: [4.3, 2.2, 0.7],
      target: [4.3, 1.1, -2.5],
      fov: 38,
    },
  },
  {
    id: 'skills-reactor',
    index: 5,
    label: 'Station 05',
    title: 'Skills Reactor',
    subtitle: 'Frontend, Backend, Tools & Core Competencies',
    badge: 'Constellation',
    navSectionId: 'skills',
    anchorPos: [4.2, 1.25, 2.7],
    cameraPose: {
      position: [4.2, 2.2, 5.9],
      target: [4.2, 1.25, 2.7],
      fov: 38,
    },
  },
  {
    id: 'achievements-vitrine',
    index: 6,
    label: 'Station 06',
    title: 'Honors Vitrine',
    subtitle: 'National Tug-of-War & Technical Credentials',
    badge: 'Accolades',
    navSectionId: 'achievements',
    anchorPos: [0, 0.55, -4.7],
    cameraPose: {
      position: [0, 1.6, -1.6],
      target: [0, 0.55, -4.7],
      fov: 38,
    },
  },
  {
    id: 'contact-terminal',
    index: 7,
    label: 'Station 07',
    title: 'Dispatch Beacon',
    subtitle: 'Bengaluru Telemetry & Instant Dispatch',
    badge: 'Contact Beacon',
    navSectionId: 'contact',
    anchorPos: [0, 1.15, 4.7],
    cameraPose: {
      position: [0, 2.1, 7.9],
      target: [0, 1.15, 4.7],
      fov: 38,
    },
  },
]);

/**
 * Finds a station by its unique station ID.
 *
 * @param {string} id
 * @returns {StudioStation | null}
 */
export function findStationById(id) {
  if (!id) return null;
  for (let i = 0; i < STUDIO_STATIONS.length; i++) {
    if (STUDIO_STATIONS[i].id === id) {
      return STUDIO_STATIONS[i];
    }
  }
  return null;
}

/**
 * Finds a station by its matching navbar section ID.
 *
 * @param {string} navId
 * @returns {StudioStation | null}
 */
export function findStationByNavId(navId) {
  if (!navId) return null;
  for (let i = 0; i < STUDIO_STATIONS.length; i++) {
    if (STUDIO_STATIONS[i].navSectionId === navId) {
      return STUDIO_STATIONS[i];
    }
  }
  return null;
}
