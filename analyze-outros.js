const fs = require('fs');

const CATEGORY_MAPPING = {
  // === FANTASIA ===
  "Fantasia": [
    // Autores internacionais
    "sarah j. maas", "holly black", "leigh bardugo", "brandon sanderson",
    "cassandra clare", "laini taylor", "victoria aveyard", "patrick rothfuss",
    "robin hobb", "joe abercrombie", "george r.r. martin", "r.r. martin", "george martin",
    "trudi canavan", "andrzej sapkowski", "robert jordan", "terry goodkind",
    "terry pratchett", "neil gaiman", "ursula k. le guin", "j.r.r. tolkien",
    "diana wynne jones", "juliet marillier", "maria v. snyder",
    "jennifer l. armentrout", "rebecca yarros", "maggie stiefvater", "v.e. schwab",
    "v. e. schwab", "naomi novik", "samantha shannon", "tomi adeyemi", "sabaa tahir",
    "brigid kemmerer", "kerri maniscalco", "renee ahdieh",
    "marissa meyer", "kristin cashore", "rae carson", "marie lu",
    "shelby mahurin", "olivie blake", "elizabeth lim", "alexandra bracken",
    "rick riordan", "j.k. rowling", "philip pullman", "chris colfer",
    "c.s. pacat", "sarah rees brennan", "holly black", "cassie clare",
    "joseph delaney", "derek landy", "eoin colfer", "christopher paolini",
    "tamora pierce", "mercedes lackey", "anne mccaffrey", "raymond e. feist",
    "david eddings", "r.a. salvatore", "margaret weis", "tracy hickman",
    "kristen ciccarelli", "traci chee", "renee dugan", "chloe gong",
    "roshani chokshi", "soman chainani", "melissa albert", "margaret rogerson",
    "heather fawcett", "emily lloyd-jones", "susan dennard", "elly blake",
    "morgan rhodes", "amy ewing", "kendare blake", "erin bowman",
    "scott lynch", "brent weeks", "peter v. brett", "brian mcclellan",
    "michael j. sullivan", "nicholas eames", "josiah bancroft", "brian staveley",
    "morgan rice", "anne bishop", "marion zimmer bradley", "kristin cast",
    "sapir englard", "kim richardson", "p.c. cast", "serena valentino",
    "charlaine harris", "richelle mead", "l.j. smith", "steven erikson",
    "mark lawrence", "garth nix", "jonathan stroud", "rf kuang",
    // Autores brasileiros
    "eduardo spohr", "raphael draccon", "affonso solano", "ana lúcia merege",
    "andre vianco", "leonel caldela", "felipe castilho", "tiago toy",
    // Séries famosas
    "percy jackson", "harry potter", "terra de historias", "fronteiras do universo",
    "corte de espinhos", "trono de vidro", "crescent city", "casa de terra",
    "povo do ar", "sombra e osso", "six of crows", "nascidos da bruma",
    "stormlight", "roda do tempo", "cronicas de gelo e fogo", "game of thrones",
    "instrumentos mortais", "cacadores de sombras", "dark artifices",
    "grisha", "rei corvo", "quarta asa", "chama de ferro", "empyrean",
    "viloes", "cronicas de narnia", "senhor dos aneis", "hobbit",
    "escola do bem e do mal", "mar de tinta e ouro", "iskari", "graceling",
    "seis grous", "passaro e serpente", "sangue e mel", "deuses e monstros",
    "batalha do apocalipse", "filhos do eden", "legado de orisha",
    "magisterium", "ordem da escuridao", "bruxa negra", "estranho sonhador",
    "fundadores", "rastro de sangue", "sonhador", "prazeres violentos",
    "os lobos do milenio", "millenium wolves", "house of night", "vampire academy",
    // Palavras-chave
    "dragao", "feiticeira", "bruxo", "elfo", "magia", "reino encantado", "lobisomem", "vampiro"
  ],

  // === ROMANCE ===
  "Romance": [
    // Autores contemporâneos internacionais
    "colleen hoover", "anna todd", "nicholas sparks", "sally thorne",
    "christina lauren", "ali hazelwood", "emily henry", "tessa bailey",
    "helena hunting", "penelope douglas", "elle kennedy", "lj shen",
    "monica murphy", "brittainy c. cherry", "mia sheridan", "tillie cole",
    "kristen callihan", "meghan quinn", "melanie harlow", "kate canterbary",
    "claire kingsley", "penny reid", "mariana zapata", "kristen ashley",
    "devney perry", "elsie silver", "sara cate", "jessa kane",
    "jojo moyes", "danielle steel", "nora roberts", "sylvain reynard",
    "cecelia ahern", "nicholas sparks", "marian keyes", "sophie kinsella",
    "jenny colgan", "sheila o'flanagan", "karen swan", "veronica henry",
    "luanne rice", "debbie macomber", "robyn carr", "susan mallery",
    "brenda novak", "raeanne thayne", "maisey yates", "carly phillips",
    "jennifer probst", "kendall ryan", "lauren blakely", "meghan march",
    "carrie ann ryan", "corinne michaels", "catherine bybee", "marie force",
    "jay crownover", "jamie shaw", "j. lynn", "jennifer armentrout",
    "sarina bowen", "elle casey", "bella andre", "melody anne",
    "meg cabot", "lucinda riley", "linda lael miller", "emma leech",
    "regine abel", "vi keeland", "penelope ward", "t.l. swan", "j.t. geissinger",
    "alessandra torre", "pam godwin", "k. bromberg", "laurelin paige",
    "maya banks", "katy evans", "alice clayton", "christina ross",
    "madeleine gray", "carly phillips", "erika wilde", "lisa renee jones",
    // Autores históricos
    "julia quinn", "lisa kleypas", "eloisa james", "sarah maclean",
    "tessa dare", "lorraine heath", "mary balogh", "courtney milan",
    "joanna shupe", "lenora bell", "eva leigh", "grace burrowes",
    "elizabeth hoyt", "madeline hunter", "sabrina jeffries", "sophie jordan",
    "jennifer ashley", "anna campbell", "stephanie laurens", "meredith duran",
    "sherry thomas", "carolyn jewel", "anne gracie", "olivia drake",
    "laura lee guhrke", "kerrigan byrne", "scarlett peckham", "joanna bourne",
    "beverley jenkins", "alyssa cole", "courtney milan", "cat sebastian",
    "simon scarrow", "philippa gregory", "diana gabaldon", "outlander",
    // Harlequin e outros
    "candace camp", "jess michaels", "blythe gifford", "marguerite kaye",
    "michelle willingham", "carol townend", "joanna fulford", "denise lynn",
    "juliet landon", "carole mortimer", "margaret moore", "deborah simmons",
    "nicola cornick", "judith mcnaught", "johanna lindsey", "jude deveraux",
    "erin watt", "kathleen woodiwiss", "bertrice small", "virginia henley",
    "beatriz williams", "pam jenoff", "kate quinn", "ariel lawhon",
    // Autoras brasileiras
    "zibia gasparetto", "martha medeiros", "clarice lispector", "carina rissi",
    "paula pimenta", "babi dewet", "bruna vieira", "thalita reboucas",
    // J.R. Ward e paranormal romance
    "j.r. ward", "jr ward", "irmandade da adaga negra", "sherrilyn kenyon",
    "kresley cole", "gena showalter", "nalini singh", "larissa ione",
    "lara adrian", "cynthia eden", "alexandra ivy", "lynsay sands",
    "christine feehan", "jeaniene frost", "kelley armstrong", "patricia briggs",
    // Séries
    "bridgertons", "ravenels", "wallflowers", "hathaways", "spindle cove",
    "duque e eu", "visconde", "condessa", "lorde", "lady",
    "westcott", "travis family", "travis #", "girl meets duke",
    "os rokesbys", "dois duques", "numeros do amor", "irmaos macgregor",
    "sins for all seasons", "orfaos de saint james", "guilty series",
    "royal brotherhood", "rrh #",
    // Palavras-chave
    "noiva", "duque", "seducao", "paixao", "amor", "romance", "clube do livro"
  ],

  // === JOVEM ADULTO (YA) ===
  "Jovem Adulto": [
    // Autores
    "suzanne collins", "veronica roth", "rainbow rowell",
    "john green", "jenny han", "becky albertalli", "adam silvera",
    "angie thomas", "nicola yoon", "stephanie perkins", "morgan matson",
    "kasie west", "jennifer niven", "gayle forman", "colleen houck",
    "tahereh mafi", "ally condie", "lauren oliver", "kiera cass",
    "kami garcia", "margaret stohl", "sara shepard", "richelle mead",
    "rachel caine", "rachel hawkins", "melissa de la cruz", "lauren kate",
    "becca fitzpatrick", "stephenie meyer", "james dashner", "neal shusterman",
    "sarah mlynowski", "kass morgan", "beth reekles", "anna godbersen",
    "abbi glines", "jamie mcguire", "s.c. stephens", "tammara webber",
    "molly mcadams", "jessica sorensen", "katie mcgarry", "simone elkeles",
    "elizabeth scott", "sarah dessen", "deb caletti", "sarah ockler",
    "maurene goo", "julie murphy", "emery lord", "siobhan vivian",
    "e. lockhart", "libba bray", "maureen johnson", "erin watt",
    "leila sales", "jennifer echols", "miranda kenneally", "katie cotugno",
    "alison cherry", "kristin rae", "jenn bennett", "jenna evans welch",
    "holly jackson", "karen mcmanus", "alice oseman", "katrina kahler",
    "pittacus lore", "rebecca hanover", "manu gavassi",
    // Séries
    "era outra vez", "the 100", "jogos vorazes", "divergente", "selecao",
    "maze runner", "estilhaca-me", "shatter me", "pretty little liars", "pll",
    "crepusculo", "twilight", "fallen", "hush hush", "renegados", "simon snow",
    "scythe", "ceifador", "stars", "after", "barraca do beijo",
    "para todos os garotos", "diario de um banana", "os similares",
    "garotos corvos", "corte de chamas", "novembro 9",
    // Palavras-chave
    "young adult", "ya", "adolescente"
  ],

  // === SUSPENSE E THRILLER ===
  "Suspense e Thriller": [
    // Autores
    "gillian flynn", "paula hawkins", "ruth ware", "a.j. finn",
    "b.a. paris", "shari lapena", "karin slaughter", "lisa gardner",
    "tess gerritsen", "michael connelly", "lee child", "harlan coben",
    "james patterson", "dan brown", "john grisham", "jo nesbo",
    "stieg larsson", "camilla lackberg", "lars kepler", "jeffery deaver",
    "sebastian fitzek", "pierre lemaitre", "robert harris", "tom clancy",
    "blake pierce", "charlie donlea", "peter swanson", "megan miranda",
    "mary kubica", "alafair burke", "wendy walker", "heather gudenkauf",
    "kimberly belle", "karen cleveland", "jessica barry", "samantha downing",
    "alex michaelides", "lisa jewell", "riley sager", "greer hendricks",
    "sarah pekkanen", "laura dave", "ashley audrain", "jessica knoll",
    "catherine steadman", "daniel silva", "brad thor", "vince flynn",
    "brad meltzer", "david baldacci", "nelson demille", "jack mars",
    "robert ludlum", "frederick forsyth", "ken follett", "jack higgins",
    "freida mcfadden", "patrick logan", "sidney sheldon", "jeffrey archer",
    "james rollins", "robert bryndza", "luke jennings", "killing eve",
    // Autores brasileiros
    "raphael montes", "ilana casoy", "patricia melo",
    // Palavras-chave
    "thriller", "suspense", "assassino", "serial killer", "fbi", "cia"
  ],

  // === POLICIAL E MISTÉRIO ===
  "Policial e Mistério": [
    // Autores
    "agatha christie", "arthur conan doyle", "sherlock holmes", "hercule poirot",
    "miss marple", "andrea camilleri", "robert galbraith", "richard osman",
    "louise penny", "peter robinson", "ian rankin", "val mcdermid",
    "ann cleeves", "deborah crombie", "elizabeth george", "martha grimes",
    "p.d. james", "ruth rendell", "minette walters", "mo hayder",
    "tana french", "denise mina", "stuart macbride", "mark billingham",
    "peter james", "simon kernick", "remy eyssen", "jussi adler-olsen",
    "maurice leblanc", "arsene lupin", "arturo perez-reverte", "perez-reverte",
    "gk chesterton", "wilkie collins", "edgar wallace", "rex stout",
    // Séries
    "cormoran strike", "serie mortal", "j.d. robb", "j. d. robb",
    "clube das mulheres", "detetive cormoran", "inspector lynley",
    // Palavras-chave
    "detetive", "investigacao", "mortal #", "policial", "crime"
  ],

  // === HORROR ===
  "Horror": [
    // Autores
    "stephen king", "richard bachman", "clive barker", "dean koontz",
    "peter straub", "shirley jackson", "h.p. lovecraft", "edgar allan poe",
    "joe hill", "paul tremblay", "grady hendrix", "josh malerman",
    "riley sager", "rachel harrison", "silvia moreno-garcia", "t. kingfisher",
    "anne rice", "bram stoker", "mary shelley", "richard matheson",
    "ira levin", "thomas harris", "peter benchley", "william peter blatty",
    "john saul", "bentley little", "jack ketchum", "richard laymon",
    "brian keene", "jonathan maberry", "f. paul wilson", "robert mccammon",
    "dan simmons", "laird barron", "john langan", "thomas ligotti",
    "scott cawthon", "darcy coates", "junji ito", "caitlin r. kiernan",
    // Autores brasileiros
    "andre vianco", "raphael draccon", "rodrigo de oliveira",
    // Palavras-chave
    "horror", "terror", "assombracao", "fantasma", "monstro", "vampiro",
    "demonio", "maldito", "pesadelo", "sobrenatural", "morte", "zumbi",
    "fnaf", "five nights at freddys"
  ],

  // === FICÇÃO CIENTÍFICA ===
  "Ficção Científica": [
    // Autores clássicos
    "frank herbert", "isaac asimov", "arthur c. clarke", "philip k. dick",
    "ray bradbury", "ursula k. le guin", "william gibson", "dan simmons",
    "orson scott card", "ann leckie", "n.k. jemisin", "liu cixin", "cixin liu",
    "andy weir", "blake crouch", "margaret atwood",
    "aldous huxley", "george orwell", "h.g. wells", "jules verne", "julio verne",
    "robert a. heinlein", "frederik pohl", "larry niven", "jerry pournelle",
    "poul anderson", "gregory benford", "greg bear", "david brin",
    "vernor vinge", "charles stross", "alastair reynolds", "peter hamilton",
    "iain m. banks", "kim stanley robinson", "neal stephenson", "ted chiang",
    "octavia butler", "samuel r. delany", "connie willis", "lois mcmaster bujold",
    "john scalzi", "james s.a. corey", "becky chambers", "martha wells",
    "matt haig", "douglas adams", "star wars", "timothy zahn",
    // Séries
    "duna", "fundacao", "2001", "expanse", "three body problem",
    "problema dos tres corpos", "floresta sombria", "ender", "marte",
    "guia do mochileiro",
    // Palavras-chave
    "ficcao cientifica", "sci-fi", "espacial", "alienigena", "futuro", "distopia"
  ],

  // === AUTOAJUDA ===
  "Autoajuda": [
    // Autores internacionais
    "jordan peterson", "brene brown", "simon sinek", "james clear",
    "cal newport", "ryan holiday", "mark manson", "dale carnegie",
    "napoleon hill", "stephen covey", "tony robbins", "robin sharma",
    "brian tracy", "zig ziglar", "jim rohn", "les brown",
    "jack canfield", "wayne dyer", "deepak chopra", "don miguel ruiz",
    "eckhart tolle", "rhonda byrne", "louise hay", "gabor mate",
    "brene brown", "adam grant", "angela duckworth", "grit",
    "charles duhigg", "atomic habits", "poder do habito", "karen rinaldi",
    // Autores brasileiros
    "paulo vieira", "augusto cury", "flavio augusto", "lair ribeiro",
    "gustavo cerbasi", "roberto shinyashiki", "renato cardoso",
    "cristiane cardoso", "tiago brunet", "deive leonardo", "thiago nigro",
    "joel jota", "primo rico",
    // Palavras-chave
    "autoajuda", "habitos", "produtividade", "sucesso", "mindset",
    "motivacao", "superacao", "lideranca", "inteligencia emocional",
    "desenvolvimento pessoal", "coaching", "regras para a vida"
  ],

  // === LITERATURA CLÁSSICA ===
  "Literatura Clássica": [
    // Autores brasileiros
    "machado de assis", "jose saramago", "jorge amado", "eca de queiros",
    "fernando pessoa", "clarice lispector", "guimaraes rosa", "graciliano ramos",
    "jose de alencar", "aluisio azevedo", "castro alves", "olavo bilac",
    "gonçalves dias", "manuel bandeira", "carlos drummond", "cecilia meireles",
    "rachel de queiroz", "lygia fagundes telles", "rubem fonseca",
    "monteiro lobato", "lima barreto", "euclides da cunha",
    "ariano suassuna", "joao cabral de melo neto",
    // Autores internacionais
    "jane austen", "charles dickens", "leo tolstoy", "fyodor dostoevsky",
    "fiodor dostoievski", "dostoievski", "franz kafka", "virginia woolf",
    "ernest hemingway", "f. scott fitzgerald", "oscar wilde", "mark twain",
    "victor hugo", "honore de balzac", "gustave flaubert", "stendhal",
    "emily bronte", "charlotte bronte", "thomas hardy", "george eliot",
    "henry james", "herman melville", "nathaniel hawthorne",
    "gabriel garcia marquez", "jorge luis borges", "julio cortazar",
    "mario vargas llosa", "pablo neruda", "octavio paz", "isabel allende",
    "lucy maud montgomery", "l.m. montgomery", "anne de green gables",
    "william shakespeare", "thomas mann", "alexandre dumas", "hermann hesse",
    "umberto eco", "carlos ruiz zafon", "liev tolstoi", "tolstoi",
    "mia couto", "valter hugo mae", "haruki murakami", "charles bukowski",
    "marcel proust", "james joyce", "homero", "dante alighieri"
  ],

  // === NEGÓCIOS E ECONOMIA ===
  "Negócios e Economia": [
    // Autores
    "peter drucker", "robert kiyosaki", "warren buffett", "ray dalio",
    "nassim taleb", "benjamin graham", "phil knight", "reed hastings",
    "eric ries", "peter thiel", "tim ferriss", "gary vaynerchuk",
    "seth godin", "malcolm gladwell", "daniel kahneman", "richard thaler",
    "walter isaacson", "ben horowitz", "michael porter", "jim collins",
    "patrick lencioni", "simon sinek", "clayton christensen", "geoffrey moore",
    "al ries", "jack trout", "philip kotler", "david ogilvy",
    // Palavras-chave
    "negocios", "empreendedorismo", "startups", "investimento",
    "financas", "marketing", "gestao", "bolsa", "dinheiro",
    "economia", "lideranca empresarial", "vendas", "estrategia"
  ],

  // === RELIGIÃO E ESPIRITUALIDADE ===
  "Religião e Espiritualidade": [
    // Autores cristãos
    "c.s. lewis", "timothy keller", "max lucado", "joyce meyer",
    "john piper", "padre marcelo rossi", "papa francisco", "john macarthur",
    "charles spurgeon", "billy graham", "rick warren", "john maxwell",
    "lee strobel", "josh mcdowell", "ravi zacharias", "william lane craig",
    "tim lahaye", "edir macedo", "silas malafaia", "rr soares",
    // Autores espíritas
    "allan kardec", "chico xavier", "zibia gasparetto", "divaldo franco",
    "richard simonetti", "herminio miranda", "haroldo dutra dias",
    "yvonne do amaral pereira", "emmanuel", "andre luiz",
    // Outros
    "dalai lama", "thich nhat hanh", "eckhart tolle", "deepak chopra",
    "paulo coelho", "monja coen", "osho", "alan watts", "krishnamurti",
    // Palavras-chave
    "biblia", "jesus cristo", "oracao", "igreja", "evangelico",
    "catolico", "espirita", "budismo", "espiritualidade", "patristica",
    "deus", "santo", "apostolo", "profeta"
  ],

  // === HISTÓRIA ===
  "História": [
    // Autores brasileiros
    "laurentino gomes", "eduardo bueno", "mary del priore", "boris fausto",
    "lilia schwarcz", "jose murilo de carvalho", "marcos napolitano",
    "elio gaspari", "pedro doria", "leandro narlocus",
    // Autores internacionais
    "yuval noah harari", "antony beevor", "ian kershaw", "max hastings",
    "dan jones", "tom holland", "simon sebag montefiore", "niall ferguson",
    "jared diamond", "eric hobsbawm", "fernand braudel", "barbara tuchman",
    "doris kearns goodwin", "david mccullough", "ron chernow", "walter isaacson",
    "eduardo galeano", "howard zinn", "herodotus", "tucidides",
    // Ficção histórica
    "bernard cornwell", "ken follett", "hilary mantel", "philippa gregory",
    "kate quinn", "kristin hannah", "paula mclain", "sarah dunant",
    "conn iggulden", "maurice druon",
    // Palavras-chave
    "historia", "history", "guerra mundial", "segunda guerra", "primeira guerra",
    "imperio romano", "1808", "1822", "1889", "1964", "historia do brasil",
    "revolucao francesa", "idade media", "ditadura", "nazismo", "holocausto"
  ],

  // === FILOSOFIA ===
  "Filosofia": [
    // Clássicos
    "seneca", "marco aurelio", "epicteto", "platao", "aristoteles",
    "socrates", "pitagoras", "heraclito", "parmenides", "tales",
    // Modernos
    "nietzsche", "schopenhauer", "kant", "hegel", "descartes",
    "spinoza", "leibniz", "locke", "hume", "berkeley",
    // Contemporâneos
    "sartre", "camus", "foucault", "deleuze", "derrida",
    "slavoj zizek", "byung-chul han", "hannah arendt", "simone de beauvoir",
    "zygmunt bauman", "bell hooks", "judith butler", "noam chomsky",
    "karl marx", "friedrich engels", "adam smith", "montesquieu", "rousseau",
    // Brasileiros
    "mario sergio cortella", "leandro karnal", "luiz felipe ponde",
    "clovis de barros filho", "olavo de carvalho", "marilena chaui",
    // Palavras-chave
    "filosofia", "estoicismo", "existencialismo", "metafisica", "etica",
    "politica", "sociologia"
  ],

  // === PSICOLOGIA ===
  "Psicologia": [
    // Autores
    "sigmund freud", "carl jung", "viktor frankl", "irvin yalom",
    "carl rogers", "b.f. skinner", "albert bandura", "aaron beck",
    "martin seligman", "daniel kahneman", "mihaly csikszentmihalyi",
    "howard gardner", "robert cialdini", "dan ariely", "daniel gilbert",
    "steven pinker", "jonathan haidt", "paul ekman", "amy cuddy",
    "oliver sacks", "jordan peterson", "brene brown", "esther perel",
    "andrew solomon", "karen horney", "melanie klein", "jacques lacan",
    // Palavras-chave
    "psicologia", "psicanalise", "terapia", "ansiedade", "depressao",
    "trauma", "inconsciente", "cognitivo", "comportamento", "mente",
    "neurociencia", "cerebro"
  ],

  // === ROMANCE ERÓTICO ===
  "Romance Erótico": [
    // Autores
    "e.l. james", "sylvia day", "meredith wild", "anna zaires",
    "pepper winters", "kitty thomas", "sierra simone", "alexa riley",
    "jade west", "pam godwin", "skye warren", "cd reiss",
    "kendall ryan", "lauren blakely", "vi keeland", "penelope ward",
    "rina kent", "audrey carlan", "megan maxwell", "elle kennedy",
    "sarina bowen", "helen hardt", "laurelin paige", "blair holden",
    // Palavras-chave
    "cinquenta tons", "fifty shades", "dark romance", "erotico",
    "bdsm", "submissa", "dominador", "proibido", "hot"
  ],

  // === HQs E MANGÁS ===
  "HQs e Mangás": [
    // Palavras-chave
    "hq", "manga", "graphic novel", "quadrinho", "comic", "marvel",
    "dc comics", "batman", "spider-man", "x-men", "naruto", "one piece",
    "demon slayer", "attack on titan", "my hero academia", "death note",
    "turma da monica", "mauricio de sousa", "neil gaiman", "sandman",
    "alan moore", "frank miller", "stan lee"
  ],

  // === INFANTIL ===
  "Infantil": [
    // Autores
    "roald dahl", "monteiro lobato", "ana maria machado", "ruth rocha",
    "ziraldo", "eva furnari", "mauricio de sousa", "sylvia orthof",
    "fernanda lopes de almeida", "mary pope osborne", "r.l. stine",
    "lemony snicket", "jeff kinney", "rachel renee russell",
    "dr. seuss", "beatrix potter", "lewis carroll", "a.a. milne",
    "antoine de saint-exupery", "felix salten",
    // Palavras-chave
    "infantil", "fabula", "disney", "pequeno principe", "crianca",
    "sitio do picapau", "contos de fadas", "diario de um banana", "bambi"
  ],

  // === SAÚDE E BEM-ESTAR ===
  "Saúde e Bem-Estar": [
    // Palavras-chave
    "medicina", "nutricao", "emagrecimento", "fitness", "yoga", "jejum",
    "dieta", "low carb", "whole30", "saude", "corpo", "mente sa",
    "enfermagem", "anatomia", "fisiologia", "doenca", "cura"
  ],

  // === DIREITO ===
  "Direito": [
    // Palavras-chave
    "direito", "juridico", "lei", "codigo civil", "codigo penal",
    "constituicao", "advocacia", "processo", "curso de direito",
    "vademecum", "oab", "concurso", "juridica", "legislacao"
  ],

  // === CULINÁRIA ===
  "Culinária": [
    // Autores
    "rita lobo", "jamie oliver", "paola carosella", "gordon ramsay",
    "anthony bourdain", "nigella lawson", "palmirinha",
    // Palavras-chave
    "receita", "culinaria", "gastronomia", "cozinha", "chef", "bolo", "panelinha",
    "alimentacao", "vegana", "vegetariana", "churrasco"
  ],

  // === CIÊNCIAS ===
  "Ciências": [
    // Autores
    "carl sagan", "stephen hawking", "neil degrasse tyson", "richard dawkins",
    "charles darwin", "albert einstein", "richard feynman", "marie curie",
    "michio kaku", "brian greene", "bill bryson",
    // Palavras-chave
    "fisica", "quimica", "biologia", "matematica", "astronomia",
    "neurociencia", "darwin", "einstein", "hawking", "universo", "cosmos",
    "evolucao", "ciencia"
  ],

  // === BIOGRAFIAS ===
  "Biografias": [
    "biografia", "autobiografia", "memorias", "vida de",
    "minha historia", "diario de", "biography", "memoir"
  ],

  // === CONTOS E CRÔNICAS (NOVA CATEGORIA) ===
  "Contos e Crônicas": [
    "luis fernando verissimo", "rubem braga", "fernando sabino",
    "carlos heitor cony", "mario prata", "stanislaw ponte preta",
    "contos", "cronicas", "antologia", "coletanea"
  ],

  // === OUTROS (FALLBACK) ===
  "Outros": []
};
// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function normalizeString(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');
}

