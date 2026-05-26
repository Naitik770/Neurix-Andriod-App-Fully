/**
 * Local AI Coach Intelligence Engine for Naitix.
 * Serves as a highly responsive offline-ready companion to provide instant guidance
 * based on user context, habits, reminders, and training status.
 */

export interface UserContextData {
  profile: {
    name?: string;
    level?: number;
    xp?: number;
    streak?: number;
    lifeScore?: number;
  } | null;
  habits: Array<{
    id: string;
    title: string;
    streak?: number;
    frequency?: string;
    lastCompleted?: string;
  }>;
  reminders: Array<{
    id: string;
    title: string;
    time?: any; // String or timestamp
  }>;
  gameSessions: Array<{
    id: string;
    gameName?: string;
    category?: string;
    score?: number;
    xpEarned?: number;
    playedAt?: any;
  }>;
  weather: string | null;
}

export function generateLocalBackupResponse(prompt: string, ctx: UserContextData): string {
  const query = prompt.toLowerCase();
  const name = ctx.profile?.name?.split(' ')[0] || 'Friend';
  const level = ctx.profile?.level || 1;
  const streak = ctx.profile?.streak || 0;
  const lifeScore = ctx.profile?.lifeScore || 50;

  // 1. GREETINGS
  if (/hi|hello|hey|greetings|naitix|yo/i.test(query)) {
    return `Hello **${name}**! 👋 I'm fully here to support your focus, cognitive development, and daily lifestyle routines today!

How is your day going? Based on your current stats, you are **Level ${level}** with an active **${streak}-day streak**. 
What would you like to focus on today? We can talk about your **daily routines**, **cognitive training games**, or look over your **schedule**. Tell me what's on your mind!`;
  }

  // 2. WEATHER
  if (/weather|temp|forecast|rain|sunny|hot|cold/i.test(query)) {
    if (ctx.weather && !ctx.weather.includes('unavailable')) {
      return `☀️ **Current Weather Update for ${name}**:\n\n${ctx.weather}\n\n*Coach Advice:* A perfect day to align your focus. If you're heading outside, plan your outdoor activities around your habits. If you are staying in, maybe challenge yourself to a cognitive game session!`;
    } else {
      return `☁️ **Weather Update**:\nI currently don't have access to your live location coords to query the weather. Make sure location permissions are enabled for Naitix so we can sync real-time weather conditions with your coaching plan!`;
    }
  }

  // 3. HABITS & ROUTINE
  if (/habit|routine|daily|schedule|streak|todo/i.test(query)) {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const completedToday = ctx.habits.filter(h => h.lastCompleted === todayStr);
    const uncompletedToday = ctx.habits.filter(h => h.lastCompleted !== todayStr);

    let habitSummary = `### 📋 Your Daily Routine & Habits status:\n`;
    if (ctx.habits.length === 0) {
      habitSummary += `You haven't setup any habits yet! Head over to the **Daily Routine** tab to create some and start tracking your streak.`;
    } else {
      habitSummary += `You have **${ctx.habits.length}** active habit tracker(s) defined.
- **Streak Status:** You are on an active **${streak}-day** app streak!
- **Completed Today:** ${completedToday.length} verified (${Math.round((completedToday.length / ctx.habits.length) * 100) || 0}% completion)
- **Pending Tasks:** ${uncompletedToday.length} remaining\n\n`;

      if (uncompletedToday.length > 0) {
        habitSummary += `**Pending Checklist for today:**\n`;
        uncompletedToday.slice(0, 5).forEach(h => {
          habitSummary += `* ⬜ **${h.title}** ${h.streak ? `*(Streak: ${h.streak} days)*` : ''}\n`;
        });
      } else {
        habitSummary += `🎉 **Amazing job!** You have fully completed all your habits for today. Keep up this incredible momentum!`;
      }
    }

    return `Hello **${name}**! Let's audit your habits and lifestyle routines:

${habitSummary}

*Coach Reflection:* Consistent small victories compound over time. Your daily discipline is what drives true growth. Focus on checking off at least one pending routine right now!`;
  }

  // 4. GAMES & COGNITIVE CHALLENGES
  if (/game|score|brain|challenge|cognitive|xp|training/i.test(query)) {
    let gameSummary = `### 🧠 Memory & Attention Training Report:\n`;
    if (ctx.gameSessions.length === 0) {
      gameSummary += `No cognitive files found in your local history! Try playing games on the **Games** page to build memory, focus, and logic skills.`;
    } else {
      const bestSession = [...ctx.gameSessions].sort((a,b) => (b.score || 0) - (a.score || 0))[0];
      const recentSession = ctx.gameSessions[0];

      gameSummary += `Looking at your recent active training sessions:
- **Last game played:** "${recentSession.gameName || 'Brain Challenge'}" (Category: ${recentSession.category}) - Score: **${recentSession.score}** (Earned +${recentSession.xpEarned} XP)
- **All-time High Score:** **${bestSession.score}** in "${bestSession.gameName || 'Brain Challenge'}"!\n\n`;

      gameSummary += `**Coach Brain Training Plan:**
1. **Consistency**: Play at least one game session daily to maintain neuroplasticity.
2. **Diversity**: Challenge different brain sectors. If you play math, rotate to memory/spatial cards in the next session.`;
    }

    return `Hey **${name}**, brain training is the core pillar of mental longevity! Let's examine your cognitive progress:

${gameSummary}

*Coach Reflection:* Don't stress too much about high scores; the focus and mental effort are what build cognitive pathways. Ready to take on another challenge on the **Games** page?`;
  }

  // 5. REMINDERS & SCHEDULING
  if (/reminder|alarm|schedule|upcoming|task/i.test(query)) {
    let reminderText = `### ⏰ Upcoming Reminders & Triggers:\n`;
    if (ctx.reminders.length === 0) {
      reminderText += `You don't have any scheduled tasks or reminders. Add one in the app to stay on top of your daily goals!`;
    } else {
      reminderText += `You have **${ctx.reminders.length}** active reminders set up:\n`;
      ctx.reminders.slice(0, 5).forEach(r => {
        let timeVal = 'Time not set';
        if (r.time) {
          if (typeof r.time === 'string') {
            timeVal = r.time;
          } else if (r.time.toDate) {
            timeVal = r.time.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
          } else if (r.time.seconds) {
            timeVal = new Date(r.time.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
          }
        }
        reminderText += `* 🔔 **${r.title}** scheduled for **${timeVal}**\n`;
      });
    }

    return `Here is your current notification & schedule audit, **${name}**:\n\n${reminderText}\n\n*Coach Suggestion:* Structuring your day reduces cognitive drag and limits procrastination. Keep these reminders close, and do your best to action them as soon as they sound!`;
  }

  // 6. MOTIVATION / STRESS / EMOTIONS
  if (/stress|frustrated|sad|motivation|advice|tired|sleep|focus|coach|anxious/i.test(query)) {
    const quotes = [
      `"It is not that we have a short time to live, but that we waste a lot of it." — Seneca`,
      `"Your mind is for having ideas, not holding them." — David Allen`,
      `"The threshold of success is built out of small, simple steps completed with relentless momentum."`,
      `"Energy flows where attention goes. Focus on what you can control right now."`
    ];
    const selectQuote = quotes[Math.floor(Math.random() * quotes.length)];

    return `### 🌱 Mindfulness & Cognitive Support Session for ${name}:

I hear you, and it is completely normal to feel this way. When things feel overwhelming or motivation runs low, the best course of action is to **simplify and shrink your current scope**.

> ${selectQuote}

Here are 3 quick actions we can take right now to lower stress and regain focus:
1. **The 2-Minute Rule**: Pick one task from your upcoming schedule that takes under two minutes, and execute it immediately.
2. **Breathing Check**: Take 3 slow, deep abdominal breaths. Inhale for 4 seconds, hold for 4, and exhale for 6.
3. **Paced Focus**: Head over to our **Games or Relaxation** module to play a low-stress breathing round and ground yourself.

Your current **Life Score is ${lifeScore}/100** — this is simply a benchmark, a starting coordinate. We have plenty of space to elevate it step-by-step together!`;
  }

  // 7. GENERAL STATS & PROGRESS
  if (/stat|progress|level|xp|life score|doing/i.test(query)) {
    return `### 📊 Your Naitix Lifestyle Dashboard:

Hello **${name}**! Here is an overview of your current metrics and progress inside the platform:

* **Current Rank:** Level **${level}** Elite Mind
* **App Streak:** **${streak} days** of continuous productivity
* **Naitix Life Score:** **${lifeScore}/100** (calculated from habit completion rates and brain training regularity)
* **XP Balance:** **${ctx.profile?.xp || 0} XP** (Next level requires ${(level) * 100} XP)

*Coach Recommendation:* To boost your Life Score and level up faster, focus on completing your daily habits, resolving any upcoming reminders on time, and getting an active session in the memory games!`;
  }

  // 8. GENERAL / OPEN-ENDED QUESTIONS FALLBACK
  return `### 🔮 Naitix Intelligent Advisor Guide:

I checked your message: *"${prompt}"* 

And I've synthesized a plan based on your current physical & cognitive coordinates! Let's help you align your energy and routines code right now:

* **Current Progress Stats:** Level ${level} | Streak ${streak} Days | Life Score ${lifeScore}/100
* **Weather sync:** ${ctx.weather ? 'Active' : 'Not Configured'}
* **Routines list:** ${ctx.habits.length} habits configured.

**Actionable steps to build mental strength right now:**
1. Check your **Daily Routine** page and mark off any completed items.
2. Direct your focus to a cognitive match or memory card in the **Games** page to boost your Level ${level} stats.
3. Establish structured alarms in the **Reminders** module to offload mental tracking.

What little physical or mental victory can we log right now, **${name}**? Let me know!`;
}
