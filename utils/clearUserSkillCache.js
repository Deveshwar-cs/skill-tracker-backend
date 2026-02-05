import cache from "./cache.js";

export const clearUserSkillCache = (userId) => {
  cache.keys().forEach((key) => {
    if (key.startsWith(`skills_${userId}`)) {
      cache.del(key);
    }
  });
};
