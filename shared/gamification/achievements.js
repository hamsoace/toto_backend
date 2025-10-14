const achievements = {
  first_login: {
    name: "Welcome to TotoCare!",
    description: "Created your account and logged in for the first time",
    points: 50,
    badge: "👋 Welcome Badge",
    trigger: 'first_login'
  },
  profile_completed: {
    name: "All About You",
    description: "Completed your user profile setup",
    points: 25,
    badge: "📝 Profile Pro",
    trigger: 'profile_completed'
  },
  baby_profile_added: {
    name: "Baby On Board",
    description: "Added your baby's profile",
    points: 75,
    badge: "👶 Baby Expert",
    trigger: 'baby_added'
  },
  first_checklist: {
    name: "Mental Health Champion",
    description: "Completed your first wellness checklist",
    points: 100,
    badge: "💚 Wellness Warrior",
    trigger: 'checklist_completed'
  }
};

module.exports = { achievements };