function categorizeFile(filename) {
  const normalized = normalizeString(filename);

  let bestCategory = 'Outros';
  let maxMatches = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_MAPPING)) {
    if (category === 'Outros') continue;

    let matches = 0;
    for (const keyword of keywords) {
      const normalizedKeyword = normalizeString(keyword);
      if (normalized.includes(normalizedKeyword)) {
        matches++;
      }
    }

    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = category;
    } else if (matches === maxMatches && matches > 0) {
      if (category < bestCategory) {
        bestCategory = category;
      }
    }
  }

  return bestCategory;
}

// ============================================================
// FUNÇÕES DA API pCloud
// ============================================================

// Ler o arquivo pub.md
const content = fs.readFileSync('pub.md', 'utf8');
const files = content.split('\n').filter(line => line.trim().endsWith('.epub'));

// Output analysis only for Outros frequencies
// ...

const outros = [];
for (const file of files) {
  if (categorizeFile(file) === 'Outros') {
    outros.push(file);
  }
}

console.log(`\n🔍 Analisando ${outros.length} arquivos não categorizados ('Outros')...`);

// Tokenize and count
const wordCounts = {};
const pairCounts = {}; // To find full names "Name Surname"

// Words to ignore
const IGNORE = new Set(['epub', 'livro', 'volume', 'capitulo', 'completo', 'serie', 'trilogia', 'colecao', 'edicao', 'nova', 'novo', 'para', 'com', 'dos', 'das', 'uma', 'pelo', 'version', 'the', 'library']);

