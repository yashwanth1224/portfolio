import React from 'react';
import { Compass, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { STUDIO_STATIONS } from '../../three/studioStations.js';
import { sound } from '../../utils/audio.js';

/**
 * Bottom capsule HUD dock for navigating 3D Studio Diorama stations, muting audio, and exiting Studio Mode.
 * Constrains itself left of the desktop detail drawer when a station is open and hides beneath the mobile full-width drawer.
 *
 * @param {Object} props
 * @param {string} props.activeStationId
 * @param {import('../../three/studioStations.js').StudioStation | null} props.currentStation
 * @param {boolean} props.isMuted
 * @param {(stationId: string) => void} props.onSelectStation
 * @param {() => void} props.onExitStudio
 */
export default function StudioCapsuleDock({
  activeStationId,
  currentStation,
  isMuted,
  onSelectStation,
  onExitStudio,
}) {
  return (
    <div
      className={`z-30 pointer-events-auto overflow-x-auto pb-1 ${
        currentStation
          ? 'hidden sm:flex absolute bottom-5 left-4 sm:right-[456px] lg:right-[516px] justify-start'
          : 'flex absolute bottom-5 left-1/2 -translate-x-1/2 max-w-[96vw]'
      }`}
    >
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#141414]/90 backdrop-blur-xl border border-white/15 shadow-2xl shrink-0">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onSelectStation('overview');
          }}
          onMouseEnter={() => sound.playPop()}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
            activeStationId === 'overview'
              ? 'bg-[#D95D39] text-white shadow-md shadow-[#D95D39]/30 font-bold'
              : 'text-[#F5F2EB]/75 hover:text-white hover:bg-white/5'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Overview (0)</span>
        </button>

        <span className="w-px h-5 bg-white/15 mx-0.5" />

        {STUDIO_STATIONS.map((station) => {
          const isActive = activeStationId === station.id;
          return (
            <button
              key={station.id}
              type="button"
              onClick={() => {
                sound.playClick();
                onSelectStation(station.id);
              }}
              onMouseEnter={() => sound.playPop()}
              title={`${station.label}: ${station.title}`}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#D95D39] text-white shadow-md shadow-[#D95D39]/30 font-bold'
                  : 'text-[#F5F2EB]/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="opacity-60 text-[10px]">[{station.index}]</span>
              <span className="hidden sm:inline">{station.badge}</span>
              <span className="sm:hidden">{station.label.replace('Station ', 'S')}</span>
            </button>
          );
        })}

        <span className="w-px h-5 bg-white/15 mx-0.5" />

        <button
          type="button"
          onClick={() => sound.toggleMute()}
          onMouseEnter={() => sound.playPop()}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio (M)'}
          className="p-2 rounded-xl text-[#F5F2EB]/70 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Toggle Sound"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 opacity-50" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#D95D39] animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={onExitStudio}
          onMouseEnter={() => sound.playPop()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-medium transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#D95D39]" />
          <span className="whitespace-nowrap">Exit to 3D Scroll</span>
        </button>
      </div>
    </div>
  );
}
