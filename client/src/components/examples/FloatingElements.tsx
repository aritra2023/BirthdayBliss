import FloatingElements from '../FloatingElements';

export default function FloatingElementsExample() {
  return (
    <div className="relative h-96 bg-gradient-to-br from-background to-card overflow-hidden">
      <FloatingElements type="hearts" count={10} />
      <FloatingElements type="balloons" count={5} />
      <div className="flex items-center justify-center h-full">
        <p className="text-center text-muted-foreground">Floating hearts and balloons animation preview</p>
      </div>
    </div>
  );
}