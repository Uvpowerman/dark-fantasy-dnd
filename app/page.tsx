"use client";

import { useRef, useState } from "react";

type Token = {
  id: string;
  kind: string;
  label: string;
  customLabel?: string;
  short: string;
  x: number;
  y: number;
  side: "hero" | "enemy";
  maxHp: number;
  currentHp: number;
};

type Stage = {
  id: string;
  kicker: string;
  title: string;
  time: string;
  map: string;
  goal: string;
  details: string[];
  tokens: Token[];
};

type InitiativeEntry = {
  id: string;
  tokenId?: string;
  name: string;
  short: string;
  kind: string;
  side: "hero" | "enemy";
  roll: number;
  maxHp: number;
  currentHp: number;
};

const roster = [
  { kind: "assault", label: "Рыцарь-изгнанник", short: "Р", side: "hero" as const, maxHp: 12 },
  { kind: "tech", label: "Ведьма-провидица", short: "В", side: "hero" as const, maxHp: 8 },
  { kind: "medic", label: "Полевой лекарь", short: "Л", side: "hero" as const, maxHp: 9 },
  { kind: "shadow", label: "Следопыт", short: "С", side: "hero" as const, maxHp: 9 },
  { kind: "drone", label: "Чумной мертвец", short: "М", side: "enemy" as const, maxHp: 5 },
  { kind: "hound", label: "Болотная гончая", short: "Г", side: "enemy" as const, maxHp: 7 },
  { kind: "glitch", label: "Культист Короны", short: "К", side: "enemy" as const, maxHp: 7 },
  { kind: "mirror", label: "Безликий рыцарь", short: "Б", side: "enemy" as const, maxHp: 16 },
  { kind: "director", label: "Король под Пеплом", short: "♛", side: "enemy" as const, maxHp: 26 },
];

const heroPreset = [
  { ...roster[0], id: "h1", x: 14, y: 82, currentHp: roster[0].maxHp },
  { ...roster[1], id: "h2", x: 19, y: 86, currentHp: roster[1].maxHp },
  { ...roster[2], id: "h3", x: 24, y: 82, currentHp: roster[2].maxHp },
  { ...roster[3], id: "h4", x: 29, y: 86, currentHp: roster[3].maxHp },
];

const stages: Stage[] = [
  {
    id: "village",
    kicker: "Этап 01",
    title: "Деревня Серый Брод",
    time: "8 минут",
    map: "./assets/maps/greyford.webp",
    goal: "Спасти жителей и найти тайный вход под старой часовней.",
    details: [
      "Каменные ограды и телеги дают +1 к защите.",
      "Печать часовни снимается проверкой ВОЛ 5.",
      "Мертвецы выходят из домов после двух провалов.",
    ],
    tokens: [
      ...heroPreset,
      { ...roster[4], id: "m-d1", x: 79, y: 22, currentHp: roster[4].maxHp },
      { ...roster[4], id: "m-d2", x: 86, y: 28, currentHp: roster[4].maxHp },
    ],
  },
  {
    id: "crypt",
    kicker: "Этап 02",
    title: "Затопленные катакомбы",
    time: "12 минут",
    map: "./assets/maps/catacombs.webp",
    goal: "Пережить три раунда или заставить оставшихся врагов отступить.",
    details: [
      "Священная купель: проверка ВОЛ 4, враги получают −1 АТК.",
      "Ржавая цепь: проверка СИЛ 5, обрушение наносит 3 урона.",
      "Алтарь лекаря восстанавливает одному герою 1 ДУХ.",
    ],
    tokens: [
      ...heroPreset.map((t, i) => ({ ...t, id: `t-${i}` })),
      { ...roster[5], id: "t-hound", x: 38, y: 25, currentHp: roster[5].maxHp },
      { ...roster[4], id: "t-drone", x: 67, y: 24, currentHp: roster[4].maxHp },
      { ...roster[6], id: "t-glitch", x: 85, y: 18, currentHp: roster[6].maxHp },
    ],
  },
  {
    id: "grove",
    kicker: "Этап 03",
    title: "Чёрный лес",
    time: "11 минут",
    map: "./assets/maps/blackwood.webp",
    goal: "Погасить три ведьминых огня и победить Безликого рыцаря.",
    details: [
      "Первая способность героев в раунде повторяется против них.",
      "Три погасших огня снимают проклятое Отражение.",
      "Каменный круг даёт рыцарю +1 ЗАЩ.",
    ],
    tokens: [
      ...heroPreset.map((t, i) => ({ ...t, id: `z-${i}`, x: 38 + i * 8, y: 87 })),
      { ...roster[7], id: "z-boss", x: 50, y: 23, currentHp: roster[7].maxHp },
    ],
  },
  {
    id: "throne",
    kicker: "Этап 04",
    title: "Трон Пепельной Короны",
    time: "19 минут",
    map: "./assets/maps/ash-throne.webp",
    goal: "Разрушить три печати и остановить пробуждение Короля под Пеплом.",
    details: [
      "Три рунических алтаря поддерживают щит босса.",
      "Костяные зеркала показывают следующую атаку Короля.",
      "Три успеха разных ролей создают Ритуал Рассвета.",
    ],
    tokens: [
      ...heroPreset.map((t, i) => ({ ...t, id: `n-${i}`, x: 37 + i * 8, y: 88 })),
      { ...roster[8], id: "n-boss", x: 50, y: 17, currentHp: roster[8].maxHp },
    ],
  },
];

