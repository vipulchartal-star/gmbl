const secretKey = 'gmbl-admin-secret';

const state = {
  adminSecret: sessionStorage.getItem(secretKey) ?? '',
  selectedPlayerId: null,
};

const secretForm = document.getElementById('secret-form');
const clearSecretButton = document.getElementById('clear-secret');
const adminSecretInput = document.getElementById('admin-secret');
const searchForm = document.getElementById('search-form');
const searchQueryInput = document.getElementById('search-query');
const searchStatus = document.getElementById('search-status');
const searchResults = document.getElementById('search-results');
const marketStatus = document.getElementById('market-status');
const marketList = document.getElementById('market-list');
const playerHeading = document.getElementById('player-heading');
const playerEmpty = document.getElementById('player-empty');
const playerDetail = document.getElementById('player-detail');
const playerBalance = document.getElementById('player-balance');
const playerCreated = document.getElementById('player-created');
const playerUpdated = document.getElementById('player-updated');
const balanceForm = document.getElementById('balance-form');
const balanceValueInput = document.getElementById('balance-value');
const balanceNoteInput = document.getElementById('balance-note');
const detailStatus = document.getElementById('detail-status');
const transactionList = document.getElementById('transaction-list');
const betList = document.getElementById('bet-list');

adminSecretInput.value = state.adminSecret;

const setSecret = (value) => {
  state.adminSecret = value.trim();
  if (state.adminSecret) {
    sessionStorage.setItem(secretKey, state.adminSecret);
  } else {
    sessionStorage.removeItem(secretKey);
  }
};

const setStatus = (element, message, tone = 'muted') => {
  element.textContent = message;
  element.style.color = tone === 'error' ? '#ff8d8d' : tone === 'ok' ? '#7ee7a4' : '';
};

const money = (value) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));

const dateTime = (value) => (value ? new Date(value).toLocaleString() : '-');

const adminFetch = async (path, options = {}) => {
  if (!state.adminSecret) {
    throw new Error('Enter the admin secret first.');
  }

  const response = await fetch(path, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': state.adminSecret,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? 'Request failed.');
  }

  return payload;
};

const renderResults = (players) => {
  searchResults.innerHTML = '';

  if (!players.length) {
    searchResults.innerHTML = '<div class="history-item"><span>Results</span><strong>No players matched.</strong></div>';
    return;
  }

  for (const player of players) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'result-item';
    button.innerHTML = [
      '<span>' + player.id + '</span>',
      '<strong>@' + player.loginId + '</strong>',
      '<div>Balance ' + money(player.balance) + '</div>',
    ].join('');
    button.addEventListener('click', () => loadPlayer(player.id));
    searchResults.appendChild(button);
  }
};

const renderHistory = (container, items, renderItem) => {
  container.innerHTML = '';

  if (!items.length) {
    container.innerHTML = '<div class="history-item"><span>Empty</span><strong>No records.</strong></div>';
    return;
  }

  for (const item of items) {
    const entry = document.createElement('article');
    entry.className = 'history-item';
    entry.innerHTML = renderItem(item);
    container.appendChild(entry);
  }
};

const attachSettlementButton = (button, marketSlug, side) => {
  button.addEventListener('click', async () => {
    setStatus(marketStatus, 'Settling ' + marketSlug + '...');
    try {
      const payload = await adminFetch('/admin/markets/' + encodeURIComponent(marketSlug) + '/settle', {
        method: 'POST',
        body: { side },
      });
      setStatus(
        marketStatus,
        marketSlug + ' settled to ' + side.toUpperCase() + '. ' + payload.payoutCount + ' payout(s), total ' + money(payload.totalPayout) + '.',
        'ok',
      );
      await loadMarkets();
    } catch (error) {
      setStatus(marketStatus, error.message, 'error');
    }
  });
};

const renderMarkets = (markets) => {
  marketList.innerHTML = '';

  if (!markets.length) {
    marketList.innerHTML = '<div class="history-item"><span>Markets</span><strong>No markets found.</strong></div>';
    return;
  }

  for (const market of markets) {
    const card = document.createElement('article');
    card.className = 'history-item market-card';
    card.innerHTML = [
      '<span>' + market.slug + '</span>',
      '<strong>' + market.question + '</strong>',
      '<div>Status ' + market.status + '</div>',
      '<div>Pool YES ' + money(market.yesPool) + ' / NO ' + money(market.noPool) + '</div>',
      '<div>Settled ' + (market.settledSide ? market.settledSide.toUpperCase() : '-') + '</div>',
    ].join('');

    const actions = document.createElement('div');
    actions.className = 'market-actions';

    const yesButton = document.createElement('button');
    yesButton.type = 'button';
    yesButton.className = 'primary-button';
    yesButton.textContent = 'Settle YES / BACK';

    const noButton = document.createElement('button');
    noButton.type = 'button';
    noButton.className = 'ghost-button';
    noButton.textContent = 'Settle NO / LAY';

    attachSettlementButton(yesButton, market.slug, 'yes');
    attachSettlementButton(noButton, market.slug, 'no');

    actions.appendChild(yesButton);
    actions.appendChild(noButton);
    card.appendChild(actions);
    marketList.appendChild(card);
  }
};

