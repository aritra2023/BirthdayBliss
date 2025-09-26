import Timeline from '../Timeline';

export default function TimelineExample() {
  //todo: remove mock functionality
  const mockEvents = [
    {
      id: '1',
      date: 'January 15, 2023',
      title: 'First Meeting',
      description: 'The day our eyes first met at the coffee shop. I knew there was something special about you from that very moment.',
      icon: 'sparkles'
    },
    {
      id: '2', 
      date: 'February 14, 2023',
      title: 'First Date',
      description: 'Our magical Valentine\'s day dinner where we talked until the restaurant closed. Time just stopped when I was with you.',
      icon: 'heart'
    },
    {
      id: '3',
      date: 'May 20, 2023', 
      title: 'First Trip Together',
      description: 'Our weekend getaway to the mountains. Watching the sunrise with you was when I knew I was falling deeply in love.',
      icon: 'mountain'
    },
    {
      id: '4',
      date: 'August 10, 2023',
      title: 'Moving In Together', 
      description: 'The day we decided to share our lives and our home. Every morning with you feels like a blessing.',
      icon: 'home'
    },
    {
      id: '5',
      date: 'December 25, 2023',
      title: 'First Christmas',
      description: 'Celebrating our first Christmas together, creating traditions that will last a lifetime. You make every holiday magical.',
      icon: 'tree'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-background to-card min-h-screen">
      <Timeline events={mockEvents} />
    </div>
  );
}