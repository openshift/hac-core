export type FLAGS = { [key: string]: boolean };

/**
 * TODO: Use the regular flags reducer
 */
const flags = (state: FLAGS, action): FLAGS => {
  if (!state) {
    return {};
  }

  switch (action.type) {
    case 'setFlag':
      return (state[action.payload.flag] = action.payload.value);
    default:
      return state;
  }
};

export default flags;