const heroes = [
  {
    name: "Рыцарь-изгнанник",
    image: "./assets/cards/exile-knight.webp",
    stats: "ОЗ 12 · АТК +2 · ЗАЩ 5 · ДУХ 3",
    accent: "cyan",
    abilities: ["Удар щитом — 3 урона и отбрасывание", "Стальная клятва — уменьшает урон союзнику на 2", "Последний натиск — игнорирует броню"],
  },
  {
    name: "Ведьма-провидица",
    image: "./assets/cards/seer-witch.webp",
    stats: "ОЗ 8 · АТК +1 · ЗАЩ 3 · ДУХ 5",
    accent: "violet",
    abilities: ["Дурной знак — враг перебрасывает атаку", "Чёрное пламя — 3 урона нежити", "Вещий сон — узнать следующий ход врага"],
  },
  {
    name: "Полевой лекарь",
    image: "./assets/cards/field-healer.webp",
    stats: "ОЗ 9 · АТК +1 · ЗАЩ 3 · ДУХ 4",
    accent: "green",
    abilities: ["Горькая настойка — восстановить 3 ОЗ", "Не сегодня — поднять героя с 4 ОЗ", "Боевой зов — союзник получает дополнительное действие"],
  },
  {
    name: "Следопыт",
    image: "./assets/cards/ranger.webp",
    stats: "ОЗ 9 · АТК +2 · ЗАЩ 4 · ДУХ 3",
    accent: "pink",
    abilities: ["Шаг в тени — нельзя выбрать целью", "Серебряная стрела — игнорирует броню", "Ложный след — враг перебрасывает атаку"],
  },
];

const enemies = [
  { name: "Чумной мертвец", image: "./assets/cards/plague-dead.webp", stats: "ОЗ 5 · АТК +1 · ЗАЩ 3", skill: "Зараза: раненая цель получает −1 ЗАЩ до лечения." },
  { name: "Болотная гончая", image: "./assets/cards/swamp-hound.webp", stats: "ОЗ 7 · АТК +2 · ЗАЩ 4", skill: "Мёртвая хватка: первая попытка отойти требует проверки 4." },
  { name: "Культист Пепельной Короны", image: "./assets/cards/ash-cultist.webp", stats: "ОЗ 7 · АТК +2 · ЗАЩ 3", skill: "Порча: следующая способность цели стоит +1 ДУХ." },
  { name: "Безликий рыцарь", image: "./assets/cards/faceless-knight.webp", stats: "ОЗ 16 · АТК +2 · ЗАЩ 5", skill: "Отражение: повторяет первую способность героев." },
  { name: "Король под Пеплом", image: "./assets/cards/ash-king.webp", stats: "ОЗ 26 · АТК +3 · ЗАЩ 5", skill: "Три фазы, рунический щит и смена иммунитетов." },
];

