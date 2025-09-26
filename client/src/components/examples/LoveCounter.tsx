import LoveCounter from '../LoveCounter';

export default function LoveCounterExample() {
  //todo: remove mock functionality - set real relationship start date
  const mockStartDate = new Date('2023-01-15T14:30:00');

  return (
    <div className="bg-gradient-to-br from-background to-card min-h-screen">
      <LoveCounter startDate={mockStartDate} />
    </div>
  );
}