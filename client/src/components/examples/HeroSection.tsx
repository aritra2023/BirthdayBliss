import HeroSection from '../HeroSection';

export default function HeroSectionExample() {
  return (
    <HeroSection 
      girlfriendName="Beautiful" 
      onEnterSite={() => console.log('Enter site clicked')} 
    />
  );
}