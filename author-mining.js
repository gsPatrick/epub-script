const fs = require('fs');

try {
    const outros = JSON.parse(fs.readFileSync('outros.json', 'utf8'));
    console.log(`Minerando autores de ${outros.length} arquivos...`);

    const potentialAuthors = {};
    const blacklist = new Set(['portuguese', 'edition', 'editora', 'volume', 'livro', 'collection', 'best', 'stories', 'ebook', 'novel']);

    // Regex strategies to find authors
    // 1. "Title - Author.epub"
    // 2. "Author - Title.epub"
    // 3. "(Series) Title - Author.epub"

    // Heuristic: The part after the LAST hyphen is often the author (if hyphen exists).
    // Or the part BEFORE the first hyphen.

    outros.forEach(file => {
        // Remove extension
        let name = file.replace('.epub', '');

        // Strategy A: Split by " - "
        const parts = name.split(' - ');

        if (parts.length >= 2) {
            // Assume last part is Author (common in many collections)
            let authorCandidate = parts[parts.length - 1].trim();
            // Or first part
            let authorCandidateFirst = parts[0].trim();

            // Validate Candidate (must look like a name: No numbers, not too long, not known bad words)
            [authorCandidate, authorCandidateFirst].forEach(cand => {
                if (isValidName(cand)) {
                    // Normalize for counting
                    const key = cand.toLowerCase(); // keep casing for display?
                    if (!potentialAuthors[key]) potentialAuthors[key] = { name: cand, count: 0 };
                    potentialAuthors[key].count++;
                }
            });
        }
    });

    function isValidName(str) {
        if (!str) return false;
        if (str.length < 3 || str.length > 30) return false;
        if (/\d/.test(str)) return false; // Contains numbers
        if (strip(str).split(' ').length > 4) return false; // Too many words
        if (blacklist.has(strip(str))) return false;
        return true;
    }

    function strip(str) {
        return str.toLowerCase().replace(/[^a-z ]/g, '').trim();
    }

    // Sort by count
    const sorted = Object.values(potentialAuthors)
        .sort((a, b) => b.count - a.count)
        .slice(0, 200);

    console.log('🔍 TOP 200 CANDIDATOS A AUTORES (EXTRAÍDOS DE NOMES DE ARQUIVO):');
    sorted.forEach((item, idx) => {
        if (item.count > 5) {
            console.log(`${idx + 1}. ${item.name} (${item.count})`);
        }
    });

} catch (e) {
    console.error(e);
}
