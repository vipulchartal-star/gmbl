import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

type Slide = {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  art: 'hero' | 'stadium' | 'token' | 'market' | 'traction' | 'ask';
};

const slides: Slide[] = [
  {
    eyebrow: 'GMBL Coin',
    title: 'A Cricket-First Fan Finance Layer',
    body:
      'GMBL Coin is building a cricket-native ecosystem around prediction, engagement, liquidity, and community ownership. We start where fan passion is deepest and mobile usage is highest: cricket.',
    bullets: [
      'Cricket as the wedge market',
      'GMBL Coin as the ecosystem asset',
      'Mobile-native product and token loop',
    ],
    art: 'hero',
  },
  {
    eyebrow: 'Why Cricket',
    title: 'Cricket Has Massive Emotion, Frequency, and Community Density',
    body:
      'Cricket is not just a sport category. It is an identity layer across India and global diaspora markets, with intense repeat engagement around leagues, rivalries, and match-day moments.',
    bullets: [
      'Fans follow every toss, over, and momentum swing',
      'High mobile engagement fits short-session product behavior',
      'Cricket communities create natural social and token network effects',
    ],
    art: 'stadium',
  },
  {
    eyebrow: 'The Problem',
    title: 'Fans Have Attention but No Native Ownership Layer',
    body:
      'Traditional sportsbooks capture transaction margin. Social platforms capture attention. Fantasy captures time. None of them create a simple fan-owned asset that compounds with product usage and community scale.',
    bullets: [
      'Betting and fantasy are fragmented',
      'Fan loyalty is not captured in an ecosystem asset',
      'Products feel transactional, not community-owned',
    ],
    art: 'market',
  },
  {
    eyebrow: 'The Solution',
    title: 'GMBL Coin Connects Cricket Activity to a Token Flywheel',
    body:
      'The product experience drives user activity, while the token anchors value, access, incentives, and long-term ecosystem identity.',
    bullets: [
      'Prediction and betting-style actions create repeat use',
      'GMBL Coin powers rewards, status, and ecosystem utility',
      'Community growth increases token relevance and retention',
    ],
    art: 'token',
  },
  {
    eyebrow: 'Token Utility',
    title: 'Utility Must Be Clear, Repeatable, and Product-Linked',
    body:
      'The token story is strongest when utility is tied directly to what users already want to do inside the product.',
    bullets: [
      'Rewards and loyalty mechanics for active users',
      'Premium access, gated drops, and special market participation',
      'Community competitions, creator tie-ins, and status layers',
      'Longer-term treasury, staking, or governance paths as the network matures',
    ],
    art: 'token',
  },
  {
    eyebrow: 'Go-To-Market',
    title: 'Start with Cricket, Start with Mobile, Start with Community',
    body:
      'The fastest path is to win a focused wedge rather than launch a broad multi-sport platform too early.',
    bullets: [
      'Lead with marquee cricket matches and leagues',
      'Distribute through creators, fan communities, and Telegram/WhatsApp style loops',
      'Use the product to convert attention into wallet and token participation',
    ],
    art: 'stadium',
  },
  {
    eyebrow: 'Current Build',
    title: 'The Core Product Loop Already Exists',
    body:
      'The current app proves that the team can ship the activity layer needed to support the broader ecosystem thesis.',
    bullets: [
      'Mobile-first swipe betting experience',
      'Server-backed markets and odds logic',
      'Settlement, payout, slips, and account state',
      'Fast action flow designed for repeat cricket usage',
    ],
    art: 'traction',
  },
  {
    eyebrow: 'Business Model',
    title: 'Monetization Comes from Activity, Liquidity, and Ecosystem Expansion',
    body:
      'GMBL Coin is not only a token story. It is a product, liquidity, and distribution story with multiple monetization paths.',
    bullets: [
      'Margin on activity and market-making',
      'Premium fan experiences and token-linked access',
      'Creator and partner campaigns',
      'Long-term ecosystem upside from network and asset growth',
    ],
    art: 'market',
  },
  {
    eyebrow: 'The Ask',
    title: 'Raise to Build the Cricket-Native Crypto Consumer Layer',
    body:
      'We are raising to accelerate product execution, token design, market infrastructure, and community distribution around GMBL Coin.',
    bullets: [
      'Product polish and mobile growth',
      'Token and liquidity infrastructure',
      'Cricket-first go-to-market',
      'Brand, creators, and community scale',
    ],
    art: 'ask',
  },
];

