import FloatingHeartCursor from '../FloatingHeartCursor';

export default function FloatingHeartCursorExample() {
  return (
    <div className="h-96 bg-gradient-to-br from-background to-card flex items-center justify-center">
      <FloatingHeartCursor />
      <div className="text-center">
        <h3 className="text-2xl font-romantic text-primary mb-4">Move your mouse around!</h3>
        <p className="text-muted-foreground">Watch the hearts follow your cursor ❤️</p>
      </div>
    </div>
  );
}