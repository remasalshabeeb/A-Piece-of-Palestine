
import React from 'react';
import { Box, Typography } from '@mui/material';

const PIECES = [
  {
    id: 'piece-1',
    path: 'M 5 5 H 91 V 34 C 91 25 108 25 108 38 C 108 49 91 49 91 41 V 91 H 65 C 74 91 74 108 61 108 C 50 108 50 91 58 91 H 5 Z',
  },
  {
    id: 'piece-2',
    path: 'M 109 5 H 195 V 195 H 109 V 142 C 109 150 92 150 92 139 C 92 126 109 126 109 135 V 109 H 159 C 151 109 151 92 162 92 C 175 92 175 109 166 109 H 195 V 5 Z',
  },
  {
    id: 'piece-3',
    path: 'M 5 109 H 34 C 25 109 25 92 38 92 C 49 92 49 109 41 109 H 91 V 135 C 91 126 108 126 108 139 C 108 150 91 150 91 142 V 195 H 5 Z',
  },
  {
    id: 'piece-4',
    path: 'M 109 109 H 159 C 151 109 151 92 162 92 C 175 92 175 109 166 109 H 195 V 195 H 109 V 142 C 109 150 92 150 92 139 C 92 126 109 126 109 135 Z',
  },
];

export default function PuzzleBoard({
  image = '',
  collectedPieces = [],
  pieceIds = [],
}) {
  const collected = new Set(
    collectedPieces.flatMap((piece) => {
      if (typeof piece === 'string') return [piece];
      if (!piece || typeof piece !== 'object') return [];
      return [piece.pieceId, piece.id]
        .filter(Boolean)
        .map(String);
    })
  );

  const isCollected = (index) => {
    const id = String(pieceIds[index] || PIECES[index].id);
    return collected.has(id) ||
      collected.has(PIECES[index].id) ||
      collected.has(String(index + 1));
  };

  return (
    <Box sx={{ maxWidth: 440, width: '100%', mx: 'auto' }}>
      <Typography
        sx={{
          textAlign: 'center',
          fontWeight: 800,
          color: '#2D5A27',
          mb: 1.5,
        }}
      >
        قطع الحكاية
      </Typography>

      <Box
        sx={{
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: '#FDFBF7',
          border: '2px solid #D4AF37',
          boxShadow: '0 8px 24px rgba(45,90,39,0.1)',
        }}
      >
        <svg
          viewBox="0 0 200 200"
          width="100%"
          height="100%"
          role="img"
          aria-label="بازل من أربع قطع"
        >
          <defs>
            {PIECES.map((piece, index) => (
              <clipPath
                id={`puzzle-clip-${index}`}
                key={piece.id}
              >
                <path d={piece.path} />
              </clipPath>
            ))}
          </defs>

          {PIECES.map((piece, index) => {
            const visible = isCollected(index);

            return (
              <g key={piece.id}>
                <path
                  d={piece.path}
                  fill={visible ? '#DCE8D4' : '#F0F0E8'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />

                {visible && image && (
                  <image
                    href={image}
                    x="0"
                    y="0"
                    width="200"
                    height="200"
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#puzzle-clip-${index})`}
                  />
                )}

                {!visible && (
                  <>
                    <path
                      d={piece.path}
                      fill="#FFFFFF"
                      fillOpacity="0.75"
                      stroke="#C8CEC2"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={index % 2 === 0 ? 48 : 150}
                      y={index < 2 ? 57 : 158}
                      textAnchor="middle"
                      fontSize="8"
                      fontWeight="700"
                      fill="#8C9A92"
                    >
                      {index + 1}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </Box>

      <Typography
        variant="body2"
        sx={{ textAlign: 'center', color: '#8C9A92', mt: 1.5 }}
      >
        جُمعت {PIECES.filter((_, index) => isCollected(index)).length} من 4 قطع
      </Typography>
    </Box>
  );
}
