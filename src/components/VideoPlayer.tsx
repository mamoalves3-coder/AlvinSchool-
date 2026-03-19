import React from 'react';
import ReactPlayerComponent from 'react-player';

const ReactPlayer = ReactPlayerComponent as any;

interface VideoPlayerProps {
  url: string;
  title: string;
  onEnded?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title, onEnded }) => {
  return (
    <div className="monitor-frame">
      <div className="relative w-full pt-[56.25%] bg-black overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* @ts-ignore */}
          <ReactPlayer
            url={url}
            width="100%"
            height="100%"
            controls={true}
            onEnded={onEnded}
            config={{
              youtube: {
                playerVars: { showinfo: 1 }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
