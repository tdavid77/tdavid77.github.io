
    // --- CONFIGURATION ---
    const username = 'tdavid77';
    const repo = 'tdavid77.github.io';
    const path = 'images';
    // ---------------------

    let tops = [];
    let bottoms = [];

    // We store the whole file object now, not just the URL,
    // because we need to read the 'name' property later.

    async function loadWardrobe() {
    document.getElementById('status-text').innerText = "Scanning wardrobe tags...";

    try {
    const response = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`);
    if (!response.ok) throw new Error('Repo not found');
    const data = await response.json();

    data.forEach(file => {
    const name = file.name.toLowerCase();
    // We simply push the whole file object to the list
    if (name.startsWith('top')) {
    tops.push(file);
} else if (name.startsWith('bottom')) {
    bottoms.push(file);
}
});

    document.getElementById('status-text').innerText = `${tops.length} tops & ${bottoms.length} bottoms ready.`;
    generateOutfit();

} catch (error) {
    document.getElementById('status-text').innerText = "Error loading images.";
}
}

    function generateOutfit() {
    if (tops.length === 0 || bottoms.length === 0) return;

    // 1. Pick a Random Top
    const randomTop = tops[Math.floor(Math.random() * tops.length)];

    // 2. Decode the Top's "Style" tag
    // format: category_style_color_name.jpg
    // splitting by "_" gives us ["top", "formal", "white", "blouse.jpg"]
    const topParts = randomTop.name.split('_');

    let matchingBottoms = [];

    // Check if the file is named correctly (has at least 2 parts)
    if (topParts.length >= 2) {
    const topStyle = topParts[1]; // e.g., "formal" or "casual"

    // 3. Filter bottoms that match this style
    matchingBottoms = bottoms.filter(bottom => {
    const bottomParts = bottom.name.split('_');
    // Check if bottom has the same style tag
    return bottomParts.length >= 2 && bottomParts[1] === topStyle;
});
}

    // 4. Decide which bottom to pick
    let selectedBottom;

    if (matchingBottoms.length > 0) {
    // If we found matches, pick one of them!
    console.log("Match found! Using style logic.");
    selectedBottom = matchingBottoms[Math.floor(Math.random() * matchingBottoms.length)];
} else {
    // FALLBACK: If no matches found (or file named badly), pick ANY random bottom
    console.log("No match found, going fully random.");
    selectedBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
}

    // 5. Update the Screen (Fade effect logic)
    updateImages(randomTop.download_url, selectedBottom.download_url);
}

    function updateImages(topUrl, bottomUrl) {
    const topImg = document.getElementById("top-img");
    const botImg = document.getElementById("bottom-img");

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
    loadWardrobe();