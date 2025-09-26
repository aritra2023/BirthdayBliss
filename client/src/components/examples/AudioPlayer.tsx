import AudioPlayer from '../AudioPlayer';

export default function AudioPlayerExample() {
  return (
    <div className="h-96 bg-gradient-to-br from-background to-card relative">
      <AudioPlayer />
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-2xl font-romantic text-primary mb-4">Background Music Player</h3>
          <p className="text-muted-foreground">Audio controls appear in the bottom right corner</p>
        </div>
      </div>
    </div>
  );
}