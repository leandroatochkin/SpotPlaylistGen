export const oauthStates = new Map();

// Clean up old states every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [state, timestamp] of oauthStates.entries()) {
    if (now - timestamp > 10 * 60 * 1000) { // 10 minutes
      oauthStates.delete(state);
    }
  }
}, 10 * 60 * 1000);