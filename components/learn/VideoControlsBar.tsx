'use client';

import {
  ArrowPathIcon,
  BackwardIcon,
  ForwardIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/solid';

export const VIDEO_SKIP_SECONDS = 10;

type VideoControlsBarProps = {
  playing: boolean;
  ready?: boolean;
  onPlayPause: () => void;
  onRewind: () => void;
  onForward: () => void;
  onReload: () => void;
};

function ControlButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
    >
      {children}
    </button>
  );
}

export default function VideoControlsBar({
  playing,
  ready = true,
  onPlayPause,
  onRewind,
  onForward,
  onReload,
}: VideoControlsBarProps) {
  return (
    <div
      className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 bg-slate-950 border-t border-slate-800"
      onContextMenu={(event) => event.preventDefault()}
    >
      <ControlButton
        label={`Rewind ${VIDEO_SKIP_SECONDS} seconds`}
        onClick={onRewind}
        disabled={!ready}
      >
        <BackwardIcon className="h-5 w-5" />
      </ControlButton>

      <ControlButton
        label={playing ? 'Pause' : 'Play'}
        onClick={onPlayPause}
        disabled={!ready}
      >
        {playing ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6 ml-0.5" />}
      </ControlButton>

      <ControlButton
        label={`Forward ${VIDEO_SKIP_SECONDS} seconds`}
        onClick={onForward}
        disabled={!ready}
      >
        <ForwardIcon className="h-5 w-5" />
      </ControlButton>

      <ControlButton label="Reload video" onClick={onReload} disabled={!ready}>
        <ArrowPathIcon className="h-5 w-5" />
      </ControlButton>
    </div>
  );
}
