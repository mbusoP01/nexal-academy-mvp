// Secure Arena engine. Competitive challenge questions are issued and scored
// by Supabase RPCs; browser-generated practice remains local and cannot mutate
// persistent leaderboard XP.

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const subjectId = params.get('subject');
  const moduleId = params.get('module');
  const moduleName = params.get('name');
  const challengeId = params.get('challenge_id');

  const arenaTitle = document.getElementById('arena-title');
  const sidebarTitle = document.getElementById('sidebar-module-name');
  const equationContainer = document.getElementById('equation-container');
  const optionsContainer = document.getElementById('options-container');
  const nextBtn = document.getElementById('next-btn');
  const statusBadge = document.getElementById('status-badge');
  const instructionText = document.getElementById('instruction-text');
  const sessionXpDisplay = document.getElementById('session-xp');
  const openTheoryBtn = document.getElementById('open-theory-btn');
  const theoryModal = document.getElementById('theory-modal');
  const theoryModalContent = document.getElementById('theory-modal-content');
  const closeTheoryBtn = document.getElementById('close-theory-btn');
  const startPracticeBtn = document.getElementById('start-practice-btn');
  const theoryModalTitle = document.getElementById('theory-modal-title');

  if (!equationContainer || !optionsContainer || !nextBtn || !statusBadge) return;
  if (moduleName) {
    if (arenaTitle) arenaTitle.textContent = decodeURIComponent(moduleName);
    if (sidebarTitle) sidebarTitle.textContent = decodeURIComponent(moduleName);
  }

  const MAX_QUESTIONS = 5;
  let questionNumber = 1;
  let currentSessionXP = 0;
  let curriculumPracticeIndex = 0;
  let challengeAttemptId = null;
  let challengeQuestions = [];
  let currentChallengeQuestion = null;

  const setFatal = (message) => {
    instructionText.textContent = message;
    equationContainer.innerHTML = '<p class="text-lg font-bold text-red-700">This session cannot continue safely.</p>';
    optionsContainer.innerHTML = '';
    nextBtn.classList.add('hidden');
  };

  const disableOptions = () => {
    optionsContainer.querySelectorAll('button').forEach((button) => {
      button.disabled = true;
      button.classList.remove('hover:border-emerald', 'hover:bg-emerald/5', 'hover:border-gold', 'hover:bg-gold/10');
    });
  };

  const paintResult = (button, correct) => {
    disableOptions();
    if (correct) {
      button.classList.add('bg-emerald/10', 'border-emerald', 'text-emerald');
      statusBadge.textContent = 'CORRECT';
      currentSessionXP += 50;
      if (sessionXpDisplay) sessionXpDisplay.textContent = String(currentSessionXP);
    } else {
      button.classList.add('bg-red-50', 'border-red-500', 'text-red-700');
      statusBadge.textContent = 'INCORRECT';
    }
    if (questionNumber >= MAX_QUESTIONS) {
      nextBtn.textContent = challengeId ? 'Submit verified duel →' : 'Complete practice →';
      if (challengeId) {
        nextBtn.classList.replace('bg-oxford', 'bg-gold');
        nextBtn.classList.add('text-oxford');
      } else {
        nextBtn.classList.replace('bg-oxford', 'bg-emerald');
      }
    } else {
      nextBtn.textContent = 'Next Question →';
    }
    nextBtn.classList.remove('hidden');
  };

  const setupTheory = () => {
    if (challengeId || !subjectId || !moduleId || !window.NEXAL_CURRICULUM) return;
    const subject = window.NEXAL_CURRICULUM[subjectId];
    let currentVideoId = null;
    if (subject) {
      for (const chapter of subject.syllabus || []) {
        const mod = (chapter.modules || []).find((candidate) => candidate.id === moduleId);
        if (mod?.video_id) {
          currentVideoId = mod.video_id;
          if (theoryModalTitle) theoryModalTitle.textContent = `${mod.name} Theory`;
          break;
        }
      }
    }
    if (!currentVideoId || !openTheoryBtn) return;
    openTheoryBtn.classList.remove('hidden');
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript?.parentNode?.insertBefore(tag, firstScript);
    let ytPlayer = null;
    window.onYouTubeIframeAPIReady = () => {
      ytPlayer = new YT.Player('youtube-container', { videoId: currentVideoId, playerVars: { rel: 0, modestbranding: 1 } });
    };
    const openVault = () => {
      theoryModal?.classList.add('modal-active');
      theoryModalContent?.classList.add('modal-scale');
    };
    const closeVault = () => {
      theoryModal?.classList.remove('modal-active');
      theoryModalContent?.classList.remove('modal-scale');
      if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') ytPlayer.pauseVideo();
    };
    openTheoryBtn.addEventListener('click', openVault);
    closeTheoryBtn?.addEventListener('click', closeVault);
    startPracticeBtn?.addEventListener('click', closeVault);
  };

  const shuffle = (items) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const normalQuestion = () => {
    let authoredModule = null;
    const authoredSubject = subjectId && window.NEXAL_CURRICULUM ? window.NEXAL_CURRICULUM[subjectId] : null;
    if (authoredSubject) {
      for (const chapter of authoredSubject.syllabus || []) {
        authoredModule = (chapter.modules || []).find((candidate) => candidate.id === moduleId);
        if (authoredModule) break;
      }
    }
    if (authoredModule && Array.isArray(authoredModule.practice) && authoredModule.practice.length) {
      const practice = authoredModule.practice[curriculumPracticeIndex % authoredModule.practice.length];
      curriculumPracticeIndex += 1;
      const distractors = Array.isArray(practice.distractors) && practice.distractors.length
        ? practice.distractors
        : ['Review the definition and try again.', 'Check each step against the worked example.', 'Use the stated units and assumptions.'];
      return {
        question: practice.question,
        correct: String(practice.answer),
        distractors: distractors.map(String).filter((choice) => choice !== String(practice.answer)),
        displayType: 'text'
      };
    }
    if (subjectId === '1' && window.NexalMathEngine) return window.NexalMathEngine.generate(moduleId);
    if (subjectId === '2' && window.NexalPhysicsEngine) return window.NexalPhysicsEngine.generate(moduleId);
    if (subjectId === '3' && window.NexalBiologyEngine) return window.NexalBiologyEngine.generate(moduleId);
    return window.NexalMathEngine?.generate('quadratics') || null;
  };

  const renderText = (value) => {
    equationContainer.replaceChildren();
    const p = document.createElement('p');
    p.className = 'text-xl font-medium text-oxford leading-relaxed';
    p.textContent = String(value ?? '');
    equationContainer.appendChild(p);
  };

  const loadQuestion = () => {
    optionsContainer.replaceChildren();
    nextBtn.classList.add('hidden');
    statusBadge.textContent = challengeId ? `VERIFIED DUEL ${questionNumber} / ${MAX_QUESTIONS}` : `QUESTION ${questionNumber} / ${MAX_QUESTIONS}`;

    if (challengeId) {
      currentChallengeQuestion = challengeQuestions[questionNumber - 1];
      if (!currentChallengeQuestion) return setFatal('The verified duel question set is incomplete.');
      instructionText.textContent = `${String(currentChallengeQuestion.subject || '').replaceAll('-', ' ')} · Grade ${currentChallengeQuestion.grade}`;
      renderText(currentChallengeQuestion.prompt);
      (currentChallengeQuestion.options || []).forEach((text, index) => {
        const button = document.createElement('button');
        button.className = 'w-full text-left px-6 py-4 rounded-xl border-2 border-gold/30 hover:border-gold hover:bg-gold/10 transition-all shadow-sm';
        button.textContent = text;
        button.addEventListener('click', async () => {
          disableOptions();
          button.textContent = `${text} · checking…`;
          try {
            const { data, error } = await window.supabaseClient.rpc('academy_answer_challenge_question', {
              p_attempt_id: challengeAttemptId,
              p_question_id: currentChallengeQuestion.id,
              p_selected_index: index
            });
            if (error) throw error;
            button.textContent = text;
            paintResult(button, data?.correct === true);
          } catch (error) {
            console.warn('[Nexal] verified duel answer failed:', error.message);
            setFatal('Your answer could not be verified. Reload the challenge and try again.');
          }
        }, { once: true });
        optionsContainer.appendChild(button);
      });
      return;
    }

    const qData = normalQuestion();
    if (!qData) return setFatal('No practice question is available for this lesson yet.');
    instructionText.textContent = 'Choose the best answer. Practice score stays on this device; verified challenge XP powers rankings.';
    if (qData.displayType === 'katex' && window.katex) {
      equationContainer.replaceChildren();
      window.katex.render(qData.question, equationContainer, { displayMode: true, throwOnError: false });
    } else {
      renderText(qData.question);
    }
    const options = shuffle([
      { text: String(qData.correct), correct: true },
      ...(qData.distractors || []).map((value) => ({ text: String(value), correct: false }))
    ]);
    options.forEach((option) => {
      const button = document.createElement('button');
      button.className = 'w-full text-left px-6 py-4 rounded-xl border-2 border-slate/10 hover:border-emerald hover:bg-emerald/5 transition-all shadow-sm';
      button.textContent = option.text;
      button.addEventListener('click', () => paintResult(button, option.correct), { once: true });
      optionsContainer.appendChild(button);
    });
  };

  nextBtn.addEventListener('click', async () => {
    if (questionNumber < MAX_QUESTIONS) {
      questionNumber += 1;
      loadQuestion();
      return;
    }

    nextBtn.disabled = true;
    if (!challengeId) {
      if (moduleId) localStorage.setItem(`nexal-lesson-complete:${moduleId}`, 'true');
      localStorage.setItem('nexal-last-practice-score', String(currentSessionXP));
      window.location.replace('dashboard.html');
      return;
    }

    nextBtn.textContent = 'Saving verified result…';
    try {
      const { data, error } = await window.supabaseClient.rpc('academy_submit_challenge_attempt', { p_attempt_id: challengeAttemptId });
      if (error) throw error;
      const outcome = data?.outcome;
      if (outcome === 'won') alert(`Verified duel won: ${data.score} XP + ${data.winner_bonus || 0} bonus XP.`);
      else if (outcome === 'lost') alert(`Verified duel complete: ${data.score} XP. Your opponent scored higher.`);
      else if (outcome === 'tied') alert(`Verified duel tied at ${data.score} XP.`);
      else alert(`Verified turn saved: ${data?.score ?? 0} XP. Waiting for your opponent.`);
      window.location.replace('challenges.html');
    } catch (error) {
      console.error('[Nexal] Arena result sync failed:', error);
      nextBtn.disabled = false;
      nextBtn.textContent = 'Retry secure save';
      instructionText.textContent = 'Your verified duel result has not been saved yet. Retry before leaving this page.';
    }
  });

  setupTheory();

  if (challengeId) {
    try {
      if (!window.supabaseClient) throw new Error('Account service unavailable');
      const { data, error } = await window.supabaseClient.rpc('academy_begin_challenge_attempt', { p_challenge_id: challengeId });
      if (error) throw error;
      challengeAttemptId = data?.attempt_id;
      challengeQuestions = Array.isArray(data?.questions) ? data.questions : [];
      if (!challengeAttemptId || challengeQuestions.length !== MAX_QUESTIONS) throw new Error('Verified challenge payload incomplete');
      if (arenaTitle) arenaTitle.textContent = 'Verified CAPS Challenge';
      if (sidebarTitle) sidebarTitle.textContent = 'Verified Duel';
      currentSessionXP = 0;
      loadQuestion();
    } catch (error) {
      console.warn('[Nexal] challenge start failed:', error.message);
      setFatal('This duel could not be verified. Return to Challenges and try again.');
    }
  } else {
    loadQuestion();
  }
});
