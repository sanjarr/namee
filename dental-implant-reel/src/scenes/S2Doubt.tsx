import { AbsoluteFill } from 'remotion';
import { CenterAt } from '../components/Positioned';
import { RevealWord } from '../components/RevealWord';
import { SceneExit } from '../components/SceneExit';
import type { Layout } from '../layout';
import { colors } from '../theme';
import { type } from '../typography';

// Зачёркивание слова «мелочь.» рисует проводник (G2, локально 20–34)
export const S2Doubt: React.FC<{ layout: Layout }> = ({ layout }) => (
  <SceneExit from={62} to={72}>
    <AbsoluteFill>
      <CenterAt y={780} style={{ ...type.body, color: colors.muted }}>
        <RevealWord delay={0}>Кажется,</RevealWord>
      </CenterAt>
      {/* Сдвиг на 0.1em вверх: зачёркивание на y = 900 проходит по центру строчных */}
      <CenterAt y={900 - 0.1 * layout.sizes.s2} style={{ ...type.h2, fontSize: layout.sizes.s2, whiteSpace: 'nowrap', left: 0, right: 0 }}>
        <RevealWord delay={4}>это</RevealWord> <RevealWord delay={10}>мелочь.</RevealWord>
      </CenterAt>
      <CenterAt y={1020} style={{ ...type.body, fontWeight: 500 }}>
        <RevealWord delay={38}>Но это не так.</RevealWord>
      </CenterAt>
    </AbsoluteFill>
  </SceneExit>
);
