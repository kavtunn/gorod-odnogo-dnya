type ArtId = 'home' | 'road' | 'school' | 'canteen' | 'river' | 'park' | 'plant' | 'net'

const titles: Record<ArtId, string> = {
  home: 'Утро дома',
  road: 'Переход у школы',
  school: 'Коридор школы',
  canteen: 'Столовая',
  river: 'Набережная',
  park: 'Двор',
  plant: 'Проходная завода',
  net: 'Вечер в сети',
}

export function LocationArt({ id }: { id: string }) {
  const artId = (id in titles ? id : 'home') as ArtId
  return (
    <figure className="scene-art" aria-label={titles[artId]}>
      <svg viewBox="0 0 640 220" role="img" focusable="false">
        <rect width="640" height="220" fill="#e8d4b5" />
        {artId === 'home' && (
          <>
            <rect x="80" y="60" width="200" height="130" fill="#fff8e7" stroke="#5c4030" strokeWidth="4" />
            <polygon points="70,60 180,10 290,60" fill="#c0392b" />
            <rect x="150" y="110" width="50" height="80" fill="#5c4030" />
            <rect x="360" y="70" width="90" height="120" rx="8" fill="#2a2118" />
            <rect x="375" y="90" width="60" height="40" fill="#2e86ab" opacity="0.85" />
            <circle cx="500" cy="50" r="28" fill="#f0c36a" />
          </>
        )}
        {artId === 'road' && (
          <>
            <rect x="0" y="140" width="640" height="80" fill="#6b7280" />
            <rect x="0" y="175" width="640" height="10" fill="#fff8e7" opacity="0.7" />
            <rect x="280" y="40" width="24" height="100" fill="#5c4030" />
            <circle cx="292" cy="50" r="14" fill="#c0392b" />
            <circle cx="292" cy="78" r="14" fill="#f0c36a" />
            <circle cx="292" cy="106" r="14" fill="#2f6b4f" />
            <rect x="40" y="90" width="70" height="50" fill="#fff8e7" stroke="#5c4030" strokeWidth="3" />
            <ellipse cx="480" cy="150" rx="55" ry="22" fill="#2a2118" />
            <rect x="450" y="120" width="70" height="35" fill="#2e86ab" />
            <path d="M120 160 Q200 120 280 160" fill="none" stroke="#c0392b" strokeWidth="3" strokeDasharray="6 6" />
          </>
        )}
        {artId === 'school' && (
          <>
            <rect x="40" y="40" width="560" height="140" fill="#fff8e7" stroke="#5c4030" strokeWidth="4" />
            <rect x="60" y="70" width="80" height="90" fill="#e8d4b5" />
            <rect x="180" y="70" width="80" height="90" fill="#e8d4b5" />
            <rect x="300" y="70" width="80" height="90" fill="#e8d4b5" />
            <rect x="480" y="70" width="90" height="110" fill="#2f6b4f" />
            <text x="500" y="130" fill="#fff8e7" fontSize="18" fontFamily="serif">ВЫХОД</text>
            <path d="M100 150 L500 150" stroke="#c0392b" strokeWidth="4" />
          </>
        )}
        {artId === 'canteen' && (
          <>
            <rect x="60" y="50" width="520" height="130" fill="#fff8e7" stroke="#5c4030" strokeWidth="4" />
            <rect x="100" y="90" width="100" height="60" fill="#2f6b4f" />
            <rect x="240" y="90" width="100" height="60" fill="#f0c36a" />
            <rect x="380" y="90" width="100" height="60" fill="#c0392b" opacity="0.85" />
            <circle cx="150" cy="70" r="12" fill="#fff8e7" stroke="#5c4030" strokeWidth="2" />
            <circle cx="290" cy="70" r="12" fill="#fff8e7" stroke="#5c4030" strokeWidth="2" />
            <circle cx="430" cy="70" r="12" fill="#fff8e7" stroke="#5c4030" strokeWidth="2" />
          </>
        )}
        {artId === 'river' && (
          <>
            <rect x="0" y="120" width="640" height="100" fill="#2e86ab" opacity="0.55" />
            <path d="M0 130 Q160 100 320 130 T640 130" fill="none" stroke="#fff8e7" strokeWidth="3" />
            <rect x="80" y="60" width="70" height="50" fill="#fff8e7" stroke="#5c4030" />
            <rect x="180" y="60" width="70" height="50" fill="#2e86ab" stroke="#5c4030" />
            <rect x="280" y="60" width="70" height="50" fill="#2f6b4f" stroke="#5c4030" />
            <rect x="380" y="60" width="70" height="50" fill="#6b5645" stroke="#5c4030" />
            <circle cx="520" cy="100" r="18" fill="#c0392b" opacity="0.5" />
          </>
        )}
        {artId === 'park' && (
          <>
            <rect x="0" y="150" width="640" height="70" fill="#9ca3af" />
            <rect x="250" y="40" width="80" height="120" fill="#5c4030" />
            <rect x="240" y="30" width="100" height="20" fill="#2a2118" />
            <circle cx="120" cy="100" r="40" fill="#2f6b4f" />
            <circle cx="500" cy="90" r="45" fill="#2f6b4f" />
            <ellipse cx="360" cy="160" rx="30" ry="12" fill="#2a2118" />
            <path d="M340 160 L420 120" stroke="#c0392b" strokeWidth="3" />
          </>
        )}
        {artId === 'plant' && (
          <>
            <rect x="100" y="50" width="420" height="130" fill="#6b7280" stroke="#5c4030" strokeWidth="4" />
            <rect x="140" y="80" width="60" height="100" fill="#fff8e7" />
            <rect x="240" y="20" width="30" height="60" fill="#5c4030" />
            <rect x="320" y="10" width="30" height="70" fill="#5c4030" />
            <rect x="400" y="80" width="80" height="50" fill="#2e86ab" />
            <text x="250" y="120" fill="#fff8e7" fontSize="22" fontFamily="serif">СМЕНА</text>
          </>
        )}
        {artId === 'net' && (
          <>
            <rect x="160" y="30" width="320" height="160" rx="16" fill="#2a2118" />
            <rect x="180" y="50" width="280" height="110" fill="#fff8e7" />
            <rect x="200" y="70" width="180" height="28" fill="#e8d4b5" />
            <rect x="240" y="110" width="160" height="28" fill="#c0392b" opacity="0.35" />
            <circle cx="480" cy="70" r="10" fill="#c0392b" />
          </>
        )}
      </svg>
      <figcaption>{titles[artId]}</figcaption>
    </figure>
  )
}
