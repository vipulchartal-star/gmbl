import { Text, View } from 'react-native';

import { styles } from './appStyles';

export function WalletCoin({ side }: { side: 'yes' | 'no' }) {
  return (
    <View style={styles.walletCoinWrap}>
      <View style={styles.walletCoinFace}>
        <View style={styles.walletCoinFaceInner}>
          <View style={styles.walletCoinFaceCore}>
            <Text style={styles.walletCoinFaceText}>{side === 'yes' ? 'Y' : 'N'}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.walletCoinCaption}>{side === 'yes' ? 'YES COIN' : 'NO COIN'}</Text>
    </View>
  );
}

export function WalletBackgroundCoin({
  size,
  label,
}: {
  size: number;
  label: string;
}) {
  return (
    <View
      style={[
        styles.walletBackgroundCoin,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <View
        style={[
          styles.walletBackgroundCoinInner,
          {
            width: size * 0.72,
            height: size * 0.72,
            borderRadius: (size * 0.72) / 2,
          },
        ]}
      >
        <Text style={[styles.walletBackgroundCoinText, { fontSize: size * 0.2 }]}>{label}</Text>
      </View>
    </View>
  );
}
