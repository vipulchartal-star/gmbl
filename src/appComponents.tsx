import { memo, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, FlatList, Image, Platform, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';

import { styles } from './appStyles';
import { chipAmounts, type AuthMode, type BetCard, type BetChoiceKey, type BetOption, type BetSlip, type ExternalOddsResponse, type Market, type SessionState } from './appTypes';

type HeaderProps = {
  authMode: AuthMode;
  session: SessionState | null;
};

export function ScreenHeader({ authMode, session }: HeaderProps) {
  return (
    <>
      <Text style={styles.eyebrow}>{session ? 'Ball Markets' : 'Login'}</Text>
      <Text style={styles.title}>{session ? 'GMBL' : authMode === 'signup' ? 'Create Account' : 'Welcome Back'}</Text>
      <Text style={styles.subtitle}>
        {session
          ? 'Swipe ball by ball, then back or lay the exact outcome you want for that delivery.'
          : authMode === 'signup'
            ? 'Create your account with only login id and password.'
            : 'Enter your login id and password. After login you can swipe through markets and place bets instantly.'}
      </Text>
    </>
  );
}


type AuthHeroCardProps = {
  authBusy: boolean;
  authMode: AuthMode;
  loginId: string;
  onChangeLoginId: (value: string) => void;
  onChangePassword: (value: string) => void;
  onGenerateCredentials: () => void;
  onLoginMode: () => void;
  onSignupMode: () => void;
  onSubmit: () => void;
  onUploadLoginFile: () => void;
  password: string;
  sessionLoading: boolean;
};

export function AuthHeroCard({
  authBusy,
  authMode,
  loginId,
  onChangeLoginId,
  onChangePassword,
  onGenerateCredentials,
  onLoginMode,
  onSignupMode,
  onSubmit,
  onUploadLoginFile,
  password,
  sessionLoading,
}: AuthHeroCardProps) {
  const isSignup = authMode === 'signup';

  return (
    <View style={styles.heroShell}>
      <View style={styles.heroGlowPrimary} />
      <View style={styles.heroGlowSecondary} />
      <View style={styles.heroCard}>
        <View style={styles.heroBadgeRow}>
          <Text style={styles.heroBadge}>Live cricket exchange</Text>
          <Text style={styles.heroBadgeMuted}>{isSignup ? 'New account' : 'Member login'}</Text>
        </View>
        <View style={styles.heroCopyBlock}>
          <Text style={styles.heroTitle}>One sharp card. No clutter.</Text>
          <Text style={styles.heroSubtitle}>
            {isSignup
              ? 'Create your GMBL account and land straight into the market board.'
              : 'Sign in and get directly to the active ball-by-ball betting flow.'}
          </Text>
        </View>
        <View style={styles.heroStatRow}>
          <View style={styles.heroStatChip}>
            <Text style={styles.heroStatValue}>IPL</Text>
            <Text style={styles.heroStatLabel}>Match focus</Text>
          </View>
          <View style={styles.heroStatChip}>
            <Text style={styles.heroStatValue}>2-way</Text>
            <Text style={styles.heroStatLabel}>Back or lay</Text>
          </View>
          <View style={styles.heroStatChip}>
            <Text style={styles.heroStatValue}>Fast</Text>
            <Text style={styles.heroStatLabel}>Instant entry</Text>
          </View>
        </View>
        <View style={styles.heroFormCard}>
          {sessionLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color="#ffd166" />
            </View>
          ) : (
            <>
              <Text style={styles.heroFormTitle}>{isSignup ? 'Create account' : 'Enter account'}</Text>
              <TextInput
                autoCapitalize="none"
                value={loginId}
                onChangeText={onChangeLoginId}
                placeholder="login id"
                placeholderTextColor="#7c8aa5"
                style={styles.heroInput}
              />
              <TextInput
                secureTextEntry
                value={password}
                onChangeText={onChangePassword}
                placeholder="password"
                placeholderTextColor="#7c8aa5"
                style={styles.heroInput}
              />
              <Pressable style={styles.heroPrimaryButton} disabled={authBusy} onPress={onSubmit}>
                <Text style={styles.heroPrimaryButtonText}>{authBusy ? 'Working...' : isSignup ? 'Create account' : 'Login now'}</Text>
              </Pressable>
              <View style={styles.heroLinkRow}>
                {isSignup ? (
                  <>
                    <Pressable onPress={onGenerateCredentials}>
                      <Text style={styles.heroTextLink}>Generate credentials</Text>
                    </Pressable>
                    <Pressable onPress={onLoginMode}>
                      <Text style={styles.heroTextLink}>Back to login</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Pressable onPress={onUploadLoginFile}>
                      <Text style={styles.heroTextLink}>Use credential file</Text>
                    </Pressable>
                    <Pressable onPress={onSignupMode}>
                      <Text style={styles.heroTextLink}>Create account</Text>
                    </Pressable>
                  </>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

type AccountCardProps = {
  authBusy: boolean;
  authMode: AuthMode;
  loginId: string;
  onChangeLoginId: (value: string) => void;
  onChangePassword: (value: string) => void;
  onGenerateCredentials: () => void;
  onLoginMode: () => void;
  onLogout: () => void;
  onSignupMode: () => void;
  onSubmit: () => void;
  onToggleBetSlips?: () => void;
  onUploadLoginFile: () => void;
  password: string;
  session: SessionState | null;
  sessionLoading: boolean;
  betSlipCount?: number;
  betSlipsOpen?: boolean;
  balanceAlertTick?: number;
};

export function AccountCard({
  authBusy,
  authMode,
  loginId,
  onChangeLoginId,
  onChangePassword,
  onGenerateCredentials,
  onLoginMode,
  onLogout,
  onSignupMode,
  onSubmit,
  onToggleBetSlips,
  onUploadLoginFile,
  password,
  session,
  sessionLoading,
  betSlipCount = 0,
  betSlipsOpen = false,
  balanceAlertTick = 0,
}: AccountCardProps) {
  const isSignup = authMode === 'signup';
  const balanceShakeX = useRef(new Animated.Value(0)).current;
  const [balanceAlert, setBalanceAlert] = useState(false);

  useEffect(() => {
    if (balanceAlertTick <= 0) {
      return;
    }

    setBalanceAlert(true);
    Animated.sequence([
      Animated.timing(balanceShakeX, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(balanceShakeX, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(balanceShakeX, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(balanceShakeX, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(balanceShakeX, { toValue: 0, duration: 45, useNativeDriver: true }),
    ]).start(() => setBalanceAlert(false));
  }, [balanceAlertTick, balanceShakeX]);

  return (
    <View style={session ? styles.sessionStrip : styles.card}>
      {sessionLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color="#f97316" />
        </View>
      ) : session ? (
        <View style={styles.accountTopBar}>
          <View style={styles.accountSlimMeta}>
            <Text style={styles.accountTag}>@{session.user.loginId}</Text>
            <Text style={styles.accountDot}>•</Text>
            <Animated.View
              style={[styles.balanceBadge, balanceAlert ? styles.balanceBadgeAlert : null, { transform: [{ translateX: balanceShakeX }] }]}
            >
              <Text style={[styles.accountBalance, balanceAlert ? styles.accountBalanceAlert : null]}>
                Bal <AnimatedNumber value={session.user.balance} decimals={2} />
              </Text>
            </Animated.View>
          </View>
          <View style={styles.accountActions}>
            <Pressable style={[styles.topBarPill, betSlipsOpen ? styles.topBarPillActive : null]} onPress={onToggleBetSlips}>
              <Text style={styles.topBarPillText}>Slips {betSlipCount}</Text>
            </Pressable>
            <Pressable style={styles.inlineLogoutButton} onPress={onLogout}>
              <Text style={styles.inlineLogoutText}>Logout</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          <TextInput
            autoCapitalize="none"
            value={loginId}
            onChangeText={onChangeLoginId}
            placeholder="login id"
            placeholderTextColor="#6b7280"
            style={styles.input}
          />
          <TextInput
            secureTextEntry
            value={password}
            onChangeText={onChangePassword}
            placeholder="password"
            placeholderTextColor="#6b7280"
            style={styles.input}
          />
          <Pressable style={styles.primaryButton} disabled={authBusy} onPress={onSubmit}>
            <Text style={styles.primaryButtonText}>
              {authBusy ? 'Working...' : isSignup ? 'Create Account' : 'Login'}
            </Text>
          </Pressable>

          {isSignup ? (
            <>
              <Pressable onPress={onGenerateCredentials}>
                <Text style={styles.textLink}>Generate credentials for me</Text>
              </Pressable>
              <Pressable onPress={onLoginMode}>
                <Text style={styles.textLink}>Already have an account? Login</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable onPress={onUploadLoginFile}>
                <Text style={styles.textLink}>Use credential file</Text>
              </Pressable>
              <Pressable onPress={onSignupMode}>
                <Text style={styles.textLink}>Need an account? Create one</Text>
              </Pressable>
            </>
          )}
        </>
      )}
    </View>
  );
}

type BetSwiperProps = {
  bets: BetCard[];
  betAmount: string;
  cardHeight: number;
  currentIndex: number;
  celebratingBetId: string | null;
  onChangeBetAmount: (value: string) => void;
  onIndexChange: (index: number) => void;
  onPlaceBet: (option: BetOption, choiceKey: BetChoiceKey) => void;
  submittingBetId: string | null;
};

const showHelpDialog = (title: string, message: string) => {
  if (Platform.OS === 'web' && typeof globalThis.alert === 'function') {
    globalThis.alert(title + '\n\n' + message);
    return;
  }

  Alert.alert(title, message);
};


const teamDomainMap: Record<string, string> = {
  mi: 'mumbaiindians.com',
  'mumbai indians': 'mumbaiindians.com',
  kkr: 'kkr.in',
  'kolkata knight riders': 'kkr.in',
  csk: 'chennaisuperkings.com',
  'chennai super kings': 'chennaisuperkings.com',
  rcb: 'royalchallengers.com',
  'royal challengers bengaluru': 'royalchallengers.com',
  'royal challengers bangalore': 'royalchallengers.com',
  dc: 'delhicapitals.in',
  'delhi capitals': 'delhicapitals.in',
  'delhi daredevils': 'delhicapitals.in',
  rr: 'rajasthanroyals.com',
  'rajasthan royals': 'rajasthanroyals.com',
  pbks: 'punjabkingsipl.in',
  'punjab kings': 'punjabkingsipl.in',
  'kings xi punjab': 'punjabkingsipl.in',
  srh: 'sunrisershyderabad.in',
  'sunrisers hyderabad': 'sunrisershyderabad.in',
  lsg: 'lucknowsupergiants.in',
  'lucknow super giants': 'lucknowsupergiants.in',
  gt: 'gujarattitansipl.com',
  'gujarat titans': 'gujarattitansipl.com',
};

const normalizeTeamKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

const getTeamLogoUri = (teamName: string) => {
  const domain = teamDomainMap[normalizeTeamKey(teamName)];
  return domain ? 'https://www.google.com/s2/favicons?sz=128&domain_url=' + encodeURIComponent('https://' + domain) : null;
};

const parseMatchTeams = (match: string) => {
  const parts = match.split(/\s+vs\s+/i).map((part) => part.trim()).filter(Boolean);
  return parts.slice(0, 2);
};

function TeamLogoStack({ teams, compact = false }: { teams: string[]; compact?: boolean }) {
  const uniqueTeams = teams.filter((team, index) => team && teams.indexOf(team) === index).slice(0, 2);

  return (
    <View style={[styles.teamLogoStack, compact ? styles.teamLogoStackCompact : null]}>
      {uniqueTeams.map((team) => {
        const uri = getTeamLogoUri(team);
        return uri ? (
          <Image
            key={team}
            source={{ uri }}
            style={[styles.teamLogoImage, compact ? styles.teamLogoImageCompact : null]}
          />
        ) : (
          <View key={team} style={[styles.teamLogoFallback, compact ? styles.teamLogoImageCompact : null]}>
            <Text style={styles.teamLogoFallbackText}>{team.slice(0, 2).toUpperCase()}</Text>
          </View>
        );
      })}
    </View>
  );
}

type BetSlideCardProps = {
  bet: BetCard;
  betAmount: string;
  cardHeight: number;
  celebratingBetId: string | null;
  index: number;
  onChangeBetAmount: (value: string) => void;
  onPlaceBet: (option: BetOption, choiceKey: BetChoiceKey) => void;
  submittingBetId: string | null;
  total: number;
};

const BetSlideCard = memo(function BetSlideCard({
  bet,
  betAmount,
  cardHeight,
  celebratingBetId,
  index,
  onChangeBetAmount,
  onPlaceBet,
  submittingBetId,
  total,
}: BetSlideCardProps) {
  const amountValue = Number(betAmount);
  const stake = Number.isFinite(amountValue) && amountValue > 0 ? amountValue : 0;
  const helpText = bet.options
    .map((option) => [option.optionLabel, option.back.meaning, option.back.winText].join(String.fromCharCode(10)))
    .join(String.fromCharCode(10) + String.fromCharCode(10));

  return (
    <View style={[styles.betSlide, { minHeight: cardHeight }]}>
      <View style={[styles.betSlideInner, styles.betSlideDual]}>
        <View style={styles.betHeroTop}>
          <Text style={styles.betHeroIndex}>{index + 1} / {total}</Text>
          <Text style={styles.betHeroMarket}>{bet.market}</Text>
        </View>
        <View style={styles.betHeroBodyCompact}>
          <Text style={styles.betHeroMatch}>{bet.match}</Text>
          <Text style={styles.betHeroTitleCompact}>{bet.title}</Text>
          <Text style={styles.betHeroHintFull}>{bet.subtitle}</Text>
        </View>
        <View style={styles.betActionPanel}>
          <View style={styles.betActionHeader}>
            <Text style={styles.betActionTitle}>Stake</Text>
            <Pressable style={styles.helpButton} onPress={() => showHelpDialog(bet.title, helpText)}>
              <Text style={styles.helpButtonText}>?</Text>
            </Pressable>
          </View>
          <TextInput
            keyboardType="numeric"
            value={betAmount}
            onChangeText={onChangeBetAmount}
            placeholder="10"
            placeholderTextColor="#94a3b8"
            style={styles.betAmountInput}
          />
          <View style={styles.chipRow}>
            {chipAmounts.map((amount) => (
              <Pressable key={amount} style={styles.chip} onPress={() => onChangeBetAmount(String(amount))}>
                <Text style={styles.chipText}>{amount}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.settlementNote}>Each row below is one possible outcome for this ball. Choose the outcome, then Back or Lay it.</Text>
          <ScrollView style={styles.ballOptionList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {bet.options.map((option) => {
              const backBetId = option.id + ':back';
              const layBetId = option.id + ':lay';
              const backSubmitting = submittingBetId === backBetId;
              const laySubmitting = submittingBetId === layBetId;
              const backReturn = stake * option.back.odds;
              const layReturn = stake * option.lay.odds;

              return (
                <View key={option.id} style={styles.ballOptionCard}>
                  <View style={styles.ballOptionHeader}>
                    <View style={styles.ballOptionLabelWrap}>
                      <Text style={styles.ballOptionLabel}>{option.optionLabel}</Text>
                      <Text style={styles.ballOptionMeta}>{option.outcomeLabel}</Text>
                    </View>
                  </View>
                  <View style={styles.ballOptionButtonRow}>
                    <Pressable
                      style={[styles.ballOptionButton, styles.actionBetButtonBack]}
                      disabled={submittingBetId !== null}
                      onPress={() => onPlaceBet(option, 'back')}
                    >
                      <ButtonBurst active={celebratingBetId === backBetId} />
                      <Text style={styles.ballOptionButtonSide}>BACK</Text>
                      <Text style={styles.ballOptionButtonOdds}>{option.back.odds.toFixed(2)}x</Text>
                      <Text style={styles.ballOptionButtonCta}>{backSubmitting ? 'Placing...' : 'Bet ' + option.optionLabel}</Text>
                      <Text style={styles.ballOptionButtonMeta}>Return {backReturn.toFixed(2)} • Profit {(backReturn - stake).toFixed(2)}</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.ballOptionButton, styles.actionBetButtonLay]}
                      disabled={submittingBetId !== null}
                      onPress={() => onPlaceBet(option, 'lay')}
                    >
                      <ButtonBurst active={celebratingBetId === layBetId} />
                      <Text style={styles.ballOptionButtonSide}>LAY</Text>
                      <Text style={styles.ballOptionButtonOdds}>{option.lay.odds.toFixed(2)}x</Text>
                      <Text style={styles.ballOptionButtonCta}>{laySubmitting ? 'Placing...' : 'Bet Against'}</Text>
                      <Text style={styles.ballOptionButtonMeta}>Return {layReturn.toFixed(2)} • Profit {(layReturn - stake).toFixed(2)}</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </View>
  );
});

export function BetSwiper({
  bets,
  betAmount,
  cardHeight,
  currentIndex,
  celebratingBetId,
  onChangeBetAmount,
  onIndexChange,
  onPlaceBet,
  submittingBetId,
}: BetSwiperProps) {
  const listRef = useRef<FlatList<BetCard> | null>(null);

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: currentIndex * cardHeight, animated: true });
  }, [cardHeight, currentIndex]);

  return (
    <FlatList
      ref={listRef}
      data={bets}
      style={styles.swiper}
      contentContainerStyle={styles.swiperContent}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
      initialNumToRender={2}
      maxToRenderPerBatch={2}
      windowSize={3}
      keyExtractor={(item) => item.id}
      getItemLayout={(_, index) => ({ length: cardHeight, offset: cardHeight * index, index })}
      onMomentumScrollEnd={(event) => {
        const nextIndex = Math.round(event.nativeEvent.contentOffset.y / cardHeight);
        onIndexChange(Math.max(0, Math.min(nextIndex, bets.length - 1)));
      }}
      renderItem={({ item, index }) => (
        <BetSlideCard
          bet={item}
          betAmount={betAmount}
          cardHeight={cardHeight}
          celebratingBetId={celebratingBetId}
          index={index}
          onChangeBetAmount={onChangeBetAmount}
          onPlaceBet={onPlaceBet}
          submittingBetId={submittingBetId}
          total={bets.length}
        />
      )}
    />
  );
}

const burstVectors = [
  { x: -26, y: -18, color: '#f97316' },
  { x: 0, y: -28, color: '#fb7185' },
  { x: 24, y: -16, color: '#38bdf8' },
  { x: -22, y: 18, color: '#facc15' },
  { x: 0, y: 26, color: '#34d399' },
  { x: 24, y: 18, color: '#c084fc' },
];

function ButtonBurst({ active }: { active: boolean }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      progress.setValue(0);
      return;
    }

    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [active, progress]);

  if (!active) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.buttonBurst}>
      {burstVectors.map((particle, index) => (
        <Animated.View
          key={String(index)}
          style={[
            styles.buttonBurstParticle,
            {
              backgroundColor: particle.color,
              opacity: progress.interpolate({ inputRange: [0, 0.75, 1], outputRange: [0, 1, 0] }),
              transform: [
                { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, particle.x] }) },
                { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, particle.y] }) },
                { scale: progress.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.3, 1, 0.7] }) },
                { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', particle.x > 0 ? '28deg' : '-28deg'] }) },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}


export function ViewModeToggle({
  view,
  onChangeView,
}: {
  view: 'swipe' | 'board';
  onChangeView: (view: 'swipe' | 'board') => void;
}) {
  return (
    <View style={styles.viewToggleRow}>
      <Pressable
        style={[styles.viewTogglePill, view === 'swipe' ? styles.viewTogglePillActive : null]}
        onPress={() => onChangeView('swipe')}
      >
        <Text style={styles.viewToggleText}>Swipe</Text>
      </Pressable>
      <Pressable
        style={[styles.viewTogglePill, view === 'board' ? styles.viewTogglePillActive : null]}
        onPress={() => onChangeView('board')}
      >
        <Text style={styles.viewToggleText}>Board</Text>
      </Pressable>
    </View>
  );
}

type MarketBoardProps = {
  bets: BetCard[];
  betAmount: string;
  celebratingBetId: string | null;
  externalOdds: ExternalOddsResponse | null;
  externalOddsLoading: boolean;
  onChangeBetAmount: (value: string) => void;
  onPlaceBet: (option: BetOption, choiceKey: BetChoiceKey) => void;
  submittingBetId: string | null;
};

export function MarketBoard({
  bets,
  betAmount,
  celebratingBetId,
  externalOdds,
  externalOddsLoading,
  onChangeBetAmount,
  onPlaceBet,
  submittingBetId,
}: MarketBoardProps) {
  const { width } = useWindowDimensions();
  const isCompactBoard = width < 680;
  const amountValue = Number(betAmount);
  const stake = Number.isFinite(amountValue) && amountValue > 0 ? amountValue : 0;

  return (
    <ScrollView style={styles.marketBoard} contentContainerStyle={styles.marketBoardContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.marketBoardToolbarDense, isCompactBoard ? styles.marketBoardToolbarDenseCompact : null]}>
        <View style={styles.marketBoardToolbarCopy}>
          <Text style={styles.marketBoardTitle}>Exchange Board</Text>
          <Text style={styles.marketBoardToolbarMeta}>Compact ladder view with direct back and lay execution.</Text>
        </View>
        <TextInput
          keyboardType="numeric"
          value={betAmount}
          onChangeText={onChangeBetAmount}
          placeholder="10"
          placeholderTextColor="#94a3b8"
          style={[styles.betAmountInput, styles.marketBoardStakeInput]}
        />
      </View>
      <View style={styles.chipRow}>
        {chipAmounts.map((amount) => (
          <Pressable key={amount} style={styles.chip} onPress={() => onChangeBetAmount(String(amount))}>
            <Text style={styles.chipText}>{amount}</Text>
          </Pressable>
        ))}
      </View>
      <View style={[styles.marketBoardSummaryBar, isCompactBoard ? styles.marketBoardSummaryBarCompact : null]}>
        <Text style={styles.marketBoardSummaryText}>Stake {stake.toFixed(2)}</Text>
        <Text style={styles.marketBoardSummaryText}>Markets {bets.length}</Text>
      </View>
      <ScrollView horizontal={!isCompactBoard} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.marketBoardTableScrollContent}>
        <View style={[styles.marketBoardTable, isCompactBoard ? styles.marketBoardTableCompact : null]}>
          {isCompactBoard ? null : (
            <View style={styles.marketBoardHeaderRow}>
              <Text style={[styles.marketBoardHeaderCell, styles.marketBoardHeaderSelection]}>Selection</Text>
              <Text style={[styles.marketBoardHeaderCell, styles.marketBoardHeaderPrice]}>Back</Text>
              <Text style={[styles.marketBoardHeaderCell, styles.marketBoardHeaderPrice]}>Lay</Text>
              <Text style={[styles.marketBoardHeaderCell, styles.marketBoardHeaderAction]}>Action</Text>
            </View>
          )}
          {bets.map((bet) => (
            <View key={bet.id} style={styles.marketBoardGroup}>
              <View style={[styles.marketBoardGroupBar, isCompactBoard ? styles.marketBoardGroupBarCompact : null]}>
                <TeamLogoStack teams={parseMatchTeams(bet.match)} compact={isCompactBoard} />
                <View style={styles.marketBoardGroupCopy}>
                  <Text style={styles.marketBoardGroupEyebrow}>{bet.market}</Text>
                  <Text style={styles.marketBoardGroupTitle}>{bet.title}</Text>
                </View>
                <Text style={[styles.marketBoardGroupMatch, isCompactBoard ? styles.marketBoardGroupMatchCompact : null]}>{bet.match}</Text>
              </View>
              {bet.options.map((option) => {
                const backBetId = option.id + ':back';
                const layBetId = option.id + ':lay';
                const backSubmitting = submittingBetId === backBetId;
                const laySubmitting = submittingBetId === layBetId;
                const backReturn = stake * option.back.odds;
                const layReturn = stake * option.lay.odds;

                return (
                  <View key={option.id} style={[styles.marketBoardGridRow, isCompactBoard ? styles.marketBoardGridRowCompact : null]}>
                    <View style={[styles.marketBoardSelectionCell, isCompactBoard ? styles.marketBoardSelectionCellCompact : null]}>
                      <Text style={styles.marketBoardSelectionLabel}>{option.optionLabel}</Text>
                      <Text style={styles.marketBoardSelectionMeta}>{option.outcomeLabel}</Text>
                    </View>
                    <Pressable
                      style={[styles.marketBoardPriceCell, styles.marketBoardBackCell, isCompactBoard ? styles.marketBoardPriceCellCompact : null]}
                      disabled={submittingBetId !== null}
                      onPress={() => onPlaceBet(option, 'back')}
                    >
                      <ButtonBurst active={celebratingBetId === backBetId} />
                      <Text style={styles.marketBoardPriceOdds}>{option.back.odds.toFixed(2)}</Text>
                      <Text style={styles.marketBoardPriceSub}>{backReturn.toFixed(2)} rtn</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.marketBoardPriceCell, styles.marketBoardLayCell, isCompactBoard ? styles.marketBoardPriceCellCompact : null]}
                      disabled={submittingBetId !== null}
                      onPress={() => onPlaceBet(option, 'lay')}
                    >
                      <ButtonBurst active={celebratingBetId === layBetId} />
                      <Text style={styles.marketBoardPriceOdds}>{option.lay.odds.toFixed(2)}</Text>
                      <Text style={styles.marketBoardPriceSub}>{layReturn.toFixed(2)} rtn</Text>
                    </Pressable>
                    <View style={[styles.marketBoardExecCell, isCompactBoard ? styles.marketBoardExecCellCompact : null]}>
                      <Text style={styles.marketBoardExecTop}>{backSubmitting ? 'Placing Back' : laySubmitting ? 'Placing Lay' : 'Tap price to bet'}</Text>
                      <Text style={styles.marketBoardExecBottom}>Stake {stake.toFixed(2)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.marketBoardSection}>
        <Text style={styles.marketBoardSectionTitle}>External Cricket Odds</Text>
        {externalOddsLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#f97316" />
          </View>
        ) : externalOdds?.events.length ? (
          externalOdds.events.map((event) => (
            <View key={event.id} style={styles.marketBoardExternalCard}>
              <View style={styles.marketBoardExternalTitleRow}>
                <TeamLogoStack teams={[event.homeTeam, event.awayTeam]} compact />
                <Text style={styles.marketBoardExternalTitle}>{event.homeTeam} vs {event.awayTeam}</Text>
              </View>
              <Text style={styles.marketBoardExternalMeta}>{new Date(event.commenceTime).toLocaleString()} • {event.sportTitle}</Text>
              {event.bookmakers.map((bookmaker) => (
                <View key={bookmaker.key} style={styles.marketBoardExternalBookmaker}>
                  <Text style={styles.marketBoardExternalBookmakerTitle}>{bookmaker.title}</Text>
                  {bookmaker.markets.map((market) => (
                    <View key={bookmaker.key + ':' + market.key} style={styles.marketBoardExternalMarket}>
                      <Text style={styles.marketBoardExternalMarketKey}>{market.key}</Text>
                      {market.outcomes.map((outcome) => (
                        <View key={market.key + ':' + outcome.name} style={styles.marketBoardExternalOutcomeRow}>
                          <Text style={styles.marketBoardExternalOutcomeName}>{outcome.name}</Text>
                          <Text style={styles.marketBoardExternalOutcomePrice}>{outcome.price}{outcome.point !== undefined ? ' • ' + outcome.point : ''}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))
        ) : (
          <Text style={styles.betSlipsEmpty}>No external odds returned from The Odds API.</Text>
        )}
      </View>
    </ScrollView>
  );
}

type BetSlipsPanelProps = {
  slips: BetSlip[];
  markets: Market[];
  loading: boolean;
};

export function BetSlipsPanel({ slips, markets, loading }: BetSlipsPanelProps) {
  const findMarket = (marketSlug: string) => markets.find((market) => market.slug === marketSlug);

  return (
    <View style={styles.betSlipsPopover}>
      <View style={styles.betSlipsCard}>
        <View style={styles.betSlipsHeader}>
          <Text style={styles.betSlipsTitle}>Bet Slips</Text>
          <Text style={styles.betSlipsCount}>{slips.length}</Text>
        </View>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#f97316" />
          </View>
        ) : !slips.length ? (
          <Text style={styles.betSlipsEmpty}>Your placed bets will show here.</Text>
        ) : (
          <ScrollView style={styles.betSlipsList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {slips.map((slip) => {
              const market = findMarket(slip.marketSlug);
              const title = market
                ? 'Over ' + (market.over ?? '-') + ' Ball ' + (market.ball ?? '-') + ' • ' + (market.optionLabel ?? (slip.side === 'yes' ? market.backLabel : market.layLabel))
                : slip.marketSlug;
              const returns = slip.amount * slip.odds;

              return (
                <View key={slip.id} style={styles.betSlipItem}>
                  <View style={styles.betSlipTopRow}>
                    <Text style={styles.betSlipTitle}>{title}</Text>
                    <Text style={styles.betSlipAmount}>{slip.amount.toFixed(2)}</Text>
                  </View>
                  <Text style={styles.betSlipMeta}>
                    Odds {slip.odds.toFixed(2)}x • Return {returns.toFixed(2)}
                  </Text>
                  <Text style={styles.betSlipMeta}>{new Date(slip.createdAt).toLocaleString()}</Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

export function SwipeIndicator({ currentIndex, total }: { currentIndex: number; total: number }) {
  return <Text style={styles.swipeIndicator}>Card {currentIndex + 1} of {total}</Text>;
}

export function WarningCard({ errorText }: { errorText: string }) {
  return (
    <View style={styles.warningCard}>
      <Text style={styles.warningTitle}>Connection Issue</Text>
      <Text style={styles.warningText}>{errorText}</Text>
    </View>
  );
}

function AnimatedNumber({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const delta = value - startValue;

    if (delta === 0) {
      setDisplayValue(value);
      return;
    }

    const startedAt = Date.now();
    const duration = 450;
    let animationFrame = 0;

    const updateValue = () => {
      const progress = Math.min((Date.now() - startedAt) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const nextValue = startValue + delta * eased;
      setDisplayValue(nextValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateValue);
      }
    };

    animationFrame = requestAnimationFrame(updateValue);
    previousValueRef.current = value;

    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  return <>{prefix + displayValue.toFixed(decimals) + suffix}</>;
}
