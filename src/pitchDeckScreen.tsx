import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const slides = [
  {
    eyebrow: 'GMBL Pitch Deck',
    title: 'Swipe-First Betting For Mobile-Native Players',
    body:
      'One outcome per screen. Two clear actions. Faster decisions, stronger retention, and a betting interface built for modern behavior instead of old sportsbook menus.',
    bullets: [],
    art: 'hero',
  },
  {
    eyebrow: 'The Problem',
    title: 'Most Betting Apps Still Feel Like Dense Trading Terminals',
    body: 'Legacy sportsbook UX was built for long desktop sessions, not fast thumb-driven mobile behavior.',
    bullets: [
      'Too many markets shown at once',
      'Slow path from discovery to action',
      'Back and lay mechanics feel confusing',
      'Little product identity for younger mobile users',
    ],
    art: 'problem',
  },
  {
    eyebrow: 'The Solution',
    title: 'GMBL Turns Betting Into a Swipeable Feed',
    body: 'The product reduces mental load while increasing action speed.',
    bullets: [
      'One outcome per card',
      'Back and Lay visible together',
      'Returns shown before action',
      'Instant visual feedback after bet placement',
      'Looping feed to keep momentum high',
    ],
    art: 'solution',
  },
  {
    eyebrow: 'Why It Matters',
    title: 'We Win Through Product Experience',
    body:
      'GMBL is not trying to out-menu incumbents. It is reframing how users actually interact with markets on mobile.',
    bullets: ['Faster: lower-friction path from interest to bet', 'Clearer: outcome-first UI removes ambiguity', 'Stickier: feed-native loop encourages repeat action'],
    art: 'metrics',
  },
  {
    eyebrow: 'Current Build',
    title: 'The Core Loop Is Already Working',
    body: 'This is not a concept mockup. The core product loop is already implemented.',
    bullets: [
      'Auth and wallet system',
      'Server-backed odds',
      'Settlement and payout flow',
      'Swipe betting interface',
      'Bet slips and account state',
      'Success and failure motion feedback',
    ],
    art: 'traction',
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
          <Text style={deckStyles.brand}>GMBL / Deck</Text>
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
              {slide.bullets.length ? (
                <View style={deckStyles.bullets}>
                  {slide.bullets.map((bullet) => (
                    <View key={bullet} style={deckStyles.bulletRow}>
                      <View style={deckStyles.bulletDot} />
                      <Text style={deckStyles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
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

function DeckArt({ kind }: { kind: string }) {
  if (kind === 'hero') {
    return (
      <View style={[deckStyles.artCard, deckStyles.heroArt]}>
        <View style={deckStyles.heroPhone}>
          <View style={deckStyles.heroPill} />
          <View style={deckStyles.heroLineWide} />
          <View style={deckStyles.heroLineShort} />
          <View style={deckStyles.heroButtonRow}>
            <View style={[deckStyles.heroAction, deckStyles.heroBack]} />
            <View style={[deckStyles.heroAction, deckStyles.heroLay]} />
          </View>
        </View>
        <View style={deckStyles.heroOrbitOrange} />
        <View style={deckStyles.heroOrbitBlue} />
      </View>
    );
  }

  if (kind === 'problem') {
    return (
      <View style={[deckStyles.artCard, deckStyles.problemArt]}>
        <View style={[deckStyles.problemPanel, deckStyles.problemPanelOne]} />
        <View style={[deckStyles.problemPanel, deckStyles.problemPanelTwo]} />
        <View style={[deckStyles.problemPanel, deckStyles.problemPanelThree]} />
      </View>
    );
  }

  if (kind === 'solution') {
    return (
      <View style={[deckStyles.artCard, deckStyles.solutionArt]}>
        <View style={deckStyles.solutionPhone}>
          <View style={deckStyles.solutionIndex} />
          <View style={deckStyles.solutionHeadline} />
          <View style={deckStyles.solutionSubline} />
          <View style={deckStyles.solutionActions}>
            <View style={[deckStyles.solutionAction, deckStyles.heroBack]} />
            <View style={[deckStyles.solutionAction, deckStyles.heroLay]} />
          </View>
        </View>
      </View>
    );
  }

  if (kind === 'metrics') {
    return (
      <View style={[deckStyles.artCard, deckStyles.metricsArt]}>
        <View style={deckStyles.metricTile}><Text style={deckStyles.metricBig}>Faster</Text></View>
        <View style={deckStyles.metricTile}><Text style={deckStyles.metricBig}>Clearer</Text></View>
        <View style={deckStyles.metricTile}><Text style={deckStyles.metricBig}>Stickier</Text></View>
      </View>
    );
  }

  return (
    <View style={[deckStyles.artCard, deckStyles.tractionArt]}>
      <View style={deckStyles.tractionGrid}>
        <View style={deckStyles.tractionCell} />
        <View style={deckStyles.tractionCell} />
        <View style={deckStyles.tractionCell} />
        <View style={deckStyles.tractionCellWide} />
      </View>
    </View>
  );
}

const deckStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050c15',
  },
  screen: {
    flex: 1,
    backgroundColor: '#050c15',
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
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  homeButton: {
    backgroundColor: 'rgba(249, 115, 22, 0.18)',
    borderColor: 'rgba(249, 115, 22, 0.5)',
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
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
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
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8fafc',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1.2,
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
    backgroundColor: '#f97316',
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
    minHeight: 260,
  },
  artCard: {
    alignItems: 'center',
    borderRadius: 24,
    flex: 1,
    justifyContent: 'center',
    minHeight: 260,
    overflow: 'hidden',
    position: 'relative',
  },
  heroArt: {
    backgroundColor: '#0b1727',
  },
  heroPhone: {
    backgroundColor: '#13253b',
    borderRadius: 28,
    height: 220,
    padding: 18,
    width: 180,
  },
  heroPill: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: 999,
    height: 18,
    width: 78,
  },
  heroLineWide: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    height: 52,
    marginTop: 16,
    width: '100%',
  },
  heroLineShort: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    height: 18,
    marginTop: 14,
    width: '78%',
  },
  heroButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  heroAction: {
    borderRadius: 18,
    flex: 1,
    height: 62,
  },
  heroBack: {
    backgroundColor: '#22c55e',
  },
  heroLay: {
    backgroundColor: '#ef4444',
  },
  heroOrbitOrange: {
    backgroundColor: 'rgba(249,115,22,0.18)',
    borderRadius: 999,
    height: 240,
    position: 'absolute',
    right: -70,
    top: -70,
    width: 240,
  },
  heroOrbitBlue: {
    backgroundColor: 'rgba(56,189,248,0.14)',
    borderRadius: 999,
    bottom: -90,
    height: 280,
    left: -90,
    position: 'absolute',
    width: 280,
  },
  problemArt: {
    backgroundColor: '#170d12',
  },
  problemPanel: {
    backgroundColor: '#111827',
    borderColor: 'rgba(251,146,60,0.4)',
    borderRadius: 24,
    borderWidth: 1,
    position: 'absolute',
  },
  problemPanelOne: {
    height: 120,
    left: 24,
    top: 30,
    width: 170,
  },
  problemPanelTwo: {
    height: 150,
    right: 26,
    top: 46,
    transform: [{ rotate: '-8deg' }],
    width: 190,
  },
  problemPanelThree: {
    bottom: 28,
    height: 140,
    left: 60,
    transform: [{ rotate: '7deg' }],
    width: 230,
  },
  solutionArt: {
    backgroundColor: '#091726',
  },
  solutionPhone: {
    backgroundColor: '#102339',
    borderRadius: 34,
    height: 240,
    padding: 20,
    width: 210,
  },
  solutionIndex: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 999,
    height: 18,
    width: 88,
  },
  solutionHeadline: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 20,
    height: 64,
    marginTop: 18,
    width: '100%',
  },
  solutionSubline: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    height: 18,
    marginTop: 18,
    width: '86%',
  },
  solutionActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  solutionAction: {
    borderRadius: 20,
    flex: 1,
    height: 76,
  },
  metricsArt: {
    backgroundColor: '#0a1422',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  metricTile: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(148,163,184,0.14)',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 18,
    width: '100%',
  },
  metricBig: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
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
    backgroundColor: '#111827',
    borderRadius: 18,
    height: 92,
    width: 130,
  },
  tractionCellWide: {
    backgroundColor: '#111827',
    borderRadius: 18,
    height: 120,
    width: 272,
  },
});
