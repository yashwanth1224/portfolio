import React from 'react';
import { STUDIO_STATIONS } from '../../three/studioStations.js';
import { sound } from '../../utils/audio.js';

/**
 * Accessible 2D station grid rendered when WebGL hardware acceleration is unavailable or reduced motion is active.
 *
 * @param {Object} props
 * @param {(stationId: string) => void} props.onSelectStation
 */
export default function StudioFallbackGrid({ onSelectStation }) {
  return (
    <div className="w-full h-full p-6 sm:p-12 overflow-y-auto flex flex-col items-center justify-center bg-[#121212] text-center space-y-6">
      <div className="max-w-xl space-y-2">
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
          3D Studio Showroom Stations
        </h3>
        <p className="font-mono text-xs text-[#F5F2EB]/70">
          Hardware acceleration unavailable or reduced motion active. Select any station below:
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl w-full">
        {STUDIO_STATIONS.map((station) => (
          <button
            key={station.id}
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectStation(station.id);
            }}
            className="p-4 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] border border-white/10 text-left transition-colors space-y-1"
          >
            <span className="text-[10px] font-mono text-[#D95D39] font-bold">
              {station.label} • {station.badge}
            </span>
            <div className="font-serif text-base font-bold text-white">{station.title}</div>
            <div className="text-xs text-[#F5F2EB]/60">{station.subtitle}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
