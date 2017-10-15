import colors from './colors';

const SCREEN_WIDTH = 414;

export const navBarStyle = {
  position: 'fixed',
  display: 'flex',
  backgroundColor: colors.secondary,
  width: '100%',
  height: 44,
  justifyContent: 'space-between',
  alignItems: 'center',
  flexDirection: 'row'
};

export const navBarTitle = {
  color: colors.white
};

export const modalContainer = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20
};

export const modalTitle = {
  fontSize: 30,
  textAlign: 'center',
  marginBottom: 20,
  color: colors.white
};

export const modalSubtitle = {
  fontSize: 20,
  textAlign: 'center',
  marginBottom: 40,
  color: colors.white,
  opacity: 0.9
};
