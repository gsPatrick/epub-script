// Script para analisar categorização do pub.md
const fs = require('fs');

// Mapeamento de categorias (mesmo do server.js)
const CATEGORY_MAPPING = {
    "Fantasia": [
        "sarah j. maas", "holly black", "leigh bardugo", "brandon sanderson",
        "cassandra clare", "laini taylor", "victoria aveyard", "patrick rothfuss",
        "robin hobb", "joe abercrombie", "george r.r. martin", "r.r. martin",
        "trudi canavan", "andrzej sapkowski", "robert jordan", "terry goodkind",
        "terry pratchett", "neil gaiman", "ursula k. le guin", "j.r.r. tolkien",
        "c.s. lewis", "diana wynne jones", "juliet marillier", "maria v. snyder",
        "jennifer l. armentrout", "rebecca yarros", "maggie stiefvater", "v.e. schwab",
        "naomi novik", "samantha shannon", "tomi adeyemi", "sabaa tahir",
        "brigid kemmerer", "kerri maniscalco", "renee ahdieh",
        "marissa meyer", "kristin cashore", "rae carson", "marie lu",
        "shelby mahurin", "olivie blake", "elizabeth lim", "alexandra bracken",
        "corte de espinhos", "trono de vidro", "crescent city", "casa de terra",
        "povo do ar", "sombra e osso", "six of crows", "nascidos da bruma",
        "stormlight", "roda do tempo", "cronicas de gelo e fogo", "game of thrones",
        "instrumentos mortais", "cacadores de sombras", "dark artifices",
        "grisha", "rei corvo", "quarta asa", "chama de ferro", "empyrean",
        "dragao", "magia", "feiticeira", "bruxo", "elfo", "reino", "trono",
        "coroa", "cavaleiro", "espada", "harry potter", "rick riordan", "percy jackson",
        "cronicas de narnia", "senhor dos aneis", "hobbit", "witcher"
    ],

    "Romance": [
        "colleen hoover", "anna todd", "nicholas sparks", "sally thorne",
        "christina lauren", "ali hazelwood", "emily henry", "tessa bailey",
        "helena hunting", "penelope douglas", "elle kennedy", "lj shen",
        "monica murphy", "brittainy c. cherry", "mia sheridan", "tillie cole",
        "kristen callihan", "meghan quinn", "melanie harlow", "kate canterbary",
        "claire kingsley", "penny reid", "mariana zapata", "kristen ashley",
        "devney perry", "elsie silver", "sara cate", "jessa kane", "alexa riley",
        "julia quinn", "lisa kleypas", "eloisa james", "sarah maclean",
        "tessa dare", "lorraine heath", "mary balogh", "courtney milan",
        "joanna shupe", "lenora bell", "eva leigh", "grace burrowes",
        "elizabeth hoyt", "madeline hunter", "sabrina jeffries", "sophie jordan",
        "jennifer ashley", "anna campbell", "stephanie laurens", "meredith duran",
        "bridgertons", "ravenels", "wallflowers", "hathaways", "spindle cove",
        "duque e eu", "visconde", "condessa", "lorde", "lady",
        "romance", "amor", "paixao", "seducao", "noiva", "duque", "jojo moyes",
        "nora roberts", "danielle steel", "sylvain reynard"
    ],

    "Suspense e Thriller": [
        "gillian flynn", "paula hawkins", "ruth ware", "a.j. finn",
        "b.a. paris", "shari lapena", "karin slaughter", "lisa gardner",
        "tess gerritsen", "michael connelly", "lee child", "harlan coben",
        "james patterson", "dan brown", "john grisham", "jo nesbo",
        "stieg larsson", "camilla lackberg", "lars kepler", "jeffery deaver",
        "sebastian fitzek", "pierre lemaitre", "robert harris", "tom clancy",
        "thriller", "suspense", "assassino", "crime", "fbi", "serial killer"
    ],

    "Horror": [
        "stephen king", "richard bachman", "clive barker", "dean koontz",
        "peter straub", "shirley jackson", "h.p. lovecraft", "edgar allan poe",
        "joe hill", "paul tremblay", "grady hendrix", "josh malerman",
        "riley sager", "rachel harrison", "silvia moreno-garcia", "t. kingfisher",
        "horror", "terror", "assombracao", "fantasma", "monstro", "vampiro",
        "demonio", "maldito", "pesadelo", "sobrenatural", "anne rice"
    ],

    "Ficção Científica": [
        "frank herbert", "isaac asimov", "arthur c. clarke", "philip k. dick",
        "ray bradbury", "ursula k. le guin", "william gibson", "dan simmons",
        "orson scott card", "ann leckie", "n.k. jemisin", "liu cixin",
        "andy weir", "blake crouch", "margaret atwood", "cixin liu",
        "aldous huxley", "george orwell", "h.g. wells", "jules verne", "julio verne",
        "duna", "fundacao", "2001", "expanse", "three body problem",
        "ficcao cientifica", "sci-fi", "espacial", "distopia", "1984"
    ],

    "Jovem Adulto": [
        "suzanne collins", "veronica roth", "rainbow rowell",
        "john green", "jenny han", "becky albertalli", "adam silvera",
        "angie thomas", "nicola yoon", "stephanie perkins", "morgan matson",
        "kasie west", "jennifer niven", "gayle forman", "colleen houck",
        "tahereh mafi", "ally condie", "lauren oliver", "kiera cass",
        "kami garcia", "margaret stohl", "sara shepard", "richelle mead",
        "rachel caine", "rachel hawkins", "melissa de la cruz", "lauren kate",
        "jogos vorazes", "divergente", "selecao", "maze runner", "estilhaca-me",
        "pretty little liars", "terra de historias", "crepusculo", "twilight",
        "fallen", "hush hush", "becca fitzpatrick", "stephenie meyer"
    ],

    "Autoajuda": [
        "jordan peterson", "brene brown", "simon sinek", "james clear",
        "cal newport", "ryan holiday", "mark manson", "dale carnegie",
        "napoleon hill", "stephen covey", "tony robbins", "robin sharma",
        "paulo vieira", "augusto cury", "flavio augusto", "lair ribeiro",
        "gustavo cerbasi", "daniel goleman", "carol dweck", "gretchen rubin",
        "marie kondo", "jay shetty", "mel robbins", "brendon burchard",
        "autoajuda", "habitos", "produtividade", "sucesso", "mindset",
        "motivacao", "superacao", "lideranca", "inteligencia emocional",
        "regras para a vida", "atomic habits", "como fazer amigos"
    ],

    "Literatura Clássica": [
        "machado de assis", "jose saramago", "jorge amado", "eca de queiros",
        "fernando pessoa", "clarice lispector", "jane austen", "charles dickens",
        "leo tolstoy", "fyodor dostoevsky", "fiodor dostoievski", "dostoievski",
        "franz kafka", "virginia woolf", "ernest hemingway", "f. scott fitzgerald",
        "oscar wilde", "mark twain", "victor hugo", "honore de balzac",
        "gustave flaubert", "stendhal", "emily bronte", "charlotte bronte"
    ],

    "Negócios e Economia": [
        "peter drucker", "robert kiyosaki", "warren buffett", "ray dalio",
        "nassim taleb", "benjamin graham", "phil knight", "reed hastings",
        "eric ries", "peter thiel", "tim ferriss", "gary vaynerchuk",
        "seth godin", "malcolm gladwell", "daniel kahneman", "richard thaler",
        "negocios", "economia", "empreendedorismo", "startups", "investimento",
        "financas", "marketing", "gestao", "dinheiro", "riqueza", "bolsa"
    ],

    "Religião e Espiritualidade": [
        "timothy keller", "max lucado", "joyce meyer",
        "john piper", "padre marcelo rossi", "papa francisco",
        "dalai lama", "thich nhat hanh", "eckhart tolle", "deepak chopra",
        "paulo coelho", "allan kardec", "chico xavier", "zibia gasparetto",
        "monja coen", "osho", "biblia", "deus", "jesus", "espirito", "fe", "oracao",
        "evangelico", "catolico", "espirita", "budismo", "meditacao", "patristica"
    ],

    "História": [
        "yuval noah harari", "laurentino gomes", "eduardo bueno", "mary del priore",
        "boris fausto", "lilia schwarcz", "antony beevor", "ian kershaw",
        "max hastings", "dan jones", "tom holland", "simon sebag montefiore",
        "niall ferguson", "jared diamond", "eric hobsbawm",
        "historia", "guerra mundial", "segunda guerra", "primeira guerra",
        "imperio", "revolucao", "civilizacao", "1808", "1822", "1889", "1964",
        "bernard cornwell", "ken follett"
    ],

    "Filosofia": [
        "seneca", "marco aurelio", "epicteto", "platao", "aristoteles",
        "nietzsche", "schopenhauer", "kant", "hegel", "descartes",
        "sartre", "camus", "foucault", "deleuze", "slavoj zizek",
        "mario sergio cortella", "leandro karnal", "luiz felipe ponde",
        "filosofia", "estoicismo", "existencialismo"
    ],

    "Psicologia": [
        "sigmund freud", "carl jung", "viktor frankl", "irvin yalom",
        "psicologia", "psicanalise", "terapia", "ansiedade", "depressao", "trauma"
    ],

    "Policial e Mistério": [
        "agatha christie", "arthur conan doyle", "sherlock holmes", "hercule poirot",
        "miss marple", "andrea camilleri", "robert galbraith", "richard osman",
        "louise penny", "peter robinson", "ian rankin",
        "j.d. robb", "detetive", "investigacao", "assassinato", "mistério", "mortal"
    ],

    "Romance Erótico": [
        "e.l. james", "sylvia day", "meredith wild", "anna zaires",
        "pepper winters", "kitty thomas", "sierra simone",
        "cinquenta tons", "fifty shades", "dark romance", "erotico",
        "bdsm", "submissa", "dominador"
    ],

    "HQs e Mangás": [
        "hq", "manga", "graphic novel", "quadrinho", "comic", "marvel",
        "dc comics", "batman", "spider-man", "x-men", "avengers",
        "naruto", "one piece", "attack on titan", "death note",
        "turma da monica"
    ],

    "Infantil": [
        "roald dahl", "monteiro lobato", "sitio do picapau", "ana maria machado",
        "ruth rocha", "ziraldo", "infantil", "crianca", "fabula", "disney",
        "pequeno principe", "chris colfer"
    ],

    "Saúde e Bem-Estar": [
        "saude", "medicina", "dieta", "nutricao", "emagrecimento",
        "exercicio", "fitness", "yoga", "alimentacao", "jejum"
    ],

    "Direito": [
        "direito", "juridico", "lei", "codigo civil", "codigo penal",
        "constituicao", "advocacia", "processo"
    ],

    "Culinária": [
        "receita", "culinaria", "gastronomia", "cozinha", "chef", "bolo", "panelinha"
    ],

    "Ciências": [
        "fisica", "quimica", "biologia", "matematica", "astronomia",
        "neurociencia", "darwin", "einstein", "hawking", "universo", "cosmos"
    ]
};

