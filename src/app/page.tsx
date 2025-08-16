import PositionsList from './openedpositions/PositionList'

export default function HomePage() {
  return (
    <main style={{ maxWidth: '700px', margin: 'auto', padding: '2rem' }}>
      <PositionsList />
    </main>
  )
}
