
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const sendButton = document.getElementById("sendButton");

const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");

let conversationHistory = [];
let isSending = false;


// ====================================
// 1. CURRENT YEAR
// ====================================

document.getElementById("currentYear").textContent =
    new Date().getFullYear();


// ====================================
// 2. MOBILE NAVIGATION
// ====================================

const mobileMenu = document.getElementById("mobileMenu");
const navLinks = document.querySelector(".nav-links");

mobileMenu.addEventListener("click", () => {

    navLinks.classList.toggle("active");

});

document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", () => {
        navLinks.classList.remove("active");
    });

});


// ====================================
// 3. LOAD PROFILE FROM FASTAPI
// ====================================

async function loadProfile() {

    try {

        const response = await fetch("/api/profile");

        if (!response.ok) {
            throw new Error("Profile could not be loaded");
        }

        const profile = await response.json();

        const nameElement = document.getElementById("candidateName");

        if (profile.name) {
            nameElement.textContent = profile.name;
        }

        // Update GitHub link if available
        const githubLink = document.querySelector(".contact-link");

        if (githubLink && profile.github) {
            githubLink.href = profile.github;
        }

        // Show resume button only when resume exists
        const resumeButtons = document.querySelectorAll('a[href="/resume"]');

        resumeButtons.forEach(button => {

            if (!profile.resume_available) {
                button.style.opacity = "0.5";
                button.title = "Resume is not uploaded yet";
            }

        });

    } catch (error) {

        console.error("Profile error:", error);

    }

}

loadProfile();


// ====================================
// 4. SAFE MARKDOWN RENDERING
// ====================================

function renderMessage(content) {

    if (!window.marked || !window.DOMPurify) {

        const text = document.createElement("div");
        text.textContent = content;
        return text;

    }

    const html = marked.parse(content || "");

    const safeHTML = DOMPurify.sanitize(html);

    const wrapper = document.createElement("div");

    wrapper.innerHTML = safeHTML;

    return wrapper;

}


// ====================================
// 5. ADD CHAT MESSAGE
// ====================================

function addMessage(content, sender = "assistant") {

    const message = document.createElement("div");

    message.className =
        sender === "user"
            ? "chat-message user-message"
            : "chat-message assistant-message";

    const avatar = document.createElement("div");

    avatar.className = "message-avatar";

    avatar.textContent =
        sender === "user" ? "H" : "✦";

    const bubble = document.createElement("div");

    bubble.className = "message-bubble";

    bubble.appendChild(renderMessage(content));

    message.appendChild(avatar);

    message.appendChild(bubble);

    chatMessages.appendChild(message);

    chatMessages.scrollTop = chatMessages.scrollHeight;

    return message;

}


// ====================================
// 6. TYPING INDICATOR
// ====================================

function showTyping() {

    const typing = document.createElement("div");

    typing.className = "chat-message assistant-message";

    typing.id = "typingIndicator";

    typing.innerHTML = `
        <div class="message-avatar">✦</div>
        <div class="message-bubble typing-indicator">
            AI is thinking...
        </div>
    `;

    chatMessages.appendChild(typing);

    chatMessages.scrollTop = chatMessages.scrollHeight;

}


function removeTyping() {

    const typing = document.getElementById("typingIndicator");

    if (typing) {
        typing.remove();
    }

}


// ====================================
// 7. SEND MESSAGE TO FASTAPI
// ====================================

async function sendMessage(message) {

    if (isSending || !message.trim()) {
        return;
    }

    isSending = true;

    sendButton.disabled = true;

    addMessage(message, "user");

    const previousHistory = [...conversationHistory];

    conversationHistory.push({
        role: "user",
        content: message
    });

    showTyping();

    try {

        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                message: message,

                history: previousHistory

            })

        });

        const data = await response.json();

        removeTyping();

        if (!response.ok) {

            throw new Error(
                data.detail || "AI assistant is temporarily unavailable."
            );

        }

        if (!data.reply) {

            throw new Error("AI returned an empty response.");

        }

        addMessage(data.reply, "assistant");

        conversationHistory.push({
            role: "assistant",
            content: data.reply
        });

        // Keep only the latest 10 turns
        conversationHistory = conversationHistory.slice(-10);

    } catch (error) {

        removeTyping();

        addMessage(
            "Sorry, I couldn't process your request. " +
            error.message +
            " Please try again.",
            "assistant"
        );

        console.error("Chat API error:", error);

    } finally {

        isSending = false;

        sendButton.disabled = false;

        chatInput.focus();

    }

}


// ====================================
// 8. CHAT FORM SUBMISSION
// ====================================

chatForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const message = chatInput.value.trim();

    if (!message) {
        return;
    }

    chatInput.value = "";

    await sendMessage(message);

});


// ====================================
// 9. QUICK QUESTIONS
// ====================================

document.querySelectorAll(".quick-questions button").forEach(button => {

    button.addEventListener("click", async () => {

        const question = button.dataset.question;

        await sendMessage(question);

    });

});


// ====================================
// 10. HR INTERVIEW CONTACT FORM
// ====================================

contactForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const submitButton = contactForm.querySelector("button");

    submitButton.disabled = true;

    submitButton.textContent = "Submitting...";

    contactStatus.textContent = "";

    const formData = new FormData(contactForm);

    const payload = {

        recruiter_name: formData.get("recruiter_name"),

        company: formData.get("company"),

        email: formData.get("email"),

        message: formData.get("message")

    };

    try {

        const response = await fetch("/api/contact", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(payload)

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.detail || "Unable to submit request."
            );

        }

        contactStatus.textContent = data.message;

        contactForm.reset();

    } catch (error) {

        contactStatus.textContent = error.message;

        contactStatus.style.color = "#dc3545";

    } finally {

        submitButton.disabled = false;

        submitButton.textContent = "Send Interview Request ↗";

    }

});


// ====================================
// 11. SCROLL REVEAL ANIMATIONS
// ====================================

const revealElements = document.querySelectorAll(
    ".section-heading, .about-grid, .skill-card, .project-card, " +
    ".assistant-intro, .chat-container, .contact-grid"
);

revealElements.forEach(element => {

    element.classList.add("reveal");

});

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("visible");

            observer.unobserve(entry.target);

        }

    });

}, {

    threshold: 0.12

});

revealElements.forEach(element => {

    observer.observe(element);

});