function normalizeString(str) {
    return str.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, ' ');
}

function categorizeFile(filename) {
    const normalized = normalizeString(filename);

    for (const [category, keywords] of Object.entries(CATEGORY_MAPPING)) {
        if (category === 'Outros') continue;
        for (const keyword of keywords) {
            if (normalized.includes(keyword)) {
                return category;
            }
        }
    }
    return 'Outros';
}

// Ler o arquivo pub.md
const content = fs.readFileSync('pub.md', 'utf8');
const files = content.split('\n').filter(line => line.trim().endsWith('.epub'));

console.log(`\n📊 ANÁLISE DE CATEGORIZAÇÃO`);
console.log(`${'='.repeat(50)}`);
console.log(`Total de arquivos: ${files.length}\n`);

// Contar por categoria
const counts = {};
const outros = [];

for (const file of files) {
    const category = categorizeFile(file);
    counts[category] = (counts[category] || 0) + 1;
    if (category === 'Outros') {
        outros.push(file);
    }
}

// Ordenar por quantidade
const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

console.log('📁 DISTRIBUIÇÃO POR CATEGORIA:\n');
for (const [category, count] of sorted) {
    const percent = ((count / files.length) * 100).toFixed(1);
    const bar = '█'.repeat(Math.floor(percent / 2));
    console.log(`${category.padEnd(25)} ${count.toString().padStart(6)} (${percent.padStart(5)}%) ${bar}`);
}

const outrosPercent = ((counts['Outros'] || 0) / files.length * 100).toFixed(1);
console.log(`\n✅ Categorizados: ${files.length - (counts['Outros'] || 0)} arquivos (${(100 - outrosPercent).toFixed(1)}%)`);
console.log(`❌ Em "Outros": ${counts['Outros'] || 0} arquivos (${outrosPercent}%)`);

// Mostrar amostra de "Outros"
if (outros.length > 0) {
    console.log(`\n📋 AMOSTRA DE ARQUIVOS EM "OUTROS" (primeiros 20):\n`);
    for (const file of outros.slice(0, 20)) {
        console.log(`  - ${file}`);
    }
}
