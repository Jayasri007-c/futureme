// --- Global State Variables ---
let currentProfile = null;
let chatHistory = [];

// --- Intersection Observer Framework Engine ---
document.addEventListener("DOMContentLoaded", () => {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    reveals.forEach(el => observer.observe(el));
});

// --- Configure Matrix (Generate FutureMe) ---
async function generateFutureMe(event) {
    event.preventDefault();

    const name = document.getElementById('userName').value.trim();
    const age = document.getElementById('userAge').value.trim();
    const goal = document.getElementById('userGoal').value.trim();
    const struggle = document.getElementById('userStruggle').value.trim();
    const timeline = document.getElementById('userTimeline').value.trim();
    const tone = document.getElementById('userTone').value;

    const errorBanner = document.getElementById('errorBanner');
    const form = document.getElementById('futureForm');
    const loading = document.getElementById('loadingState');
    const result = document.getElementById('resultState');
    const submitBtn = document.getElementById('submitBtn');

    // Reset UI states
    errorBanner.style.display = 'none';

    if (!name || !age || !goal || !struggle || !timeline || !tone) {
        showError("Please complete all required fields before generating identity.");
        return;
    }

    // Disable button + inputs
    submitBtn.disabled = true;
    toggleFormInputs(form, true);

    // Show loading
    form.style.display = 'none';
    loading.style.display = 'flex';

    document.getElementById('loadingText').innerText =
        "Establishing temporal link…";

    try {

        // NETLIFY FUNCTION CALL
        const response = await fetch('/.netlify/functions/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                action: "generate",
                name,
                age,
                goal,
                struggle,
                oneYearVision: timeline,
                tone
            })
        });

        // SAFER RESPONSE HANDLING
        const text = await response.text();

        let resData;

        try {
            resData = JSON.parse(text);
        } catch (jsonError) {
            console.error("Invalid JSON:", text);
            throw new Error("Server returned invalid response.");
        }

        if (!response.ok || !resData.success) {
            throw new Error(
                resData.error ||
                "FutureMe could not respond right now."
            );
        }

        // Save profile
        currentProfile = {
            name,
            age,
            goal,
            struggle,
            oneYearVision: timeline,
            tone
        };

        chatHistory = [];

        // Populate UI
        const data = resData.data;

        document.getElementById('dynMessage').innerText =
            data.message || "";

        document.getElementById('dynIdentity').innerText =
            data.futureIdentity || "";

        document.getElementById('dynHabit').innerText =
            data.habit || "";

        document.getElementById('dynWarning').innerText =
            data.warning || "";

        document.getElementById('dynMantra').innerText =
            data.mantra || "";

        // Moves
        const movesList = document.getElementById('dynMoves');

        movesList.innerHTML = "";

        const movesArray = data.nextMoves || [];

        movesArray.forEach(move => {
            const li = document.createElement('li');
            li.innerText = move;
            movesList.appendChild(li);
        });

        // Chat placeholder
        const chatPlaceholder =
            document.getElementById('chatPlaceholder');

        if (chatPlaceholder) {
            chatPlaceholder.innerHTML =
                `<strong>FutureMe (${tone} Mode) activated:</strong>
                "I am here, ${name}. Ask me anything about our trajectory."`;
        }

        // Enable chat
        const chatInput =
            document.getElementById('chatInput');

        const chatSendBtn =
            document.getElementById('chatSendBtn');

        chatInput.disabled = false;
        chatSendBtn.disabled = false;

        chatInput.placeholder =
            `Ask your FutureMe (${tone}) anything...`;

        // Show result
        loading.style.display = 'none';
        result.style.display = 'block';

    } catch (err) {

        console.error(err);

        showError(
            err.message ||
            "FutureMe could not respond right now."
        );

        loading.style.display = 'none';
        form.style.display = 'block';

    } finally {

        submitBtn.disabled = false;
        toggleFormInputs(form, false);
    }
}

