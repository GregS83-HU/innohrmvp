// src/app/page.tsx
export default function HomePage() {
  return (
    <div style={{ maxWidth: '700px', margin: 'auto', padding: '2rem' }}>
      <h1 className="text-6xl font-bold text-center mb-6">Inno HR - Home Page</h1>
       <img
        src="/InnoHRLogo.jpeg"
        alt="InnoHR"
        style={{ display: 'block', margin: '0 auto' }}
        />
      <p className="text-2xl font-bold text-center mb-6">HR was never as easy as NOW</p>
    </div>
  )
}