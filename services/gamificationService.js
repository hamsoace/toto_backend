const { achievements } = require('../../shared/gamification/achievements');

class GamificationService {
  static async awardAchievement(user, achievementKey) {
    const achievement = achievements[achievementKey];
    if (!achievement) return null;

    if (user.gamification.achievements.includes(achievementKey)) {
      return null; // Already earned
    }

    user.gamification.achievements.push(achievementKey);
    user.gamification.points += achievement.points;
    
    user.gamification.badges.push({
      name: achievement.badge,
      earnedAt: new Date(),
      description: achievement.description
    });

    await user.save();
    
    return {
      achievement: achievement.name,
      points: achievement.points,
      badge: achievement.badge,
      description: achievement.description
    };
  }

  static async handleFirstLogin(user) {
    return await this.awardAchievement(user, 'first_login');
  }

  static async handleProfileCompletion(user) {
    return await this.awardAchievement(user, 'profile_completed');
  }

  static async handleBabyAdded(user) {
    return await this.awardAchievement(user, 'baby_profile_added');
  }

  static async handleChecklistCompletion(user) {
    return await this.awardAchievement(user, 'first_checklist');
  }
}

module.exports = GamificationService;