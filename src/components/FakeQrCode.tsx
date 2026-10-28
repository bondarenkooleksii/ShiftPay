interface FakeQrCodeProps {
  seed: string;
  size?: number;
}

const GRID = 25;

function isFinder(x: number, y: number) {
  const inBox = (bx: number, by: number) => x >= bx && x < bx + 7 && y >= by && y < by + 7;
  return inBox(0, 0) || inBox(GRID - 7, 0) || inBox(0, GRID - 7);
}

function finderCell(x: number, y: number) {
  const lx = x % (GRID - 7) === x ? x : x - (GRID - 7);
  const ly = y % (GRID - 7) === y ? y : y - (GRID - 7);
  const edge = lx === 0 || lx === 6 || ly === 0 || ly === 6;
  const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
  return edge || core;
}

// Decorative QR-like pattern. Not scannable — it only visualises the invite link.
export default function FakeQrCode({ seed, size = 160 }: FakeQrCodeProps) {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = () => {
    hash = (hash * 1103515245 + 12345) >>> 0;
    return hash / 2 ** 32;
  };

  const cells: Array<[number, number]> = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const filled = isFinder(x, y) ? finderCell(x, y) : rand() > 0.52;
      if (filled) cells.push([x, y]);
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`-1 -1 ${GRID + 2} ${GRID + 2}`}
      role="img"
      aria-label="QR-код запрошення"
      shapeRendering="crispEdges"
    >
      <rect x={-1} y={-1} width={GRID + 2} height={GRID + 2} fill="#ffffff" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#0f172a" />
      ))}
    </svg>
  );
}
