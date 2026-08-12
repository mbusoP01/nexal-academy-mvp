// File: js/arena-engine.js

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. ENGINE INITIALIZATION & CONTEXT
    // ==========================================
    const urlParams = new URLSearchParams(window.location.search);
    const subjectId = urlParams.get('subject');
    const moduleId = urlParams.get('module');
    const moduleName = urlParams.get('name');
    const challengeId = urlParams.get('challenge_id');

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

    if (moduleName) {
        if(arenaTitle) arenaTitle.textContent = decodeURIComponent(moduleName);
        if(sidebarTitle) sidebarTitle.textContent = decodeURIComponent(moduleName);
    }

    if (!equationContainer) return; 

    let questionNumber = 1;
    const MAX_QUESTIONS = 5;
    let currentSessionXP = 0;
    const DUEL_BONUS = 250;
    let curriculumPracticeIndex = 0;

    // ==========================================
    // 2. YOUTUBE THEORY VAULT LOGIC
    // ==========================================
    let currentVideoId = null;
    let ytPlayer = null;

    if (subjectId && moduleId && window.NEXAL_CURRICULUM) {
        const subject = window.NEXAL_CURRICULUM[subjectId];
        if (subject) {
            for (const chapter of subject.syllabus) {
                const mod = chapter.modules.find(m => m.id === moduleId);
                if (mod && mod.video_id) {
                    currentVideoId = mod.video_id;
                    if (theoryModalTitle) theoryModalTitle.textContent = mod.name + " Theory";
                    break;
                }
            }
        }
    }

    if (currentVideoId && !challengeId && openTheoryBtn) {
        openTheoryBtn.classList.remove('hidden');

        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = function() {
            ytPlayer = new YT.Player('youtube-container', {
                videoId: currentVideoId,
                playerVars: { 'rel': 0, 'modestbranding': 1 }
            });
        };

        const openVault = () => { theoryModal.classList.add('modal-active'); theoryModalContent.classList.add('modal-scale'); };
        const closeVault = () => { theoryModal.classList.remove('modal-active'); theoryModalContent.classList.remove('modal-scale'); if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') ytPlayer.pauseVideo(); };

        openTheoryBtn.addEventListener('click', openVault);
        closeTheoryBtn.addEventListener('click', closeVault);
        startPracticeBtn.addEventListener('click', closeVault);
    }

    // ==========================================
    // 3. UTILITY FUNCTIONS
    // ==========================================
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // ==========================================
    // 4. ENGINE CORE LOGIC & ROUTER
    // ==========================================

    function loadNewQuestion() {
        optionsContainer.innerHTML = ''; nextBtn.classList.add('hidden'); 
        
        statusBadge.textContent = challengeId ? `DUEL ROUND ${questionNumber} / ${MAX_QUESTIONS}` : `QUESTION ${questionNumber} / ${MAX_QUESTIONS}`;
        statusBadge.className = challengeId ? "text-xs font-black tracking-widest text-gold bg-gold/10 px-3 py-1 rounded-full uppercase" : "text-xs font-black tracking-widest text-oxford bg-slate/10 px-3 py-1 rounded-full uppercase";

        let qData;

        // COMBAT / SYLLABUS ROUTER
        if (challengeId) {
            // Randomly select a topic for the duel across ALL streams
            const enginePicker = Math.random();
            if (enginePicker < 0.33) {
                const mathTopics = ["quadratics", "inequalities", "exponents_surds", "simultaneous", "arithmetic_seq", "geometric_seq", "quadratic_seq", "limits", "differentiation", "optimization"];
                qData = window.NexalMathEngine.generate(mathTopics[Math.floor(Math.random() * mathTopics.length)]);
            } else if (enginePicker < 0.66) {
                const physicsTopics = ["kinematics", "newton", "momentum", "work_energy", "electrostatics", "circuits", "electrodynamics", "organic_chem", "rates", "equilibrium", "acids_bases"];
                qData = window.NexalPhysicsEngine.generate(physicsTopics[Math.floor(Math.random() * physicsTopics.length)]);
            } else {
                const bioTopics = ["dna_rna", "meiosis", "mendelian", "endocrine", "reproduction", "evolution"];
                qData = window.NexalBiologyEngine.generate(bioTopics[Math.floor(Math.random() * bioTopics.length)]);
            }
        } else {
            // Normal Dashboard Flow
            // Prefer authored curriculum questions whenever a lesson has them.
            // This keeps the practice surface aligned with the textbook instead
            // of silently falling back to a generated question for newer modules.
            let authoredModule = null;
            const authoredSubject = subjectId && window.NEXAL_CURRICULUM
                ? window.NEXAL_CURRICULUM[subjectId]
                : null;
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
                    : ['Review the definition and try again.', 'Check each step against the worked example.', 'Use the stated units and assumptions.']
                        .filter((choice) => choice !== practice.answer);
                qData = {
                    question: practice.question,
                    correct: String(practice.answer),
                    distractors: distractors.map(String),
                    displayType: 'text'
                };
            } else if (subjectId === "1" && window.NexalMathEngine) {
                qData = window.NexalMathEngine.generate(moduleId);
            } else if (subjectId === "2" && window.NexalPhysicsEngine) {
                qData = window.NexalPhysicsEngine.generate(moduleId);
            } else if (subjectId === "3" && window.NexalBiologyEngine) {
                qData = window.NexalBiologyEngine.generate(moduleId);
            } else {
                // Failsafe mechanism
                qData = window.NexalMathEngine.generate("quadratics"); 
            }
        }
        
        if (qData.displayType === "katex") { 
            equationContainer.innerHTML = ""; 
            katex.render(qData.question, equationContainer, { displayMode: true }); 
        } else { 
            equationContainer.innerHTML = `<p class="text-xl font-medium text-oxford leading-relaxed">${qData.question}</p>`; 
        }

        let options = shuffleArray([{text: qData.correct, isCorrect: true}, ...qData.distractors.map(d => ({text: d, isCorrect: false}))]);

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = challengeId ? "w-full text-left px-6 py-4 rounded-xl border-2 border-gold/30 hover:border-gold hover:bg-gold/10 transition-all shadow-sm" : "w-full text-left px-6 py-4 rounded-xl border-2 border-slate/10 hover:border-emerald hover:bg-emerald/5 transition-all shadow-sm";
            if (qData.displayType === "katex") katex.render(opt.text, btn); else btn.innerHTML = `<span class="font-medium text-slate">${opt.text}</span>`;
            btn.addEventListener('click', () => handleAnswer(btn, opt.isCorrect));
            optionsContainer.appendChild(btn);
        });
    }

    function handleAnswer(selectedBtn, isCorrect) {
        optionsContainer.querySelectorAll('button').forEach(b => { b.disabled = true; b.classList.remove('hover:border-emerald', 'hover:bg-emerald/5', 'hover:border-gold', 'hover:bg-gold/10', 'cursor-pointer'); });

        if (isCorrect) {
            selectedBtn.classList.add('bg-emerald/10', 'border-emerald', 'text-emerald');
            statusBadge.textContent = "CORRECT";
            statusBadge.classList.replace('text-oxford', 'text-emerald'); statusBadge.classList.replace('text-gold', 'text-emerald'); statusBadge.classList.replace('bg-slate/10', 'bg-emerald/20'); statusBadge.classList.replace('bg-gold/10', 'bg-emerald/20');
            currentSessionXP += 50;
            if(sessionXpDisplay) sessionXpDisplay.textContent = currentSessionXP;
        } else {
            selectedBtn.classList.add('bg-red-50', 'border-red-500', 'text-red-700');
            statusBadge.textContent = "INCORRECT";
            statusBadge.classList.replace('text-oxford', 'text-red-700'); statusBadge.classList.replace('text-gold', 'text-red-700'); statusBadge.classList.replace('bg-slate/10', 'bg-red-100'); statusBadge.classList.replace('bg-gold/10', 'bg-red-100');
        }
        
        if (questionNumber >= MAX_QUESTIONS) {
            if (challengeId) {
                const maxExpected = MAX_QUESTIONS * 50;
                let displayBonus = currentSessionXP <= maxExpected ? DUEL_BONUS : 0; // Anti-Cheat visual correction
                nextBtn.textContent = `Submit Duel Score \u2192`;
                nextBtn.classList.replace('bg-oxford', 'bg-gold'); nextBtn.classList.add('text-oxford');
            } else {
                nextBtn.textContent = "Complete Module & Save Progress \u2192";
                nextBtn.classList.replace('bg-oxford', 'bg-emerald');
            }
        }
        nextBtn.classList.remove('hidden');
    }

    // ==========================================
    // 5. TURN-BASED DATABASE RESOLUTION
    // ==========================================
    nextBtn.addEventListener('click', async () => { 
        if (questionNumber >= MAX_QUESTIONS) {
            nextBtn.textContent = "Processing Combat Data..."; nextBtn.disabled = true; nextBtn.classList.add('opacity-75', 'cursor-not-allowed');

            let verifiedSessionXP = currentSessionXP > (MAX_QUESTIONS * 50) ? 0 : currentSessionXP;

            try {
                const { data: { user } } = await window.supabaseClient.auth.getUser();
                const { data: profile } = await window.supabaseClient.from('profiles').select('xp').eq('id', user.id).single();
                let myTotalXP = (profile.xp || 0) + verifiedSessionXP;

                if (challengeId) {
                    const { data: challenge } = await window.supabaseClient.from('challenges').select('*').eq('id', challengeId).single();
                    const isChallenger = challenge.challenger_id === user.id;

                    const updatePayload = {};
                    if (isChallenger) {
                        updatePayload.challenger_score = verifiedSessionXP;
                        updatePayload.challenger_played = true;
                    } else {
                        updatePayload.target_score = verifiedSessionXP;
                        updatePayload.target_played = true;
                    }

                    const opponentPlayed = isChallenger ? challenge.target_played : challenge.challenger_played;
                    const opponentScore = isChallenger ? challenge.target_score : challenge.challenger_score;
                    const opponentId = isChallenger ? challenge.target_id : challenge.challenger_id;

                    if (opponentPlayed) {
                        updatePayload.status = 'completed';
                        let iWon = verifiedSessionXP > opponentScore;
                        let opponentWon = opponentScore > verifiedSessionXP;
                        
                        if (iWon) {
                            myTotalXP += DUEL_BONUS;
                            alert(`You won the duel! (+${DUEL_BONUS} Bonus XP)`);
                        } else if (opponentWon) {
                            const { data: oppProfile } = await window.supabaseClient.from('profiles').select('xp').eq('id', opponentId).single();
                            await window.supabaseClient.from('profiles').update({ xp: (oppProfile.xp || 0) + DUEL_BONUS }).eq('id', opponentId);
                            alert(`You lost the duel. Opponent scored higher.`);
                        } else {
                            alert("The duel ended in a Tie! No bonus awarded.");
                        }
                    } else {
                        alert("Turn completed. Awaiting opponent to play their round.");
                    }

                    await window.supabaseClient.from('profiles').update({ xp: myTotalXP }).eq('id', user.id);
                    await window.supabaseClient.from('challenges').update(updatePayload).eq('id', challengeId);
                    window.location.href = 'challenges.html';

                } else {
                    await window.supabaseClient.from('profiles').update({ xp: myTotalXP }).eq('id', user.id);
                    window.location.href = 'dashboard.html';
                }
                
            } catch (err) {
                console.error("Sync Failed:", err);
                window.location.href = 'dashboard.html';
            }
        } else {
            questionNumber++; loadNewQuestion(); 
        }
    });

    loadNewQuestion();
});