for (const filename of outros) {
  // Normalize but keep structure mostly
  const norm = normalizeString(filename);
  const words = norm.split(/\s+/).filter(w => w.length > 2 && !/^\d+$/.test(w) && !IGNORE.has(w));

  // Count words
  for (const w of words) {
    wordCounts[w] = (wordCounts[w] || 0) + 1;
  }

  // Count pairs
  for (let i = 0; i < words.length - 1; i++) {
    const pair = `${words[i]} ${words[i + 1]}`;
    // Filter out pairs containing ignored words
    if (!IGNORE.has(words[i]) && !IGNORE.has(words[i + 1])) {
      pairCounts[pair] = (pairCounts[pair] || 0) + 1;
    }
  }
}

// Convert to array and sort
const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]).slice(0, 100);
const sortedPairs = Object.entries(pairCounts).sort((a, b) => b[1] - a[1]).slice(0, 100);

console.log('\n🔤 Top 50 Palavras Frequentes em OUTROS:');
sortedWords.slice(0, 50).forEach(([w, c], i) => {
  // Show only if count > 10
  if (c > 10) console.log(`${(i + 1).toString().padStart(2)}. ${w.padEnd(20)}: ${c}`);
});

console.log('\n👥 Top 100 Pares Frequentes (Possíveis Autores/Séries) em OUTROS:');
sortedPairs.forEach(([w, c], i) => {
  // Show only if count > 5
  if (c > 5) console.log(`${(i + 1).toString().padStart(3)}. ${w.padEnd(30)}: ${c}`);
});