const goHome = () => {
  if (Platform.OS === 'web' && typeof globalThis.location !== 'undefined') {
    globalThis.location.assign('/');
  }
};

export function PitchDeckScreen() {
  return (
    <SafeAreaView style={deckStyles.safeArea}>
      <StatusBar style="light" />
      <ScrollView style={deckStyles.screen} contentContainerStyle={deckStyles.content}>
        <View style={deckStyles.topBar}>
          <Text style={deckStyles.brand}>GMBL Coin / Investor Deck</Text>
          <Pressable style={deckStyles.homeButton} onPress={goHome}>
            <Text style={deckStyles.homeButtonText}>Open App</Text>
          </Pressable>
        </View>
        {slides.map((slide) => (
          <View key={slide.title} style={deckStyles.slide}>
            <View style={deckStyles.copyCol}>
              <Text style={deckStyles.eyebrow}>{slide.eyebrow}</Text>
              <Text style={deckStyles.title}>{slide.title}</Text>
              <Text style={deckStyles.body}>{slide.body}</Text>
              <View style={deckStyles.bullets}>
                {slide.bullets.map((bullet) => (
                  <View key={bullet} style={deckStyles.bulletRow}>
                    <View style={deckStyles.bulletDot} />
                    <Text style={deckStyles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={deckStyles.artCol}>
              <DeckArt kind={slide.art} />
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function DeckArt({ kind }: { kind: Slide['art'] }) {
  if (kind === 'hero') {
    return (
      <View style={[deckStyles.artCard, deckStyles.heroArt]}>
        <View style={deckStyles.heroGlowGreen} />
        <View style={deckStyles.heroGlowOrange} />
        <View style={deckStyles.coinRing}>
          <Text style={deckStyles.coinText}>GMBL</Text>
        </View>
        <View style={deckStyles.pitchStrip} />
      </View>
    );
  }

  if (kind === 'stadium') {
    return (
      <View style={[deckStyles.artCard, deckStyles.stadiumArt]}>
        <View style={deckStyles.stadiumBowl} />
        <View style={deckStyles.pitchField} />
        <View style={deckStyles.scoreBar} />
        <View style={deckStyles.crowdGlow} />
      </View>
    );
  }

  if (kind === 'token') {
    return (
      <View style={[deckStyles.artCard, deckStyles.tokenArt]}>
        <View style={deckStyles.tokenNodeCenter}><Text style={deckStyles.tokenNodeText}>Coin</Text></View>
        <View style={[deckStyles.tokenNode, deckStyles.tokenNodeTop]}><Text style={deckStyles.tokenNodeText}>Rewards</Text></View>
        <View style={[deckStyles.tokenNode, deckStyles.tokenNodeLeft]}><Text style={deckStyles.tokenNodeText}>Access</Text></View>
        <View style={[deckStyles.tokenNode, deckStyles.tokenNodeRight]}><Text style={deckStyles.tokenNodeText}>Status</Text></View>
        <View style={[deckStyles.tokenNode, deckStyles.tokenNodeBottom]}><Text style={deckStyles.tokenNodeText}>Community</Text></View>
      </View>
    );
  }

  if (kind === 'market') {
    return (
      <View style={[deckStyles.artCard, deckStyles.marketArt]}>
        <View style={deckStyles.chartBarOne} />
        <View style={deckStyles.chartBarTwo} />
        <View style={deckStyles.chartBarThree} />
        <View style={deckStyles.chartLine} />
        <View style={deckStyles.chartToken} />
      </View>
    );
  }

  if (kind === 'traction') {
    return (
      <View style={[deckStyles.artCard, deckStyles.tractionArt]}>
        <View style={deckStyles.tractionGrid}>
          <View style={deckStyles.tractionCell}><Text style={deckStyles.tractionLabel}>Wallet</Text></View>
          <View style={deckStyles.tractionCell}><Text style={deckStyles.tractionLabel}>Odds</Text></View>
          <View style={deckStyles.tractionCell}><Text style={deckStyles.tractionLabel}>Slips</Text></View>
          <View style={deckStyles.tractionCellWide}><Text style={deckStyles.tractionLabelWide}>Settlement + Product Loop Live</Text></View>
        </View>
      </View>
    );
  }

  return (
    <View style={[deckStyles.artCard, deckStyles.askArt]}>
      <View style={deckStyles.askCoin}>
        <Text style={deckStyles.askCoinText}>G</Text>
      </View>
      <View style={deckStyles.askArrow} />
      <View style={deckStyles.askArrowSmall} />
      <Text style={deckStyles.askCaption}>Build product, token, and cricket distribution</Text>
    </View>
  );
}

const deckStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#04111a',
  },
  screen: {
    flex: 1,
    backgroundColor: '#04111a',
  },
  content: {
    gap: 28,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  brand: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  homeButton: {
    backgroundColor: 'rgba(249, 115, 22, 0.18)',
    borderColor: 'rgba(249, 115, 22, 0.44)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  homeButtonText: {
    color: '#fed7aa',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  slide: {
    backgroundColor: 'rgba(9, 21, 34, 0.96)',
    borderColor: 'rgba(148, 163, 184, 0.16)',
    borderRadius: 30,
    borderWidth: 1,
    gap: 20,
    overflow: 'hidden',
    padding: 20,
  },
  copyCol: {
    gap: 14,
  },
  eyebrow: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8fafc',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1.1,
    lineHeight: 38,
  },
  body: {
    color: '#cbd5e1',
    fontSize: 18,
    lineHeight: 28,
  },
  bullets: {
    gap: 10,
  },
  bulletRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  bulletDot: {
    backgroundColor: '#22c55e',
    borderRadius: 999,
    height: 8,
    marginTop: 8,
    width: 8,
  },
  bulletText: {
    color: '#f8fafc',
    flex: 1,
    fontSize: 17,
    lineHeight: 25,
  },
  artCol: {
    minHeight: 280,
  },
  artCard: {
    alignItems: 'center',
    borderRadius: 24,
    flex: 1,
    justifyContent: 'center',
    minHeight: 280,
    overflow: 'hidden',
    position: 'relative',
  },
  heroArt: {
    backgroundColor: '#071825',
  },
  heroGlowGreen: {
    backgroundColor: 'rgba(34, 197, 94, 0.14)',
    borderRadius: 999,
    height: 260,
    left: -80,
    position: 'absolute',
    top: -40,
    width: 260,
  },
  heroGlowOrange: {
    backgroundColor: 'rgba(249, 115, 22, 0.16)',
    borderRadius: 999,
    bottom: -70,
    height: 240,
    position: 'absolute',
    right: -70,
    width: 240,
  },
  coinRing: {
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    borderColor: '#fde68a',
    borderRadius: 999,
    borderWidth: 6,
    height: 132,
    justifyContent: 'center',
    width: 132,
  },
  coinText: {
    color: '#0f172a',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 1,
  },
  pitchStrip: {
    backgroundColor: '#5b8c3b',
    borderRadius: 999,
    bottom: 42,
    height: 18,
    position: 'absolute',
    width: 210,
  },
  stadiumArt: {
    backgroundColor: '#081723',
  },
  stadiumBowl: {
    backgroundColor: '#102739',
    borderRadius: 220,
    height: 220,
    opacity: 0.9,
    position: 'absolute',
    width: 320,
  },
  pitchField: {
    backgroundColor: '#4d7c36',
    borderRadius: 120,
    height: 112,
    width: 180,
  },
  scoreBar: {
    backgroundColor: '#f97316',
    borderRadius: 999,
    height: 18,
    position: 'absolute',
    right: 24,
    top: 24,
    width: 100,
  },
  crowdGlow: {
    backgroundColor: 'rgba(56, 189, 248, 0.16)',
    borderRadius: 999,
    height: 180,
    left: -40,
    position: 'absolute',
    top: 26,
    width: 180,
  },
  tokenArt: {
    backgroundColor: '#081521',
  },
  tokenNodeCenter: {
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    borderRadius: 999,
    height: 92,
    justifyContent: 'center',
    width: 92,
    zIndex: 2,
  },
  tokenNode: {
    alignItems: 'center',
    backgroundColor: '#13273a',
    borderColor: 'rgba(148, 163, 184, 0.18)',
    borderRadius: 999,
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    position: 'absolute',
    width: 72,
  },
  tokenNodeTop: {
    top: 32,
  },
  tokenNodeLeft: {
    left: 42,
  },
  tokenNodeRight: {
    right: 42,
  },
  tokenNodeBottom: {
    bottom: 34,
  },
  tokenNodeText: {
    color: '#f8fafc',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  marketArt: {
    backgroundColor: '#09151f',
  },
  chartBarOne: {
    backgroundColor: 'rgba(34, 197, 94, 0.35)',
    borderRadius: 16,
    bottom: 46,
    height: 70,
    left: 48,
    position: 'absolute',
    width: 46,
  },
  chartBarTwo: {
    backgroundColor: 'rgba(56, 189, 248, 0.4)',
    borderRadius: 16,
    bottom: 46,
    height: 118,
    left: 110,
    position: 'absolute',
    width: 46,
  },
  chartBarThree: {
    backgroundColor: 'rgba(249, 115, 22, 0.46)',
    borderRadius: 16,
    bottom: 46,
    height: 162,
    left: 172,
    position: 'absolute',
    width: 46,
  },
  chartLine: {
    backgroundColor: '#f8fafc',
    borderRadius: 999,
    height: 6,
    position: 'absolute',
    right: 40,
    top: 84,
    transform: [{ rotate: '-18deg' }],
    width: 150,
  },
  chartToken: {
    backgroundColor: '#f59e0b',
    borderRadius: 999,
    height: 52,
    position: 'absolute',
    right: 62,
    top: 58,
    width: 52,
  },
  tractionArt: {
    backgroundColor: '#08131f',
    padding: 18,
  },
  tractionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  tractionCell: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 18,
    height: 92,
    justifyContent: 'center',
    width: 130,
  },
  tractionCellWide: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 18,
    height: 120,
    justifyContent: 'center',
    width: 272,
  },
  tractionLabel: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
  },
  tractionLabelWide: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  askArt: {
    backgroundColor: '#0a1520',
  },
  askCoin: {
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    borderRadius: 999,
    height: 110,
    justifyContent: 'center',
    width: 110,
  },
  askCoinText: {
    color: '#0f172a',
    fontSize: 42,
    fontWeight: '900',
  },
  askArrow: {
    backgroundColor: '#22c55e',
    borderRadius: 999,
    height: 12,
    position: 'absolute',
    right: 74,
    top: 116,
    transform: [{ rotate: '-22deg' }],
    width: 150,
  },
  askArrowSmall: {
    backgroundColor: '#22c55e',
    borderRadius: 999,
    height: 12,
    position: 'absolute',
    right: 60,
    top: 88,
    transform: [{ rotate: '30deg' }],
    width: 48,
  },
  askCaption: {
    bottom: 28,
    color: '#cbd5e1',
    fontSize: 18,
    fontWeight: '700',
    position: 'absolute',
    textAlign: 'center',
  },
});