const gmScenes = [
  {
    id: "omen",
    time: "0–5 минут",
    title: "Колокол без звонаря",
    purpose: "Сразу погрузить игроков в угрозу, раздать роли и дать каждому личную причину идти к замку.",
    readAloud: "Над Серым Бродом третий день не встаёт солнце. В полночь колокол заброшенной часовни звонит сам, а из колодцев доносится шёпот: «Король возвращается». На вашей ладони проступает одинаковый знак — расколотая корона. Старуха Мара говорит: «До рассвета Пепельная Корона выберет нового хозяина. Либо вы найдёте её первыми, либо долина станет царством мёртвых».",
    beats: [
      "Раздайте четыре роли. Каждый игрок называет имя героя и объясняет, кого он потерял во время прошлой Чёрной зимы.",
      "Объясните базу: d6 + подходящий бонус; результат не ниже сложности — успех; в ход можно переместиться и выполнить одно действие.",
      "Мара вручает группе железный ключ от часовни и предупреждает: Корону нельзя просто взять — в финале придётся решить её судьбу.",
    ],
    checks: "Если дети затрудняются, предложите мотивы: рыцарь ищет искупление, ведьма слышит Корону во сне, лекарь ищет средство от чумы, следопыт разыскивает пропавшего брата.",
    failForward: "Провала здесь нет. Хорошая деталь предыстории один раз за игру даёт герою +1 к подходящей проверке.",
    transition: "За дверью таверны слышится первый крик. На улице погасли фонари, а к часовне уже бредут мертвецы.",
  },
  {
    id: "greyford-guide",
    time: "5–13 минут",
    title: "Деревня Серый Брод",
    purpose: "Научить команду совместным проверкам и показать, что спасение людей важнее победы над каждым врагом.",
    readAloud: "Дождь смешивает золу с грязью. Между перекошенными домами мечутся жители, а у часовни стоят фигуры в погребальных саванах. Из-под двери пробивается багровый свет. Колокол ударяет снова — и мертвецы поворачивают головы к вам.",
    beats: [
      "Команде нужны 3 успеха до 2 провалов: вывести семью из горящего дома, удержать баррикаду, открыть часовню или отвлечь нежить.",
      "Рыцарь может поднять телегу (СИЛ 4), ведьма прочитать печать (ВОЛ 5), лекарь успокоить заражённого (РАЗУМ 4), следопыт провести людей дворами (ЛОВ 4).",
      "После каждого провала добавляйте на карту одного мертвеца. При двух провалах начинается короткий бой на два раунда.",
      "Под алтарём герои находят лестницу и первую половину герба Пепельной Короны.",
    ],
    checks: "Натуральная 6 спасает дополнительного жителя. Позже он передаст группе святую воду, которая наносит нежити 3 урона.",
    failForward: "Даже после двух провалов вход найден. Цена — один герой начинает катакомбы с потерей 2 ОЗ, а гончая идёт по следу группы.",
    transition: "Лестница уходит под кладбище. Снизу пахнет болотной водой, воском и чем-то, что давно должно было истлеть.",
  },
  {
    id: "crypt-guide",
    time: "13–25 минут",
    title: "Затопленные катакомбы",
    purpose: "Провести быстрый тактический бой и научить использовать окружение.",
    readAloud: "Чёрная вода доходит до щиколоток. На стенах выцарапаны имена забытых королей. Впереди звенит цепь, из бокового склепа выползает болотная гончая, а трое людей в масках поднимают чаши с серым пламенем: «Корона помнит своего владыку».",
    beats: [
      "Запустите инициативу кнопкой «Бой начался». Враги занимают узкие проходы и пытаются разъединить героев.",
      "Напомните об окружении: святую купель можно очистить, цепью обрушить кладку, а на алтаре лекаря восстановить 1 ДУХ.",
      "Гончая удерживает ближайшего героя, мертвец заражает раненого, культист накладывает Порчу на героя с наибольшим ДУХ.",
      "После третьего раунда вода начинает прибывать. Оставшиеся враги отступают, а герои должны немедленно открыть каменную дверь.",
    ],
    checks: "Очистить купель — ВОЛ 4; обрушить кладку — СИЛ 5; перепрыгнуть поток — ЛОВ 4. Провал даёт успех с ценой: 1 урон или потеря позиции.",
    failForward: "Если группа сильно ранена, в саркофаге лежат две целебные настойки по 2 ОЗ. Если бой слишком лёгкий, из воды выходит ещё один мертвец.",
    transition: "За дверью лежит серебряная тропа, ведущая прямо в Чёрный лес. Ни одна ветка не качается, хотя ветер воет всё громче.",
  },
  {
    id: "grove-guide",
    time: "25–36 минут",
    title: "Безликий рыцарь",
    purpose: "Заставить игроков менять тактику и раскрыть правду о проклятии.",
    readAloud: "В центре ведьминого круга стоит рыцарь без лица. В его щите отражаются ваши движения — на мгновение раньше, чем вы их совершаете. «Я был первым, кто пришёл уничтожить Корону, — звучит голос из пустого шлема. — Теперь я охраняю её. Покажите мне выбор, которого она не предвидела».",
    beats: [
      "Первая особая способность героев в каждом раунде отражается. Скажите об этом до первого хода.",
      "Три ведьминых огня поддерживают проклятие. Их можно погасить силой, волей, выстрелом или убедительной клятвой сложности 5.",
      "На половине ОЗ рыцарь спрашивает: «Если Корона способна спасти долину, кто имеет право уничтожить её?» Ответ игроков повлияет на финал.",
      "Побеждённый рыцарь отдаёт вторую половину герба и открывает путь в замок. Его можно освободить, если назвать его забытое имя — Арен.",
    ],
    checks: "Сильная речь считается погашенным огнём без броска. Исследование надгробий раскрывает имя Арена при проверке РАЗУМ 4.",
    failForward: "Если герои падают до 0 ОЗ, Арен прекращает бой и даёт каждому встать с 2 ОЗ, но Король начинает финал со второй фазы.",
    transition: "Когда последний огонь гаснет, деревья расступаются. На холме стоит замок, которого ещё мгновение назад там не было.",
  },
  {
    id: "throne-guide",
    time: "36–55 минут",
    title: "Король под Пеплом",
    purpose: "Провести трёхфазный финал, где нужны разные герои и решения.",
    readAloud: "В разрушенном тронном зале сидит высохший король. Над его головой парит Корона из чёрного железа, и каждое её острие горит багровым огнём. «Я обещал народу вечное царство, — шепчет мертвец. — Они забыли уточнить, что хотят остаться живыми». Три руны вспыхивают на полу.",
    beats: [
      "Фаза 1 — «Клятва»: Король неуязвим, пока действуют три рунических алтаря. Разные герои отключают их проверками сложности 5.",
      "Фаза 2 — «Память»: после половины ОЗ Король каждый раунд получает иммунитет к типу последнего успешного удара. Называйте его вслух.",
      "Фаза 3 — «Восхождение»: при 6 ОЗ запускается таймер на 3 раунда. Три успеха разными ролями завершают Ритуал Рассвета и снимают щит.",
      "Король атакует героя у алтаря, поднимает стену костей или гасит один источник света, но не добивает персонажа при 0 ОЗ.",
      "После победы Корона предлагает каждому самое заветное желание. Дайте игрокам минуту обсудить три решения.",
    ],
    checks: "Алтарь — сложность 5; костяное зеркало — РАЗУМ 4; вытащить союзника из пепла — СИЛ 4. Натуральная 6 даёт +1 урон или +1 союзнику.",
    failForward: "Если таймер истёк, Мара жертвует частью своей памяти и удерживает Корону ещё один раунд. Финальный выбор всё равно остаётся за героями.",
    transition: "Король рассыпается. В тишине слышны три голоса Короны: «Разбей меня. Отдай меня. Спрячь меня». Что вы выбираете?",
  },
  {
    id: "ending-guide",
    time: "55–60 минут",
    title: "Цена рассвета",
    purpose: "Завершить историю весомым общим решением и короткими личными эпилогами.",
    readAloud: "За разбитыми окнами сереет небо. Пепельная Корона лежит на ступенях трона и ждёт. В ней достаточно силы, чтобы вернуть погибших, исцелить землю или навсегда уничтожить магию долины. Но ни одно чудо не будет бесплатным.",
    beats: [
      "Покажите три финала: разбить Корону, отдать её Маре или запечатать в крипте.",
      "Попросите каждого героя назвать выгоду и опасность выбранного пути. При равенстве голосов решает герой, который погасил последний ведьмин огонь.",
      "Прочитайте соответствующий финал, затем спросите каждого игрока, чем его герой занимается через месяц.",
    ],
    checks: "Броски больше не нужны. Финальное решение должно принадлежать игрокам, даже если ведущему нравится другой вариант.",
    failForward: "Любой выбор становится каноном. Подчеркните, что герои спасли долину, но мир изменился из-за цены их решения.",
    transition: "Завершите фразой: «Первый солнечный луч касается Серого Брода. Ваши имена уже превращаются в легенду».",
  },
];