// --- Interactive Chat Console ---
async function sendChatMessage(event) {

    if (event) event.preventDefault();

    const chatInput =
        document.getElementById('chatInput');

    const chatSendBtn =
        document.getElementById('chatSendBtn');

    const question = chatInput.value.trim();

    if (!question || !currentProfile) return;

    // User bubble
    appendChatBubble('user', question);

    // Reset input
    chatInput.value = "";

    chatInput.disabled = true;
    chatSendBtn.disabled = true;

    // Remove placeholder
    const chatPlaceholder =
        document.getElementById('chatPlaceholder');

    if (chatPlaceholder) {
        chatPlaceholder.remove();
    }

    // Typing bubble
    const typingIndicator =
        appendChatBubble('future-typing', '');

    try {

        // NETLIFY FUNCTION CALL
        const response = await fetch('/.netlify/functions/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                action: "chat",
                userProfile: currentProfile,
                chatHistory: chatHistory,
                question: question
            })
        });

        // SAFER RESPONSE
        const text = await response.text();

        let resData;

        try {
            resData = JSON.parse(text);
        } catch (jsonError) {
            console.error("Invalid JSON:", text);
            throw new Error("Server returned invalid response.");
        }

        // Remove typing indicator
        typingIndicator.remove();

        if (!response.ok || !resData.success) {
            throw new Error(
                resData.error ||
                "Connection to your future self was lost."
            );
        }

        const reply = resData.reply;

        // Future bubble
        appendChatBubble('future', reply);

        // Save history
        chatHistory.push({
            role: 'user',
            message: question
        });

        chatHistory.push({
            role: 'futureme',
            message: reply
        });

    } catch (err) {

        console.error(err);

        typingIndicator.remove();

        appendChatBubble(
            'future',
            `Connection Error: ${err.message}`
        );

    } finally {

        chatInput.disabled = false;
        chatSendBtn.disabled = false;

        chatInput.focus();
    }
}

// --- Copy Result to Clipboard ---
function copyResult() {

    if (!currentProfile) return;

    const message =
        document.getElementById('dynMessage').innerText;

    const identity =
        document.getElementById('dynIdentity').innerText;

    const habit =
        document.getElementById('dynHabit').innerText;

    const warning =
        document.getElementById('dynWarning').innerText;

    const mantra =
        document.getElementById('dynMantra').innerText;

    const movesList =
        document.querySelectorAll('#dynMoves li');

    let movesText = "";

    movesList.forEach((li, idx) => {
        movesText += `${idx + 1}. ${li.innerText}\n`;
    });

    const sharePayload =
`🔮 FutureMe - Message from my Future Self 🔮
------------------------------------------------
"${message}"

👤 Future Identity:
${identity}

🎯 Next 3 Moves:
${movesText}

💪 Daily Habit:
${habit}

⚠️ Warning:
${warning}

✨ Daily Mantra:
"${mantra}"

Generated at Nitish's Founder Labs.`;

    navigator.clipboard.writeText(sharePayload)

        .then(() => {
            triggerToast(
                "Your FutureMe moment is copied to clipboard!"
            );
        })

        .catch(err => {

            console.error(
                'Could not copy text: ',
                err
            );

            triggerToast(
                "Failed to copy."
            );
        });
}

// --- Reset Matrix ---
function regenerateIdentity() {

    const form =
        document.getElementById('futureForm');

    const result =
        document.getElementById('resultState');

    result.style.display = 'none';
    form.style.display = 'block';

    const chatInput =
        document.getElementById('chatInput');

    const chatSendBtn =
        document.getElementById('chatSendBtn');

    chatInput.disabled = true;
    chatSendBtn.disabled = true;

    chatInput.placeholder =
        "Configure matrix above first to chat...";

    const scrollContainer =
        document.getElementById('chatMessagesScroll');

    scrollContainer.innerHTML = `
        <div class="chat-bubble bubble-future" id="chatPlaceholder">
            Define your identity parameters in the
            <strong>Configure Matrix</strong>
            section above to activate your FutureMe.
        </div>
    `;

    currentProfile = null;
    chatHistory = [];
}

// --- Scroll to chat ---
function startChatFromIdentity() {

    setTimeout(() => {

        const chatSection =
            document.getElementById('chat');

        if (chatSection) {

            chatSection.scrollIntoView({
                behavior: 'smooth'
            });

            document.getElementById('chatInput').focus();
        }

    }, 100);
}

// --- Toggle form controls ---
function toggleFormInputs(form, disable) {

    const elements = form.elements;

    for (let i = 0; i < elements.length; i++) {
        elements[i].disabled = disable;
    }
}

// --- Error banner ---
function showError(message) {

    const errorBanner =
        document.getElementById('errorBanner');

    errorBanner.innerText = message;

    errorBanner.style.display = 'flex';

    errorBanner.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

// --- Chat bubble renderer ---
function appendChatBubble(role, message) {

    const scrollContainer =
        document.getElementById('chatMessagesScroll');

    const bubble =
        document.createElement('div');

    bubble.classList.add('chat-bubble');

    if (role === 'user') {

        bubble.classList.add('bubble-user');
        bubble.innerText = message;

    } else if (role === 'future') {

        bubble.classList.add('bubble-future');
        bubble.innerText = message;

    } else if (role === 'future-typing') {

        bubble.classList.add('bubble-future');

        bubble.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
    }

    scrollContainer.appendChild(bubble);

    scrollContainer.scrollTop =
        scrollContainer.scrollHeight;

    return bubble;
}

// --- Toast ---
function triggerToast(customMessage) {

    const toast =
        document.getElementById('toastNotification');

    if (customMessage) {
        toast.innerText = customMessage;
    } else {
        toast.innerText =
            "Your FutureMe moment is ready to share.";
    }

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}