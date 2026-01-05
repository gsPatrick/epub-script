const fs = require('fs');

const CATEGORY_MAPPING = {
  // === FANTASIA ===
  "Fantasia": [
    // Autores internacionais
    "sarah j. maas", "holly black", "leigh bardugo", "brandon sanderson",
    "stephanie garber", "jay kristoff", "guillermo del toro",
    "cassandra clare", "laini taylor", "victoria aveyard", "patrick rothfuss",
    "robin hobb", "joe abercrombie", "george r.r. martin", "r.r. martin", "george martin",
    "trudi canavan", "andrzej sapkowski", "robert jordan", "terry goodkind",
    "terry pratchett", "neil gaiman", "ursula k. le guin", "j.r.r. tolkien",
    "john flanagan", "erin hunter", "robert e. howard", "cinda williams chima",
    "peter lerangis", "terry brooks", "a. g. howard", "oliver bowden",
    "stephenie meyer", "stephanie meyer", "twilight", "crepusculo",
    "assassin's creed", "patrick ness", "taran matharu", "katherine arden",
    "mainak dhar", "tao wong", "raven kennedy",
    "danielle paige", "jennifer a. nielsen", "elise kova", "victoria schwab",
    "morgan rice", "anne bishop", "marion zimmer bradley", "kristin cast",
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
    "maya motayne", "lesley livingston", "sara holland", "grace draven", "genevieve cogman",
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
    "dragao", "feiticeira", "bruxo", "elfo", "magia", "reino encantado", "lobisomem", "vampiro",
    "dragon", "witch", "wizard", "fae", "fada", "kingdom", "reino", "throne", "trono",
    "sword", "espada", "chronicles", "cronicas", "shadow", "sombra", "blood", "sangue",
    "curse", "maldicao", "crown", "coroa", "queen", "rainha", "king", "rei", "prince", "principe",
    "princess", "princesa", "beast", "fera", "fantasy", "fantasia"
  ],

  // === ROMANCE ===
  "Romance": [
    // Autores contemporâneos internacionais
    "colleen hoover", "anna todd", "nicholas sparks", "sally thorne",
    "lauren layne", "mercedes ron", "sveva casati modignani", "abby jimenez",
    "ruby dixon", "suzanne enoch", "francine rivers", "elena ferrante",
    "paul auster", "jostein gaarder", "bella jewel",
    "lauren layne", "mercedes ron", "sveva casati modignani", "abby jimenez",
    "ruby dixon", "suzanne enoch", "francine rivers", "elena ferrante",
    "paul auster", "jostein gaarder", "bella jewel",
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
    "j. r. ward", "c. s. lewis", "c.s. lewis", "lara adrian", "cynthia eden",
    "alexandra ivy", "lynsay sands",
    "christine feehan", "jeaniene frost", "kelley armstrong", "patricia briggs",
    "fiona grace", "charlaine harris", "anne bishop", "kristen ashley",
    "nalini singh", "laurell k. hamilton", "faith hunter", "ilone andrews",
    // Séries
    "bridgertons", "ravenels", "wallflowers", "hathaways", "spindle cove",
    "duque e eu", "visconde", "condessa", "lorde", "lady",
    "westcott", "travis family", "travis #", "girl meets duke",
    "os rokesbys", "dois duques", "numeros do amor", "irmaos macgregor",
    "sins for all seasons", "orfaos de saint james", "guilty series",
    "royal brotherhood", "rrh #",
    // Palavras-chave
    "noiva", "duque", "seducao", "paixao", "amor", "romance", "clube do livro",
    "love", "heart", "coracao", "kiss", "beijo", "bride", "wedding", "casamento",
    "billionaire", "bilionario", "secret", "segredo", "desire", "desejo",
    "temptation", "tentacao", "promise", "promessa", "forever", "sempre",
    "dream", "sonho", "viscount", "visconde", "earl", "conde", "marquess", "marques",
    "scandal", "escandalo", "affair", "caso", "lover", "amante", "wife", "esposa",
    "husband", "marido",
    "jaimie roberts", "kylie scott", "l. a. cotton", "megan crewe", "ilsa madden-mills",
    "kate stewart", "raven kennedy", "laylah roberts", "brenda rothert", "cheryl holt",
    "ruby dixon", "suzanne enoch", "francine rivers", "elena ferrante",
    "anders grey", "erin mccarthy", "cambria hebert", "amelia wilde", "aly martinez",
    "chelle bliss", "veronica eden", "r. scarlett", "natalia jasper", "crystal ash"
  ],

  // === JOVEM ADULTO (YA) ===
  "Jovem Adulto": [
    // Autores
    "suzanne collins", "veronica roth", "rainbow rowell",
    "jennifer lynn barnes", "michael grant", "ransom riggs", "kiersten white",
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
    "joel dicker", "robin cook", "john le carre", "scott turow",
    "anthony horowitz", "leslie wolfe",
    "joel dicker", "robin cook", "john le carre", "scott turow",
    "anthony horowitz", "leslie wolfe",
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
    "daniel cole", "m. j. arlidge", "lucy foley", "richard morgan", "peter clines",
    "freida mcfadden", "patrick logan", "sidney sheldon", "jeffrey archer",
    "james rollins", "robert bryndza", "luke jennings", "killing eve",
    // Autores brasileiros
    "raphael montes", "ilana casoy", "patricia melo",
    // Palavras-chave
    "thriller", "suspense", "assassino", "serial killer", "fbi", "cia",
    "murder", "assassinato", "kill", "morte", "dead", "morto", "death",
    "girl", "garota", "gone", "desaparecida", "lies", "mentiras",
    "truth", "verdade", "detective", "detetive", "crime", "investigation", "investigacao",
    "blood", "sangue", "bones", "ossos", "grave", "tumulo", "nightmare", "pesadelo",
    "agente", "espiao", "missao", "spy", "agent", "mission", "conspiracy", "conspiracao",
    "victim", "vitima", "suspect", "suspeito", "hunt", "cacada", "shooter", "atirador",
    "sniper", "killer", "psicopata", "psychopath", "hostage", "refem"
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
    "fnaf", "five nights at freddys", "ghost", "haunted", "assombrado",
    "devil", "diabo", "evil", "mal", "darkness", "escuridao", "fear", "medo"
  ],

  // === FICÇÃO CIENTÍFICA ===
  "Ficção Científica": [
    // Autores clássicos
    "frank herbert", "isaac asimov", "arthur c. clarke", "philip k. dick",
    "kurt vonnegut", "amie kaufman", "scott westerfeld",
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
    "ian mcewan", "milan kundera", "william faulkner", "graham greene",
    "philip roth", "john steinbeck", "italo calvino", "jose eduardo agualusa",
    "cormac mccarthy", "toni morrison", "joseph conrad", "anton tchekhov",
    "luigi pirandello", "alessandro baricco", "julian barnes", "elizabeth strout",
    "voltaire", "john fante", "henry miller", "jack kerouac", "don delillo", "sally rooney",
    "jonathan franzen", "michel houellebecq", "stephen chbosky", "patrick modiano", "georges simenon",
    "sandor marai", "anais nin", "lionel shriver", "chimamanda ngozi adichie",
    "bertrand russell", "alain de botton", "elif shafak", "brian weiss", "theodore dalrymple",
    "drauzio varella",
    "fredrik backman", "jon fosse", "primo levi", "orhan pamuk",
    "jose de alencar", "aluisio azevedo", "castro alves", "olavo bilac",
    "gonçalves dias", "manuel bandeira", "carlos drummond", "cecilia meireles",
    "rachel de queiroz", "lygia fagundes telles", "rubem fonseca",
    "monteiro lobato", "lima barreto", "euclides da cunha",
    "ariano suassuna", "joao cabral de melo neto",
    // Autores internacionais
    "jane austen", "charles dickens", "leo tolstoy", "fyodor dostoevsky",
    "louisa may alcott", "jack london", "vladimir nabokov", "kazuo ishiguro",
    "antonio lobo antunes",
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
    "marcel proust", "james joyce", "homero", "dante alighieri",
    "irvine welsh"
  ],

  // === NEGÓCIOS E ECONOMIA ===
  "Negócios e Economia": [
    // Autores
    "peter drucker", "robert kiyosaki", "warren buffett", "ray dalio",
    "nassim nicholas taleb", "a arte da guerra", "sun tzu", "napoleon hill",
    "nassim taleb", "benjamin graham", "phil knight", "reed hastings",
    "eric ries", "peter thiel", "tim ferriss", "gary vaynerchuk",
    "seth godin", "malcolm gladwell", "daniel kahneman", "richard thaler",
    "walter isaacson", "ben horowitz", "michael porter", "jim collins",
    "patrick lencioni", "simon sinek", "clayton christensen", "geoffrey moore",
    "al ries", "jack trout", "philip kotler", "david ogilvy",
    // Palavras-chave
    "negocios", "empreendedorismo", "startups", "investimento",
    "financas", "marketing", "gestao", "bolsa", "dinheiro",
    "economia", "lideranca empresarial", "vendas", "estrategia",
    "business", "management", "leadership", "money", "investing",
    "finance", "sales", "strategy", "brand", "marca", "startup",
    "mike michalowicz", "profit first", "lucro primeiro"
  ],

  // === RELIGIÃO E ESPIRITUALIDADE ===
  "Religião e Espiritualidade": [
    // Autores cristãos
    "c.s. lewis", "timothy keller", "max lucado", "joyce meyer",
    "john piper", "padre marcelo rossi", "papa francisco", "john macarthur",
    "charles spurgeon", "billy graham", "rick warren", "john maxwell",
    "comentarios expositivos hagnos", "a cabana", "william p. young",
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
    "jared diamond", "eric hobsbawm", "hobsbawm", "fernand braudel", "barbara tuchman",
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
    "antonio gramsci", "giorgio agamben", "roger scruton", "paulo freire",
    "angela davis", "terry eagleton", "ayn rand",
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
    "enid blyton",
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
    "various authors", "varios autores", "antologia", "coletanea",
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
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Mapeamento de Fallback (apenas se não cair em nenhuma categoria acima)
const FALLBACK_MAPPING = {
  "Literatura Estrangeira": [
    "the", "a", "and", "of", "to", "in", "is", "you", "that", "it", "he", "was", "for", "on", "are", "as", "with", "his", "they", "i", "at", "be", "this", "have", "from", "or", "one", "had", "by", "word", "but", "not", "what", "all", "were", "we", "when", "your", "can", "said", "there", "use", "an", "each", "which", "she", "do", "how", "their", "if", "will", "up", "other", "about", "out", "many", "then", "them", "these", "so", "some", "her", "would", "make", "like", "him", "into", "time", "has", "look", "two", "more", "write", "go", "see", "number", "no", "way", "could", "people", "my", "than", "first", "water", "been", "call", "who", "oil", "its", "now", "find",
    "story", "life", "man", "woman", "world", "love", "night", "day", "house", "home", "father", "mother", "brother", "sister", "death", "war", "god", "king", "queen", "president", "city", "country", "town", "street", "road", "school", "book", "best", "new", "great", "high", "old", "big", "small", "large", "young", "long", "little", "good", "bad", "black", "white", "red", "blue"
  ],
  "Literatura Brasileira": [
    "que", "de", "e", "do", "da", "em", "um", "para", "com", "nao", "uma", "os", "no", "se", "na", "por", "mais", "as", "dos", "como", "mas", "ao", "ele", "das", "tem", "seu", "sua", "ou", "quando", "muito", "nos", "ja", "eu", "tambem", "so", "pelo", "pela", "ate", "isso", "ela", "entre", "depois", "sem", "mesmo", "aos", "ter", "seus", "quem", "nas", "me", "esse", "eles", "estao", "voce", "tinha", "foram", "essa", "num", "nem", "suas", "meu", "as", "minha", "tem", "numa", "pelos", "elas", "qual", "nos", "lhe", "deles", "essas", "esses", "pelas", "este", "dele", "tu", "te", "voces", "vos", "lhes", "meus", "minhas", "teu", "tua", "teus", "tuas", "nosso", "nossa", "nossos", "nossas", "dela", "delas", "esta", "estes", "estas", "aquele", "aquela", "aqueles", "aquelas", "isto", "aquilo", "estou", "esta", "estamos", "estao", "estive", "esteve", "estivemos", "estiveram", "estava", "estavamos", "estavam", "estivera", "estiveramos", "estiveram", "haja", "hajamos", "hajam", "houve", "houvemos", "houveram", "houvera", "houveramos", "houveram", "quis", "quisemos", "quiseram", "quisa", "quisamos", "quisam", "tiver", "tivermos", "tiverem", "haja", "hajamos", "hajam", "houver", "houvermos", "houverem",
    "o", "a", "vida", "amor", "casa", "tempo", "mundo", "homem", "mulher", "crianca", "cidade", "pais", "mae", "pai", "irmao", "irma", "amigo", "trabalho", "dinheiro", "historia", "livro", "novo", "bom", "grande", "pequeno", "velho", "jovem", "alto", "baixo", "negro", "branco", "vermelho", "azul"
  ],
  "Psicologia": ["mark wolynn"],
  "Biografias": ["sepultura", "aliester crowley"]
};

function categorizeFile(filename) {
  const normalized = normalizeString(filename);
  const paddedNormalized = ` ${normalized} `;

  let bestCategory = 'Outros';
  let maxScore = 0;

  // 1. Primary Mapping
  for (const [category, keywords] of Object.entries(CATEGORY_MAPPING)) {
    if (category === 'Outros') continue;

    let score = 0;
    for (const keyword of keywords) {
      const normalizedKeyword = normalizeString(keyword);
      const paddedKeyword = ` ${normalizedKeyword} `;

      if (paddedNormalized.includes(paddedKeyword)) {
        // Weight: Multi-word (Author/Title) = 3 pts, Single-word (Keyword) = 1 pt
        score += normalizedKeyword.includes(' ') ? 3 : 1;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    } else if (score === maxScore && score > 0) {
      if (category < bestCategory) bestCategory = category;
    }
  }

  // 2. Fallback Mapping (if still Outros)
  if (bestCategory === 'Outros') {
    let maxFallbackMatches = 0;
    for (const [category, keywords] of Object.entries(FALLBACK_MAPPING)) {
      let matches = 0;
      for (const keyword of keywords) {
        if (paddedNormalized.includes(` ${keyword} `)) {
          matches++;
        }
      }

      if (matches > maxFallbackMatches) {
        maxFallbackMatches = matches;
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
// ... previous code ...
console.log(`❌ Em "Outros": ${counts['Outros'] || 0} arquivos (${outrosPercent}%)`);

// Save Outros to file for Author Extraction
fs.writeFileSync('outros.json', JSON.stringify(outros, null, 2));
console.log('\n💾 Arquivos não categorizados salvos em "outros.json" para análise profunda.');


// Mostrar amostra de "Outros"
if (outros.length > 0) {
    console.log(`\n📋 AMOSTRA DE ARQUIVOS EM "OUTROS" (primeiros 20):\n`);
    for (const file of outros.slice(0, 20)) {
        console.log(`  - ${file}`);
    }
}
