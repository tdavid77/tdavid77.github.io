// --- CONFIGURATION ---
const username = 'tdavid77';
const repo = 'tdavid77.github.io';
const path = 'images';
// ---------------------

// --- 💖 AFFIRMATIONS ---
const affirmations = [
    "It's Okay To Not Be Okay",
    "You Are Doing The Best You Can",
    "Your Feelings Are Valid And Deserve Attention",
    "Be Gentle With Yourself Today",
    "Your Worth Is Unconditional",
    "Rest Is A Productive And Necessary Act",
    "You Are Allowed To Set Boundaries",
    "Progress, Not Perfection, Is The Goal",
    "You Are Enough, Exactly As You Are",
    "It's Brave To Ask For Help When You Need It",
    "You Have Survived All Of Your Hardest Days",
    "Your Journey Is Unique And Not Meant To Be Compared",
    "Allow Yourself To Feel And To Heal",
    "You Are Capable Of Handling Life's Challenges",
    "Treat Yourself With The Kindness You Offer Others",
    "Your Needs Matter",
    "You Are Allowed To Take Up Space",
    "Forgiving Yourself Is Part Of The Process",
    "You Are More Than Your Mistakes",
    "Letting Go Creates Space For Something New",
    "Your Best Is Good Enough",
    "It's Okay To Prioritize Your Own Peace",
    "You Have The Power To Create Change",
    "Embrace The Journey Of Becoming",
    "You Are Deserving Of Happiness"
];

// --- 🎨 STYLE & COLOR RULES ---
const colorMatches = {
    'black': ['universal'], 'white': ['universal'], 'grey':  ['universal'], 'jeans': ['universal'],
    'beige': ['black', 'white', 'blue', 'green', 'jeans'],
    'blue':  ['white', 'beige', 'grey', 'jeans', 'black'],
    'red':   ['black', 'white', 'jeans', 'grey'],
    'green': ['black', 'white', 'beige', 'jeans'],
};

let tops = [], bottoms = [], hats = [], coats = [], shoes = [], bags = [];

async function loadWardrobe() {
    document.getElementById('status-text').innerText = "Analyzing wardrobe data...";
    try {
        const response = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`);
        if (!response.ok) throw new Error('Repo not found');
        const data = await response.json();

        data.forEach(file => {
            const parts = file.name.toLowerCase().split('_');
            if (parts.length < 4) return;

            const item = {
                url: file.download_url, category: parts[0],
                formality: parseInt(parts[1]), color: parts[2],
                pattern: parts[3], name: file.name
            };

            if (item.category === 'top') tops.push(item);
            else if (item.category.includes('bottom')) bottoms.push(item);
            else if (item.category === 'hat') hats.push(item);
            else if (item.category === 'coat' || item.category === 'jacket') coats.push(item);
            else if (item.category === 'shoes') shoes.push(item);
            else if (item.category === 'bag') bags.push(item);
        });

        const status = `Wardrobe Ready: ${tops.length} tops, ${bottoms.length} bottoms, ${coats.length} coats, ${shoes.length} shoes, ${hats.length} hats, ${bags.length} bags.`;
        document.getElementById('status-text').innerText = status;
        generateSmartOutfit();
        displayRandomAffirmation(); // Initial display

    } catch (error) {
        console.error(error);
        document.getElementById('status-text').innerText = "Error: Check file names or repo settings.";
    }
}

function calculateCompatibility(item1, item2) {
    let score = 0;
    let reasons = [];

    // 1. FORMALITY CHECK (Max 50 points)
    const diff = Math.abs(item1.formality - item2.formality);
    if (diff === 0) { score += 50; reasons.push("Perfect formality match"); }
    else if (diff === 1) { score += 30; reasons.push("Good formality mix"); }
    else { score -= 100; reasons.push("Formality clash"); }

    // 2. PATTERN CHECK (Max 30 points)
    if (item1.pattern === 'busy' && item2.pattern === 'busy') {
        score -= 50; reasons.push("Pattern clash");
    } else {
        score += 30;
    }

    // 3. COLOR CHECK (Max 20 points)
    const isUniversal = (c) => ['black', 'white', 'grey', 'jeans'].includes(c);
    let colorMatch = isUniversal(item1.color) || isUniversal(item2.color) || colorMatches[item1.color]?.includes(item2.color);
    if (colorMatch) { score += 20; reasons.push("Colors look good"); }
    else { score -= 20; reasons.push("Colors might clash"); }

    return { score, reasons };
}

function findBestMatch(baseItem, itemsToSearch) {
    if (!itemsToSearch || itemsToSearch.length === 0) return null;

    const goodMatches = itemsToSearch
        .map(item => ({ item, result: calculateCompatibility(baseItem, item) }))
        .filter(match => match.result.score >= 50);

    if (goodMatches.length === 0) return null;

    goodMatches.sort((a, b) => b.result.score - a.result.score);
    return goodMatches[0]; // Return the whole match object {item, result}
}

function generateSmartOutfit() {
    if (tops.length === 0 || bottoms.length === 0) return;
    const MINIMUM_SCORE = 50;

    let topBottomMatch = null;
    let randomTop;

    // Try to find a good top/bottom pair
    for (let i = 0; i < 10; i++) { // Limit attempts to prevent infinite loops
        randomTop = tops[Math.floor(Math.random() * tops.length)];
        const goodMatches = bottoms
            .map(bottom => ({ item: bottom, result: calculateCompatibility(randomTop, bottom) }))
            .filter(match => match.result.score >= MINIMUM_SCORE);

        if (goodMatches.length > 0) {
            goodMatches.sort((a, b) => b.result.score - a.result.score);
            topBottomMatch = { top: randomTop, bottom: goodMatches[0].item, result: goodMatches[0].result };
            break;
        }
    }

    if (!topBottomMatch) {
        console.log("Could not find a suitable top/bottom pair. Please check your wardrobe.");
        return;
    }

    // Find best accessories
    const coatMatch = findBestMatch(topBottomMatch.top, coats);
    const hatMatch = findBestMatch(topBottomMatch.top, hats);
    const bagMatch = findBestMatch(topBottomMatch.top, bags);
    const shoesMatch = findBestMatch(topBottomMatch.bottom, shoes);

    updateImages({
        top: topBottomMatch.top.url,
        bottom: topBottomMatch.bottom.url,
        coat: coatMatch?.item.url,
        hat: hatMatch?.item.url,
        shoes: shoesMatch?.item.url,
        bag: bagMatch?.item.url
    });

    displayRandomAffirmation();
}

function displayRandomAffirmation() {
    const affirmationTextElement = document.getElementById('affirmation-text');
    if (affirmationTextElement) {
        const randomIndex = Math.floor(Math.random() * affirmations.length);
        affirmationTextElement.innerText = affirmations[randomIndex];
    }
}

function updateImages(urls) {
    const imageIds = ['top', 'bottom', 'hat', 'coat', 'shoes', 'bag'];
    imageIds.forEach(id => {
        const img = document.getElementById(`${id}-img`);
        if (img) {
            img.classList.remove('loaded');
        }
    });

    setTimeout(() => {
        imageIds.forEach(id => {
            const img = document.getElementById(`${id}-img`);
            const url = urls[id];
            if (img) {
                img.src = url || ''; // Use URL or clear if not provided
                if (url) {
                    img.onload = () => img.classList.add('loaded');
                }
            }
        });
    }, 200);
}

// Initialize
(async () => {
    await loadWardrobe();
})();
