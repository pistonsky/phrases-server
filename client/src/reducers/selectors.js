export const getUserId = state => state.auth.id;
export const getFacebookConnected = state => state.auth.facebook_connected;
export const shouldShowConnectFacebookModal = state =>
  anyUnsyncedPhrases(state) === 0 &&
  !getFacebookConnected(state) &&
  state.analytics.show_facebook_modal;
export const facebookConnectInProgress = state =>
  state.auth.facebook_connect_in_progress;

export const getDataLoading = state => state.main.data_loading;
export const getAddNewModalShown = state => state.main.add_new_modal_shown;
export const getRecordingPermissions = state =>
  state.main.recording_permissions;
export const shouldShowRecordingPermissionsSecondaryModal = state =>
  state.ui.show_recording_permissions_modal;
export const shouldShowPhraseModal = state => state.ui.show_phrase_modal;

export const getOriginalPhrase = state => state.form.original;
export const getTranslatedPhrase = state => state.form.translated;
export const getCurrentFormPage = state => state.form.current_page;

export const getWelcomeScreens = state => state.main.guide;
export const getOffline = state => state.main.offline;

export const getDictionaries = state => state.main.dictionaries;
export const shouldShowDictionariesSelectorModal = state =>
  state.ui.show_dictionaries_selector;
export const getCurrentDictionaryName = state => {
  return (state.main.dictionaries.find(e => e.selected) || {
    name: 'Phrazes',
    selected: true
  }).name;
};

export const getData = state => {
  const currentDictionaryName = getCurrentDictionaryName(state);
  return state.main.data.filter(e => e.dictionary == currentDictionaryName);
};
export const getAllPhrases = state => state.main.data;

// sync
export const getUnsyncedPhrases = state => {
  return state.main.data.filter(e => e.synced === false);
};
export const anyUnsyncedPhrases = state => {
  return getUnsyncedPhrases(state).length;
};
export const shouldShowSyncModal = state => state.ui.show_sync_modal;

// open phrase
export const getOpenedPhrase = state => state.ui.opened_phrase;

// audio cache
export const getAudioCache = state => state.audio.cache;
export const getCachedAudioUri = (state, uri) => state.audio.cache[uri];

// play all mode
export const isPlayAllMode = state => state.ui.play_all_mode;