const endings = [
  {
    id: "break",
    number: "01",
    title: "Разбить Корону",
    summary: "Проклятие рушится, мёртвые обретают покой, а над долиной впервые за годы поднимается солнце.",
    consequence: "Плюс: власть Короны уничтожена навсегда. Цена: её магия больше не сможет вернуть погибших или исцелить выжженную землю.",
    readAloud: "Рыцарь поднимает клинок, и чёрное железо раскалывается. Из трещины вырываются тысячи золотых искр — голоса тех, кого удерживала Корона. Они поднимаются к сводам, а затем исчезают в первом луче рассвета. В долине разом замолкают все могильные колокола.",
    epilogue: "Через месяц жители восстанавливают Серый Брод. Земля ещё бедна, зато никто больше не просыпается от шёпота из колодцев. Герои становятся Стражами Рассвета.",
    images: ["./assets/endings/break-01.webp", "./assets/endings/break-02.webp", "./assets/endings/break-03.webp"],
    captions: ["Последний удар по Короне", "Рассвет над освобождённой долиной", "Возвращение жизни в Серый Брод"],
  },
  {
    id: "mara",
    number: "02",
    title: "Отдать Корону Маре",
    summary: "Ведьма получает силу исцелить долину — и власть, которой прежде не обладал ни один смертный.",
    consequence: "Плюс: урожай возвращается, больные исцеляются, замок защищает долину. Цена: судьба всех жителей теперь зависит от мудрости одной королевы.",
    readAloud: "Мара принимает Корону обеими руками. На миг она кажется старше самого замка, затем багровый свет становится тёплым. По мёртвым полям проходит зелёная волна, но тень новой королевы ложится от трона до самого Серого Брода.",
    epilogue: "Через месяц долина цветёт вопреки осени. Мара правит справедливо — пока. Герои становятся её советниками и единственными людьми, которым позволено спорить с Королевой Пепла.",
    images: ["./assets/endings/mara-01.webp", "./assets/endings/mara-02.webp", "./assets/endings/mara-03.webp"],
    captions: ["Корона выбирает новую хозяйку", "Багровая магия исцеляет земли", "Совет при Королеве Пепла"],
  },
  {
    id: "seal",
    number: "03",
    title: "Запечатать Корону",
    summary: "Артефакт остаётся цел, но его запирают там, где к нему не должна добраться ни одна живая душа.",
    consequence: "Плюс: силу можно использовать против будущей беды. Цена: пока Корона существует, найдутся те, кто попытается её освободить.",
    readAloud: "Следопыт закрывает каменную дверь, ведьма произносит последнее слово печати, а лекарь гасит свечу. Корона остаётся в глубине — без хозяина, без света, без времени. На поверхности исчезают последние чудеса, и людям приходится спасать долину собственными руками.",
    epilogue: "Через месяц на месте входа в крипту стоит крепость. Герои по очереди несут караул и хранят ключи отдельно. Иногда ночью из-под земли всё ещё слышится тихий звон.",
    images: ["./assets/endings/seal-01.webp", "./assets/endings/seal-02.webp", "./assets/endings/seal-03.webp"],
    captions: ["Последняя печать древней крипты", "Магия покидает долину", "Стражи у погасшего очага"],
  },
];

const rollValue = (sides: number) => Math.floor(Math.random() * sides) + 1;

