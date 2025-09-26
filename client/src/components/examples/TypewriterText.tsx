import TypewriterText from '../TypewriterText';

export default function TypewriterTextExample() {
  const message = "My dearest love, on this special day I want you to know how much joy you bring to my life every single day. You are my sunshine, my laughter, and my heart's greatest treasure. Happy Birthday! ❤️";
  
  return (
    <div className="max-w-4xl mx-auto p-8 bg-card rounded-2xl">
      <TypewriterText 
        text={message}
        delay={500}
        speed={80}
        className="text-card-foreground"
        onComplete={() => console.log('Typewriter complete!')}
      />
    </div>
  );
}