const loadMarkets = async () => {
  setStatus(marketStatus, 'Loading markets...');
  try {
    const payload = await adminFetch('/admin/markets');
    renderMarkets(payload.markets);
    setStatus(marketStatus, String(payload.markets.length) + ' market(s) loaded.', 'ok');
  } catch (error) {
    renderMarkets([]);
    setStatus(marketStatus, error.message, 'error');
  }
};

const showPlayer = (payload) => {
  state.selectedPlayerId = payload.player.id;
  playerHeading.textContent = '@' + payload.player.loginId;
  playerBalance.textContent = money(payload.player.balance);
  playerCreated.textContent = dateTime(payload.player.createdAt);
  playerUpdated.textContent = dateTime(payload.player.updatedAt);
  balanceValueInput.value = Number(payload.player.balance).toFixed(2);
  playerEmpty.classList.add('hidden');
  playerDetail.classList.remove('hidden');

  renderHistory(
    transactionList,
    payload.recentTransactions,
    (item) => [
      '<span>' + dateTime(item.createdAt) + '</span>',
      '<strong>' + item.kind + '</strong>',
      '<div class="' + (item.amountDelta >= 0 ? 'money-plus' : 'money-minus') + '">'
        + (item.amountDelta >= 0 ? '+' : '') + money(item.amountDelta) + '</div>',
      '<div>After ' + money(item.balanceAfter) + '</div>',
      '<div>' + (item.note ?? '') + '</div>',
    ].join(''),
  );

  renderHistory(
    betList,
    payload.recentBets,
    (item) => [
      '<span>' + dateTime(item.createdAt) + '</span>',
      '<strong>' + item.side.toUpperCase() + ' bet</strong>',
      '<div>' + money(item.amount) + '</div>',
      '<div>' + item.marketSlug + '</div>',
    ].join(''),
  );
};

const loadPlayer = async (playerId) => {
  setStatus(detailStatus, 'Loading player...');

  try {
    const payload = await adminFetch('/admin/users/' + encodeURIComponent(playerId));
    showPlayer(payload);
    setStatus(detailStatus, 'Player loaded.', 'ok');
  } catch (error) {
    setStatus(detailStatus, error.message, 'error');
  }
};

secretForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setSecret(adminSecretInput.value);
  setStatus(
    searchStatus,
    state.adminSecret ? 'Secret saved for this session.' : 'Secret cleared.',
    state.adminSecret ? 'ok' : 'muted',
  );

  if (state.adminSecret) {
    await loadMarkets();
  } else {
    renderMarkets([]);
    setStatus(marketStatus, 'Secret cleared.', 'ok');
  }
});

clearSecretButton.addEventListener('click', () => {
  adminSecretInput.value = '';
  setSecret('');
  setStatus(searchStatus, 'Secret cleared.', 'ok');
  renderMarkets([]);
  setStatus(marketStatus, 'Secret cleared.', 'ok');
});

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = searchQueryInput.value.trim();

  if (query.length < 2) {
    setStatus(searchStatus, 'Enter at least 2 characters.', 'error');
    return;
  }

  setStatus(searchStatus, 'Searching...');

  try {
    const payload = await adminFetch('/admin/users/search?q=' + encodeURIComponent(query));
    renderResults(payload.players);
    setStatus(searchStatus, String(payload.players.length) + ' player(s) found.', 'ok');
  } catch (error) {
    renderResults([]);
    setStatus(searchStatus, error.message, 'error');
  }
});

balanceForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!state.selectedPlayerId) {
    setStatus(detailStatus, 'Select a player first.', 'error');
    return;
  }

  const balance = Number(balanceValueInput.value);

  if (!Number.isFinite(balance) || balance < 0) {
    setStatus(detailStatus, 'Balance must be a non-negative number.', 'error');
    return;
  }

  setStatus(detailStatus, 'Updating balance...');

  try {
    await adminFetch('/admin/users/' + encodeURIComponent(state.selectedPlayerId) + '/balance', {
      method: 'POST',
      body: {
        balance,
        note: balanceNoteInput.value.trim(),
      },
    });

    balanceNoteInput.value = '';
    setStatus(detailStatus, 'Balance updated.', 'ok');
    await loadPlayer(state.selectedPlayerId);
  } catch (error) {
    setStatus(detailStatus, error.message, 'error');
  }
});

if (state.adminSecret) {
  loadMarkets();
}