function BattleMap() {
  const [stageIndex, setStageIndex] = useState(0);
  const [allTokens, setAllTokens] = useState<Record<string, Token[]>>(() =>
    Object.fromEntries(stages.map((stage) => [stage.id, stage.tokens]))
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [dieSides, setDieSides] = useState(6);
  const [dieResult, setDieResult] = useState<number | null>(null);
  const [rollHistory, setRollHistory] = useState<string[]>([]);
  const [initiative, setInitiative] = useState<Record<string, InitiativeEntry[]>>({});
  const [battleStarted, setBattleStarted] = useState<Record<string, boolean>>({});
  const [enemyToAdd, setEnemyToAdd] = useState("drone");
  const mapRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(0);
  const stage = stages[stageIndex];
  const tokens = allTokens[stage.id];
  const selectedToken = tokens.find((token) => token.id === selected) ?? null;
  const turnOrder = initiative[stage.id] ?? [];

  const sortInitiative = (entries: InitiativeEntry[]) =>
    [...entries].sort((a, b) => b.roll - a.roll || a.name.localeCompare(b.name, "ru"));
  const nextId = () => {
    idCounter.current += 1;
    return idCounter.current;
  };

  const rollDie = () => {
    const result = rollValue(dieSides);
    setDieResult(result);
    setRollHistory((history) => [`d${dieSides}: ${result}`, ...history].slice(0, 5));
  };

  const startBattle = () => {
    const entries = tokens.map((token) => ({
      id: `initiative-${token.id}`,
      tokenId: token.id,
      name: token.customLabel || token.label,
      short: token.short,
      kind: token.kind,
      side: token.side,
      roll: rollValue(20),
      maxHp: token.maxHp,
      currentHp: token.currentHp,
    }));
    setInitiative((current) => ({ ...current, [stage.id]: sortInitiative(entries) }));
    setBattleStarted((current) => ({ ...current, [stage.id]: true }));
  };

  const addEnemyToInitiative = () => {
    const enemy = roster.find((item) => item.kind === enemyToAdd && item.side === "enemy");
    if (!enemy) return;
    const entry: InitiativeEntry = {
      ...enemy,
      id: `initiative-extra-${enemy.kind}-${nextId()}`,
      name: enemy.label,
      roll: rollValue(20),
      maxHp: enemy.maxHp,
      currentHp: enemy.maxHp,
    };
    setInitiative((current) => ({
      ...current,
      [stage.id]: sortInitiative([...(current[stage.id] ?? []), entry]),
    }));
  };

  const removeInitiativeEntry = (id: string) => {
    setInitiative((current) => ({
      ...current,
      [stage.id]: (current[stage.id] ?? []).filter((entry) => entry.id !== id),
    }));
  };

  const moveToken = (id: string, clientX: number, clientY: number) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(98, ((clientY - rect.top) / rect.height) * 100));
    setAllTokens((current) => ({
      ...current,
      [stage.id]: current[stage.id].map((token) => (token.id === id ? { ...token, x, y } : token)),
    }));
  };

  const addToken = (item: (typeof roster)[number]) => {
    const token: Token = {
      ...item,
      id: `${stage.id}-${item.kind}-${nextId()}`,
      x: 50,
      y: 50,
      currentHp: item.maxHp,
    };
    setAllTokens((current) => ({ ...current, [stage.id]: [...current[stage.id], token] }));
    if (battleStarted[stage.id]) {
      const entry: InitiativeEntry = {
        ...item,
        id: `initiative-${token.id}`,
        tokenId: token.id,
        name: item.label,
        roll: rollValue(20),
        maxHp: item.maxHp,
        currentHp: item.maxHp,
      };
      setInitiative((current) => ({
        ...current,
        [stage.id]: sortInitiative([...(current[stage.id] ?? []), entry]),
      }));
    }
    setSelected(token.id);
  };

  const reset = () => {
    setAllTokens((current) => ({ ...current, [stage.id]: stage.tokens }));
    setInitiative((current) => ({ ...current, [stage.id]: [] }));
    setBattleStarted((current) => ({ ...current, [stage.id]: false }));
    setSelected(null);
  };

  const removeSelected = () => {
    if (!selected) return;
    setAllTokens((current) => ({
      ...current,
      [stage.id]: current[stage.id].filter((token) => token.id !== selected),
    }));
    setInitiative((current) => ({
      ...current,
      [stage.id]: (current[stage.id] ?? []).filter((entry) => entry.tokenId !== selected),
    }));
    setSelected(null);
  };

  const renameSelected = (customLabel: string) => {
    if (!selected) return;
    setAllTokens((current) => ({
      ...current,
      [stage.id]: current[stage.id].map((token) =>
        token.id === selected ? { ...token, customLabel } : token
      ),
    }));
    setInitiative((current) => ({
      ...current,
      [stage.id]: (current[stage.id] ?? []).map((entry) =>
        entry.tokenId === selected
          ? { ...entry, name: customLabel || selectedToken?.label || entry.name }
          : entry
      ),
    }));
  };

  const setTokenHp = (tokenId: string, nextHp: number) => {
    const token = tokens.find((item) => item.id === tokenId);
    if (!token) return;
    const currentHp = Math.max(0, Math.min(token.maxHp, nextHp));
    setAllTokens((current) => ({
      ...current,
      [stage.id]: current[stage.id].map((item) =>
        item.id === tokenId ? { ...item, currentHp } : item
      ),
    }));
    setInitiative((current) => ({
      ...current,
      [stage.id]: (current[stage.id] ?? []).map((entry) =>
        entry.tokenId === tokenId ? { ...entry, currentHp } : entry
      ),
    }));
  };

  const setInitiativeHp = (entry: InitiativeEntry, nextHp: number) => {
    const currentHp = Math.max(0, Math.min(entry.maxHp, nextHp));
    setInitiative((current) => ({
      ...current,
      [stage.id]: (current[stage.id] ?? []).map((item) =>
        item.id === entry.id ? { ...item, currentHp } : item
      ),
    }));
    if (entry.tokenId) {
      setAllTokens((current) => ({
        ...current,
        [stage.id]: current[stage.id].map((token) =>
          token.id === entry.tokenId ? { ...token, currentHp } : token
        ),
      }));
    }
  };

  return (
    <section className="map-section" id="map">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Интерактивное поле</span>
          <h2>Тактическая карта</h2>
        </div>
        <p>Перетаскивайте жетоны мышью или пальцем. Выберите жетон, чтобы подписать его, удалить или переместить.</p>
      </div>

      <div className="stage-tabs" role="tablist" aria-label="Этапы игры">
        {stages.map((item, index) => (
          <button
            className={index === stageIndex ? "active" : ""}
            key={item.id}
            onClick={() => {
              setStageIndex(index);
              setSelected(null);
            }}
            role="tab"
            aria-selected={index === stageIndex}
          >
            <span>{item.kicker}</span>
            {item.title}
          </button>
        ))}
      </div>

      <div className="map-layout">
        <div className="map-shell">
          <div className="map-toolbar">
            <div>
              <span>{stage.time}</span>
              <strong>{stage.title}</strong>
            </div>
            <div className="toolbar-actions">
              <button onClick={removeSelected} disabled={!selected}>Удалить жетон</button>
              <button onClick={reset}>Сбросить поле</button>
            </div>
          </div>
          <div className="battle-map" ref={mapRef}>
            <img src={stage.map} alt={`Тактическая карта: ${stage.title}`} draggable={false} />
            {tokens.map((token) => (
              <button
                key={token.id}
                className={`map-token side-${token.side} ${token.kind} ${token.currentHp === 0 ? "defeated" : ""} ${selected === token.id ? "selected" : ""}`}
                style={{ left: `${token.x}%`, top: `${token.y}%` }}
                title={token.label}
                aria-label={`${token.label}. Перетащите жетон по карте`}
                onClick={() => setSelected(token.id)}
                onPointerDown={(event) => {
                  setSelected(token.id);
                  event.currentTarget.setPointerCapture(event.pointerId);
                  moveToken(token.id, event.clientX, event.clientY);
                }}
                onPointerMove={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    moveToken(token.id, event.clientX, event.clientY);
                  }
                }}
              >
                <span className="token-health" aria-label={`ОЗ ${token.currentHp} из ${token.maxHp}`}>
                  <span style={{ width: `${(token.currentHp / token.maxHp) * 100}%` }} />
                  <b>{token.currentHp}/{token.maxHp}</b>
                </span>
                <span className="token-symbol" aria-hidden="true">{token.short}</span>
                {token.customLabel && <span className="token-label">{token.customLabel}</span>}
              </button>
            ))}
          </div>

          <div className="battle-controls">
            <div className="dice-console">
              <div>
                <span className="panel-label">Бросок кубика</span>
                <strong>Игровой кубик</strong>
                <p>Выберите кубик и нажмите «Бросить». d6 используется для проверок, d20 — для инициативы.</p>
              </div>
              <div className="die-picker" aria-label="Выбор кубика">
                {[4, 6, 8, 10, 12, 20].map((sides) => (
                  <button
                    key={sides}
                    className={dieSides === sides ? "active" : ""}
                    onClick={() => setDieSides(sides)}
                    aria-pressed={dieSides === sides}
                  >
                    d{sides}
                  </button>
                ))}
              </div>
              <button className="roll-button" onClick={rollDie}>
                Бросить d{dieSides}
              </button>
              <div className={`die-result ${dieResult === dieSides ? "critical" : ""}`} aria-live="polite">
                <small>Результат</small>
                <b>{dieResult ?? "—"}</b>
              </div>
              <div className="roll-history">
                {rollHistory.length ? rollHistory.map((item, index) => <span key={`${item}-${index}`}>{item}</span>) : <span>История пуста</span>}
              </div>
            </div>

            <button className="battle-start" onClick={startBattle}>
              <span>{battleStarted[stage.id] ? "↻" : "⚔"}</span>
              <b>{battleStarted[stage.id] ? "Перебросить инициативу" : "Бой начался"}</b>
              <small>Бросить d20 за всех участников</small>
            </button>
          </div>

          {battleStarted[stage.id] && (
            <div className="initiative-panel" aria-live="polite">
              <div className="initiative-heading">
                <div>
                  <span className="panel-label">Порядок раунда</span>
                  <h3>Очередь ходов</h3>
                  <p>Ходы идут сверху вниз. В конце списка начинается новый раунд.</p>
                </div>
                <div className="initiative-add">
                  <label htmlFor="initiative-enemy">Добавить врага</label>
                  <div>
                    <select
                      id="initiative-enemy"
                      value={enemyToAdd}
                      onChange={(event) => setEnemyToAdd(event.target.value)}
                    >
                      {roster.filter((item) => item.side === "enemy").map((item) => (
                        <option key={item.kind} value={item.kind}>{item.label}</option>
                      ))}
                    </select>
                    <button onClick={addEnemyToInitiative}>Добавить + d20</button>
                  </div>
                </div>
              </div>
              <ol className="initiative-list">
                {turnOrder.map((entry, index) => (
                  <li key={entry.id} className={entry.currentHp === 0 ? "defeated" : ""}>
                    <span className="turn-number">{index + 1}</span>
                    <i className={`mini-token side-${entry.side} ${entry.kind}`}>{entry.short}</i>
                    <span className="turn-name">
                      <b>{entry.name}</b>
                      <small>{entry.side === "hero" ? "Герой" : "Противник"}</small>
                    </span>
                    <span className="initiative-hp" aria-label={`ОЗ ${entry.currentHp} из ${entry.maxHp}`}>
                      <button onClick={() => setInitiativeHp(entry, entry.currentHp - 1)} aria-label={`Уменьшить ОЗ: ${entry.name}`}>−</button>
                      <b>{entry.currentHp}/{entry.maxHp}</b>
                      <button onClick={() => setInitiativeHp(entry, entry.currentHp + 1)} aria-label={`Увеличить ОЗ: ${entry.name}`}>+</button>
                    </span>
                    <strong className="initiative-roll">{entry.roll}</strong>
                    <button
                      className="reroll-entry"
                      onClick={() => setInitiative((current) => ({
                        ...current,
                        [stage.id]: sortInitiative((current[stage.id] ?? []).map((item) =>
                          item.id === entry.id ? { ...item, roll: rollValue(20) } : item
                        )),
                      }))}
                      aria-label={`Перебросить инициативу: ${entry.name}`}
                      title="Перебросить d20"
                    >
                      ↻
                    </button>
                    <button
                      className="remove-entry"
                      onClick={() => removeInitiativeEntry(entry.id)}
                      aria-label={`Удалить из очереди: ${entry.name}`}
                      title="Удалить из очереди"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ol>
              {!turnOrder.length && <p className="empty-initiative">Очередь пуста. Добавьте врага или снова нажмите «Перебросить инициативу».</p>}
            </div>
          )}
        </div>

        <aside className="map-sidebar">
          <div className="objective">
            <span>Цель этапа</span>
            <h3>{stage.goal}</h3>
            <ul>{stage.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
          </div>
          <div className={`token-editor ${selectedToken ? "active" : ""}`}>
            <div className="tray-title">
              <span>Выбранный жетон</span>
              {selectedToken && <small>{selectedToken.label}</small>}
            </div>
            {selectedToken ? (
              <>
                <label htmlFor="token-label-input">Имя или заметка</label>
                <div className="token-label-control">
                  <input
                    id="token-label-input"
                    type="text"
                    value={selectedToken.customLabel ?? ""}
                    onChange={(event) => renameSelected(event.target.value.slice(0, 24))}
                    placeholder="Например: Вадим или Враг 2"
                    maxLength={24}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => renameSelected("")}
                    disabled={!selectedToken.customLabel}
                    aria-label="Очистить подпись"
                  >
                    ×
                  </button>
                </div>
                <small className="editor-hint">Подпись появится под жетоном на карте.</small>
                <div className="hp-editor">
                  <div className="hp-editor-heading">
                    <label htmlFor="token-hp-input">Очки здоровья</label>
                    <strong className={selectedToken.currentHp === 0 ? "zero" : ""}>
                      {selectedToken.currentHp} / {selectedToken.maxHp} ОЗ
                    </strong>
                  </div>
                  <div className="hp-meter" aria-hidden="true">
                    <span style={{ width: `${(selectedToken.currentHp / selectedToken.maxHp) * 100}%` }} />
                  </div>
                  <div className="hp-actions">
                    <button type="button" onClick={() => setTokenHp(selectedToken.id, selectedToken.currentHp - 3)}>−3 урона</button>
                    <button type="button" onClick={() => setTokenHp(selectedToken.id, selectedToken.currentHp - 1)}>−1</button>
                    <input
                      id="token-hp-input"
                      type="number"
                      min={0}
                      max={selectedToken.maxHp}
                      value={selectedToken.currentHp}
                      onChange={(event) => setTokenHp(selectedToken.id, Number(event.target.value))}
                      aria-label="Текущее количество очков здоровья"
                    />
                    <button type="button" onClick={() => setTokenHp(selectedToken.id, selectedToken.currentHp + 1)}>+1</button>
                    <button type="button" onClick={() => setTokenHp(selectedToken.id, selectedToken.currentHp + 3)}>+3 лечения</button>
                  </div>
                  <button className="restore-hp" type="button" onClick={() => setTokenHp(selectedToken.id, selectedToken.maxHp)}>
                    Восстановить полностью
                  </button>
                  {selectedToken.currentHp === 0 && <p className="hp-status">Участник выведен из строя</p>}
                </div>
              </>
            ) : (
              <p>Нажмите на жетон, чтобы изменить его имя, нанести урон или восстановить здоровье.</p>
            )}
          </div>
          <div className="token-tray">
            <div className="tray-title">
              <span>Добавить жетон</span>
              <small>{tokens.length} на поле</small>
            </div>
            <div className="token-grid">
              {roster.map((item) => (
                <button key={item.kind} onClick={() => addToken(item)}>
                  <i className={`mini-token side-${item.side} ${item.kind}`}>{item.short}</i>
                  <span>{item.label}</span>
                  <b>+</b>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Cards() {
  const [mode, setMode] = useState<"heroes" | "enemies">("heroes");
  const items = mode === "heroes" ? heroes : enemies;

  return (
    <section className="cards-section" id="cards">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Летопись проклятой долины</span>
          <h2>Карточки участников</h2>
        </div>
        <div className="segmented">
          <button className={mode === "heroes" ? "active" : ""} onClick={() => setMode("heroes")}>Герои</button>
          <button className={mode === "enemies" ? "active" : ""} onClick={() => setMode("enemies")}>Противники</button>
        </div>
      </div>
      <div className="stats-guide">
        <div className="stats-guide-intro">
          <span className="panel-label">Как читать характеристики</span>
          <h3>Что означает каждое число</h3>
          <p>Эти обозначения одинаковы на карточках героев и противников. Ведущий может открыть этот блок во время игры как быструю памятку.</p>
        </div>
        <div className="stat-explanations">
          <article>
            <b>ОЗ</b>
            <h4>Очки здоровья</h4>
            <p>Показывают, сколько урона выдержит участник. Полученный урон вычитается из ОЗ. При 0 ОЗ герой не атакует, но может раз за раунд дать союзнику +1.</p>
          </article>
          <article>
            <b>АТК</b>
            <h4>Бонус атаки</h4>
            <p>При атаке бросьте d6 и прибавьте АТК. Если сумма равна ЗАЩ цели или выше, атака попала. Например: d6 = 3 и АТК +2 дают итог 5.</p>
          </article>
          <article>
            <b>ЗАЩ</b>
            <h4>Защита</h4>
            <p>Число, которое атакующий должен набрать или превысить. Укрытие обычно временно повышает ЗАЩ на +1. Высокая ЗАЩ означает, что по цели труднее попасть.</p>
          </article>
          <article>
            <b>ДУХ</b>
            <h4>Сила духа</h4>
            <p>Ресурс для особых способностей. Потратьте указанное число ДУХ при применении способности. Обычная атака этот ресурс не требует.</p>
          </article>
          <article>
            <b>ВОЛ</b>
            <h4>Воля</h4>
            <p>Используется против проклятий, страха и тёмных ритуалов: бросьте d6 + ВОЛ и сравните результат со сложностью проверки.</p>
          </article>
          <article>
            <b>УРОН</b>
            <h4>Потеря здоровья</h4>
            <p>После успешного попадания вычтите указанное значение из ОЗ цели. Если эффект уменьшает урон, примените уменьшение до вычитания из ОЗ.</p>
          </article>
          <article>
            <b>ИММУНИТЕТ</b>
            <h4>Полная защита от эффекта</h4>
            <p>Иммунитет означает, что указанный тип атаки или способности временно не действует. Игрокам нужно сменить способ атаки или отключить источник иммунитета.</p>
          </article>
          <article>
            <b>СПОСОБНОСТЬ</b>
            <h4>Особое действие</h4>
            <p>Даёт эффект сверх обычной атаки: лечение, взлом, щит или контроль. Если не сказано иначе, способность занимает одно действие героя.</p>
          </article>
        </div>
        <div className="combat-example">
          <b>Пример атаки</b>
          <span>Штурмовик бросает d6: выпало 3. Его АТК +2, итог — 5. У врага ЗАЩ 4, поэтому атака попала и наносит указанный в способности урон.</span>
        </div>
      </div>
      <div className={`card-grid ${mode}`}>
        {items.map((item) => (
          <article className="character-card" key={item.name}>
            <div className="card-image">
              <img src={item.image} alt={`Карточка: ${item.name}`} />
            </div>
            <div className="card-copy">
              <h3>{item.name}</h3>
              <b>{item.stats}</b>
              {"abilities" in item ? (
                <>
                  <span className="card-copy-label">Способности</span>
                  <ul>{item.abilities?.map((ability) => <li key={ability}>{ability}</li>)}</ul>
                </>
              ) : (
                <>
                  <span className="card-copy-label">Особенность</span>
                  <p>{item.skill}</p>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Story() {
  const timeline = [
    ["0–5", "Выбор ролей", "Раздайте карточки и объясните броски d6."],
    ["5–13", "Серый Брод", "Командное испытание: 3 успеха до 2 провалов."],
    ["13–25", "Катакомбы", "Первый бой и опасное окружение."],
    ["25–36", "Безликий рыцарь", "Мини-босс отражает способности героев."],
    ["36–55", "Король под Пеплом", "Три фазы финального сражения."],
    ["55–60", "Цена рассвета", "Команда решает судьбу Пепельной Короны."],
  ];

  return (
    <section className="story-section" id="story">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Сценарий на 60 минут</span>
          <h2>Путь к Пепельной Короне</h2>
        </div>
        <p>Готовая структура для ведущего: динамичная, простая для младших и тактическая для старших.</p>
      </div>
      <div className="story-grid">
        <div className="timeline">
          {timeline.map(([time, title, text], index) => (
            <article key={title}>
              <div className="time"><span>{time}</span><small>мин</small></div>
              <div>
                <span className="step">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="rules-panel">
          <span className="panel-label">Быстрые правила</span>
          <h3>Один кубик. Одно действие. Командная победа.</h3>
          <div className="rule">
            <b>d6 + бонус</b>
            <p>Результат не ниже сложности означает успех.</p>
          </div>
          <div className="rule">
            <b>Натуральная 6</b>
            <p>+1 урон или дополнительный полезный эффект.</p>
          </div>
          <div className="rule">
            <b>При 0 ОЗ</b>
            <p>Герой не выбывает и один раз за раунд даёт союзнику +1.</p>
          </div>
          <blockquote>«Я обещал им вечное царство. Они забыли попросить вечную жизнь»</blockquote>
        </div>
      </div>

      <div className="scene-details">
        <div className="gm-guide-heading">
          <span className="panel-label">Подробная шпаргалка</span>
          <h3>Сценарий для ведущего</h3>
          <p>Открывайте сцены по ходу игры. Текст в голубом блоке можно читать игрокам дословно.</p>
        </div>
        {gmScenes.map((scene, index) => (
          <details key={scene.id} open={index === 0}>
            <summary>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{scene.title}</strong>
              <em>{scene.time}</em>
            </summary>
            <div className="gm-scene-body">
              <p className="scene-purpose"><b>Зачем нужна сцена:</b> {scene.purpose}</p>
              <blockquote className="read-aloud">
                <span>Прочитайте вслух</span>
                {scene.readAloud}
              </blockquote>
              <div className="gm-scene-columns">
                <div>
                  <h4>Как вести сцену</h4>
                  <ol>{scene.beats.map((beat) => <li key={beat}>{beat}</li>)}</ol>
                </div>
                <div className="gm-notes">
                  <h4>Проверки и реакции</h4>
                  <p>{scene.checks}</p>
                  <h4>Если игроки провалились</h4>
                  <p>{scene.failForward}</p>
                  <h4>Переход к следующей сцене</h4>
                  <p>{scene.transition}</p>
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Пепельная Корона — на главную">
          <i>♜</i>
          <span>ПЕПЕЛЬНАЯ<br /><b>КОРОНА</b></span>
        </a>
        <nav className={menuOpen ? "open" : ""}>
          <a href="#map" onClick={() => setMenuOpen(false)}>Карта</a>
          <a href="#cards" onClick={() => setMenuOpen(false)}>Персонажи</a>
          <a href="#story" onClick={() => setMenuOpen(false)}>Сюжет</a>
          <a className="nav-cta" href="#map" onClick={() => setMenuOpen(false)}>Начать игру</a>
        </nav>
        <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Открыть меню">☰</button>
      </header>

      <section className="hero" id="top">
        <div className="hero-glow" />
        <div className="hero-copy">
          <span className="eyebrow">Тёмное средневековое фэнтези · 3–8 игроков · 60 минут</span>
          <h1>Переживите ночь.<br /><em>Сломите древнюю клятву.</em></h1>
          <p>Над долиной не встаёт солнце, мёртвые покидают могилы, а в разрушенном замке пробуждается Король под Пеплом. До рассвета герои должны пройти четыре проклятые земли и решить судьбу его Короны.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#map">Открыть игровое поле <span>→</span></a>
            <a className="text-button" href="#story">Смотреть сценарий</a>
          </div>
          <div className="meta-row">
            <span><b>4</b> уникальные роли</span>
            <span><b>4</b> тактические карты</span>
            <span><b>d6</b> простые правила</span>
          </div>
        </div>
        <div className="hero-visual">
          <img src="./assets/maps/ash-throne.webp" alt="Тронный зал Пепельной Короны" />
          <div className="scan-line" />
          <div className="floating-label label-one"><i /> Замок пробудился</div>
          <div className="floating-label label-two"><i /> Печати: 3 руны</div>
        </div>
      </section>

      <div className="mission-strip">
        <span>Ваша миссия</span>
        <p>Найдите Пепельную Корону, остановите восхождение мёртвого короля и решите, можно ли сохранить силу, которая однажды уже погубила долину.</p>
      </div>

      <BattleMap />
      <Cards />
      <Story />

      <section className="final-choice">
        <span className="eyebrow">Финал зависит от игроков</span>
        <h2>Какую цену заплатит долина?</h2>
        <p className="final-intro">Три готовых финала с иллюстрациями и текстом, который ведущий может прочитать сразу после решения команды.</p>
        <div className="ending-list">
          {endings.map((ending) => (
            <article className={`ending ending-${ending.id}`} key={ending.id}>
              <div className="ending-heading">
                <b>{ending.number}</b>
                <div>
                  <h3>{ending.title}</h3>
                  <p>{ending.summary}</p>
                </div>
              </div>
              <div className="ending-gallery">
                {ending.images.map((image, index) => (
                  <figure key={image}>
                    <img src={image} alt={`${ending.title}: ${ending.captions[index]}`} />
                    <figcaption><span>0{index + 1}</span>{ending.captions[index]}</figcaption>
                  </figure>
                ))}
              </div>
              <div className="ending-script">
                <div>
                  <span className="panel-label">Цена решения</span>
                  <p>{ending.consequence}</p>
                </div>
                <blockquote>
                  <span>Прочитайте вслух</span>
                  {ending.readAloud}
                </blockquote>
                <div>
                  <span className="panel-label">Эпилог через месяц</span>
                  <p>{ending.epilogue}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <a className="brand" href="#top"><i>♜</i><span>ПЕПЕЛЬНАЯ<br /><b>КОРОНА</b></span></a>
        <p>Тёмное фэнтези-приключение в стиле DnD для учеников 5–11 классов</p>
        <a href="#top">Наверх ↑</a>
      </footer>
    </main>
  );
}
