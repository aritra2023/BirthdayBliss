import PhotoCarousel from '../PhotoCarousel';

export default function PhotoCarouselExample() {
  //todo: remove mock functionality
  const mockPhotos = [
    {
      id: '1',
      src: '/api/placeholder/400/300',
      caption: 'Our first date at the coffee shop where we talked for hours ☕'
    },
    {
      id: '2', 
      src: '/api/placeholder/400/300',
      caption: 'That amazing sunset during our weekend getaway 🌅'
    },
    {
      id: '3',
      src: '/api/placeholder/400/300', 
      caption: 'Laughing together at the park - you make everything more fun! 😄'
    },
    {
      id: '4',
      src: '/api/placeholder/400/300',
      caption: 'Celebrating your last birthday - and now here we are again! 🎂'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-background to-card min-h-screen">
      <PhotoCarousel photos={mockPhotos} />
    </div>
  );
}