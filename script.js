// --- CONFIGURATION ---
const username = 'tdavid77';
const repo = 'tdavid77.github.io';
const path = 'images';
// ---------------------

// --- 🎨 THE FASHION BRAIN: COLOR RULES ---
// A list of what goes well with what.
// "universal" matches anything (Black, White, Grey, Jeans).
const colorMatches = {
    'black': ['universal'],
    'white': ['universal'],
    'grey':  ['universal'],
    'jeans': ['universal'],
    'beige': ['black', 'white', 'blue', 'green', 'jeans'],
    'blue':  ['white', 'beige', 'grey', 'jeans', 'black'],
    'red':   ['black', 'white', 'jeans', 'grey'],
    'green': ['black', 'white', 'beige', 'jeans'],
};

let tops = [];
let bottoms = [];

async function loadWardrobe() {
    document.getElementById('status-text').innerText = "Analyzing wardrobe data...";

    try {
        const response = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`);
        if (!response.ok) throw new Error('Repo not found');
        const data = await response.json();

        data.forEach(file => {
            const parts = file.name.toLowerCase().split('_');
            // Only process files that match our naming convention (5 parts)
            // top_formality_color_pattern_name.jpg
            if (parts.length >= 4) {
                const item = {
                    url: file.download_url,
                    category: parts[0],
                    formality: parseInt(parts[1]), // Convert "3" to number 3
                    color: parts[2],
                    pattern: parts[3],
                    name: file.name
                };

                if (item.category === 'top') tops.push(item);
                else if (item.category.includes('bottom')) bottoms.push(item);
            }
        });

        document.getElementById('status-text').innerText = `AI Ready: ${tops.length} tops, ${bottoms.length} bottoms.`;
        generateSmartOutfit();

    } catch (error) {
        console.error(error);
        document.getElementById('status-text').innerText = "Error: Check file names or repo settings.";
    }
}

function calculateCompatibility(top, bottom) {
    let score = 0;
    let reasons = [];

    // 1. FORMALITY CHECK (Max 50 points)
    const diff = Math.abs(top.formality - bottom.formality);
    if (diff === 0) { score += 50; reasons.push("Perfect formality match"); }
    else if (diff === 1) { score += 30; reasons.push("Good formality mix"); }
    else { score -= 100; reasons.push("Formality clash (Casual vs Formal)"); }

    // 2. PATTERN CHECK (Max 30 points)
    if (top.pattern === 'busy' && bottom.pattern === 'busy') {
        score -= 50;
        reasons.push("Too many patterns!");
    } else {
        score += 30;
    }

    // 3. COLOR CHECK (Max 20 points)
    // Check if Top color matches Bottom color using our map
    const tColor = top.color;
    const bColor = bottom.color;

    // Helper: Check if a color is universal (neutral)
    const isUniversal = (c) => ['black', 'white', 'grey', 'jeans'].includes(c);

    let colorMatch = false;

    // If either is universal, it's a match
    if (isUniversal(tColor) || isUniversal(bColor)) colorMatch = true;

    // Or check the explicit list
    else if (colorMatches[tColor]?.includes(bColor)) colorMatch = true;

    if (colorMatch) { score += 20; reasons.push("Colors look good"); }
    else { score -= 20; reasons.push("Colors might clash"); }

    return { score, reasons };
}

function generateSmartOutfit() {
    if (tops.length === 0 || bottoms.length === 0) return;

    const MINIMUM_SCORE = 50; // Outfits must score at least this high

    // 1. Pick a Random Top to start with
    const randomTop = tops[Math.floor(Math.random() * tops.length)];

    // 2. Find all bottoms that are a "good enough" match
    const goodMatches = bottoms
        .map(bottom => {
            const result = calculateCompatibility(randomTop, bottom);
            return { bottom, result };
        })
        .filter(match => match.result.score >= MINIMUM_SCORE);

    // 3. If we found any good matches, pick the best one
    if (goodMatches.length > 0) {
        // Sort by score descending to find the best match
        goodMatches.sort((a, b) => b.result.score - a.result.score);
        const bestMatch = goodMatches[0];

        // Display Result
        updateImages(randomTop.url, bestMatch.bottom.url);

        console.log(`AI Choice: Score ${bestMatch.result.score}`);
        console.log(`Reasons: ${bestMatch.result.reasons.join(', ')}`);
    } else {
        // 4. If no good matches, try again or inform the user
        console.log(`No suitable outfit found for the selected top. Trying again...`);
        // We can recursively call the function, but add a safeguard to prevent infinite loops
        // For simplicity, we'll just call it once.
        setTimeout(generateSmartOutfit, 100);
    }
}


function updateImages(topUrl, bottomUrl) {
    const topImg = document.getElementById("top-img");
    const botImg = document.getElementById("bottom-img");

    // Fade logic (same as before)
    topImg.classList.remove('loaded');
    botImg.classList.remove('loaded');
    setTimeout(() => {
        topImg.src = topUrl;
        botImg.src = bottomUrl;
        topImg.onload = () => topImg.classList.add('loaded');
        botImg.onload = () => botImg.classList.add('loaded');
    }, 200);
}

// Initialize
(async () => {
    await loadWardrobe();
})();