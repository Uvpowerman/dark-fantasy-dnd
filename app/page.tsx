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
  { kind: "assault", label: "Сэр Ардан Вейл", short: "А", side: "hero" as const, maxHp: 16 },
  { kind: "tech", label: "Маэлис Талан", short: "М", side: "hero" as const, maxHp: 11 },
  { kind: "medic", label: "Доррик Огнерук", short: "Д", side: "hero" as const, maxHp: 15 },
  { kind: "shadow", label: "Нерис Восс", short: "Н", side: "hero" as const, maxHp: 12 },
  { kind: "warden", label: "Каэл Пепельная Чешуя", short: "К", side: "hero" as const, maxHp: 14 },
  { kind: "scout", label: "Элва Фен", short: "Э", side: "hero" as const, maxHp: 12 },
  { kind: "drone", label: "Наёмник Серрика", short: "Н", side: "enemy" as const, maxHp: 8 },
  { kind: "hound", label: "Серебряная виверна", short: "В", side: "enemy" as const, maxHp: 14 },
  { kind: "glitch", label: "Рунический страж", short: "Р", side: "enemy" as const, maxHp: 18 },
  { kind: "mirror", label: "Капитан Серрик", short: "С", side: "enemy" as const, maxHp: 17 },
  { kind: "director", label: "Канцлер Одран", short: "О", side: "enemy" as const, maxHp: 20 },
];

const heroPreset = roster.slice(0, 6).map((hero, index) => ({ ...hero, id: `hero-${index}`, x: 12 + index * 6, y: 84 + (index % 2) * 4, currentHp: hero.maxHp }));

const stages: Stage[] = [
  { id: "treaty", kicker: "Этап 01", title: "Зал договора", time: "10 минут", map: "./assets/maps/treaty-hall.webp", goal: "Найти доказательство поддельного приказа.", details: ["Три улики до двух провалов открывают тайный ход.", "Маэлис распознаёт фальшивую печать без броска.", "Стража перекрывает выход, если герои поднимут тревогу."], tokens: [...heroPreset, { ...roster[6], id: "t-merc-1", x: 78, y: 25, currentHp: roster[6].maxHp }, { ...roster[6], id: "t-merc-2", x: 86, y: 30, currentHp: roster[6].maxHp }] },
  { id: "tower", kicker: "Этап 02", title: "Сгоревшая башня", time: "12 минут", map: "./assets/maps/burned-tower.webp", goal: "Выяснить, кто устроил нападение, и спасти виверну.", details: ["Обломки дают +1 к ЗАЩ от дальних атак.", "Виверну можно успокоить тремя успехами вместо боя.", "Стрелы связывают нападение с наёмниками."], tokens: [...heroPreset.map((t, i) => ({ ...t, id: `t-${i}` })), { ...roster[7], id: "tower-wyvern", x: 50, y: 22, currentHp: roster[7].maxHp }, { ...roster[6], id: "tower-merc", x: 82, y: 20, currentHp: roster[6].maxHp }] },
  { id: "crossing", kicker: "Этап 03", title: "Древняя переправа", time: "11 минут", map: "./assets/maps/ancient-crossing.webp", goal: "Отключить стража и выйти к Разбитому мосту.", details: ["Три руны дают стражу иммунитет к урону.", "Доррик может перепрограммировать руну за действие.", "Скрытый обход открывается проверкой Разума 12."], tokens: [...heroPreset.map((t, i) => ({ ...t, id: `z-${i}`, x: 30 + i * 8, y: 87 })), { ...roster[8], id: "crossing-guardian", x: 50, y: 23, currentHp: roster[8].maxHp }] },
  { id: "bridge", kicker: "Этап 04", title: "Разбитый мост", time: "19 минут", map: "./assets/maps/broken-bridge.webp", goal: "Спасти яйцо, предъявить доказательства и остановить войну.", details: ["Одран уничтожает одну улику в конце раунда.", "Вэретис атакует, если герои не объяснят происходящее.", "Три действия разных героев разоблачают заговор."], tokens: [...heroPreset.map((t, i) => ({ ...t, id: `n-${i}`, x: 30 + i * 8, y: 88 })), { ...roster[9], id: "bridge-serric", x: 42, y: 20, currentHp: roster[9].maxHp }, { ...roster[10], id: "bridge-odran", x: 58, y: 16, currentHp: roster[10].maxHp }] },
];

const heroes = [
  {
    name: "Сэр Ардан Вейл", image: "./assets/cards/ardan.webp", stats: "Человек · командир · ОЗ 16 · АТК +4 · ЗАЩ 15",
    accent: "cyan",
    abilities: ["Прикрыть — принять атаку по соседнему союзнику", "Командный голос — союзник перебрасывает проверку", "Военный устав — знает порядок охраны и сигналы"],
  },
  {
    name: "Маэлис Талан", image: "./assets/cards/maelis.webp", stats: "Эльф · дипломат-разведчица · ОЗ 11 · АТК +3 · ЗАЩ 14",
    accent: "violet",
    abilities: ["Читать намерение — распознать ложь", "Дипломатический иммунитет — остановить атаку", "Точная копия — узнать поддельную печать"],
  },
  {
    name: "Доррик Огнерук", image: "./assets/cards/dorrik.webp", stats: "Дворф · рунник · ОЗ 15 · АТК +4 · ЗАЩ 15",
    accent: "green",
    abilities: ["Снять руну — отключить ловушку", "Полевой ремонт — восстановить 4 ОЗ", "Каменная преграда — создать укрытие"],
  },
  {
    name: "Нерис Восс", image: "./assets/cards/neris.webp", stats: "Тифлинг · следовательница · ОЗ 12 · АТК +4 · ЗАЩ 13",
    accent: "pink",
    abilities: ["Клятва истины — цель не может солгать", "Знак вины — пометить улику", "Цепь договора — удержать противника"],
  },
  { name: "Каэл Пепельная Чешуя", image: "./assets/cards/kael.webp", stats: "Драконорождённый · следопыт · ОЗ 14 · АТК +5 · ЗАЩ 14", accent: "pink", abilities: ["След пепла — определить направление погони", "Драконья речь — говорить с драконами", "Дыхание жара — урон 1d6 + 2"] },
  { name: "Элва Фен", image: "./assets/cards/elva.webp", stats: "Полурослик · полевой медик · ОЗ 12 · АТК +3 · ЗАЩ 14", accent: "green", abilities: ["Полевая помощь — восстановить 1d6 + 3 ОЗ", "Тайный маршрут — обойти патруль", "Нужная вещь — достать обычный предмет"] },
];

const enemies = [
  { name: "Наёмник Серрика", image: "./assets/cards/mercenary.webp", stats: "ОЗ 8 · АТК +3 · ЗАЩ 13", skill: "Строй щитов: +2 ЗАЩ рядом с союзником." },
  { name: "Серебряная виверна", image: "./assets/cards/wyvern.webp", stats: "ОЗ 14 · АТК +4 · ЗАЩ 14", skill: "Отступает после лечения или трёх успехов успокоения." },
  { name: "Рунический страж", image: "./assets/cards/rune-guardian.webp", stats: "ОЗ 18 · АТК +4 · ЗАЩ 16", skill: "Не получает урон, пока не отключены две руны." },
  { name: "Капитан Серрик", image: "./assets/cards/serric.webp", stats: "ОЗ 17 · АТК +5 · ЗАЩ 15", skill: "Один наёмник немедленно перемещается и атакует." },
  { name: "Канцлер Одран Вейр", image: "./assets/cards/odran.webp", stats: "ОЗ 20 · АТК +4 · ЗАЩ 15", skill: "В конце раунда уничтожает одну улику." },
];

const gmScenes = [
  { id: "briefing", time: "0–8 минут", title: "Совет перед бурей", purpose: "Представить героев и цену провала: двадцатипятилетний мир может закончиться за одну ночь.", readAloud: "В Зале договора пустует бронзовая колыбель. Драконье яйцо исчезло за час до прибытия посольства, а с востока уже виден дым пограничной башни. Людские лорды требуют закрыть ворота. Драконы требуют вернуть наследника до рассвета.", beats: ["Раздайте шесть карточек и попросите игроков назвать отношение героя к прежней войне.", "Объясните правило: d20 + бонус против сложности 10–16; в бою — перемещение и одно действие.", "Соберите три улики: тайный механизм, поддельную печать и ткань плаща наёмника."], checks: "Расследование 12, Внимание 11, Убеждение 13. Маэлис узнаёт фальшивую печать автоматически.", failForward: "При двух провалах стража задерживает группу, но тайный ход всё равно найден.", transition: "Тоннель выходит на дорогу к горящей башне — туда же ведут следы тяжёлой повозки." },
  { id: "tower-guide", time: "8–22 минуты", title: "Сгоревшая башня", purpose: "Показать подделку улик и дать выбор между силой и помощью.", readAloud: "Башня ещё горит. На камнях выжжены огромные следы когтей, но между ними видны человеческие сапоги. Под балкой тяжело дышит серебряная виверна; в её боку торчит чёрная стрела без герба.", beats: ["Наёмники пытаются забрать стрелы и добить виверну.", "Три успеха лечения, общения или спокойного движения делают виверну союзником.", "Поддельные когти изготовлены из железа; Доррик или Каэл замечают это."], checks: "Медицина 12, Общение 13, Расследование 11.", failForward: "Если виверна улетает, она возвращается в финале настороженной. Стрелы всё равно остаются уликой.", transition: "На древке стрелы вырезан знак Древней переправы." },
  { id: "crossing-guide", time: "22–36 минут", title: "Древняя переправа", purpose: "Дать тактическую задачу, где инженерия, магия и скрытность равноценны бою.", readAloud: "Каменный страж поднимается из русла. На его груди горят руны: ПРИКАЗ, ГРАНИЦА, УНИЧТОЖИТЬ. Последнее слово вырезано недавно поверх древнего текста.", beats: ["Пока действуют две руны, страж не получает урон.", "Доррик переписывает руну, Нерис связывает приказ клятвой, Элва ведёт по техническому тоннелю.", "После отключения страж показывает запись: Одран прибыл с яйцом и Серриком."], checks: "Руны 13, Акробатика 12, Скрытность 12, Сила 15.", failForward: "Через три раунда страж перегревается, но каждый герой теряет 2 ОЗ.", transition: "Каменная память показывает Разбитый мост и приближающуюся Вэретис." },
  { id: "bridge-guide", time: "36–55 минут", title: "Разбитый мост", purpose: "Соединить бой, расследование и переговоры в одном финале.", readAloud: "Одран держит факел над драконьим яйцом. Наёмники поднимают арбалеты, а с неба спускается бронзовая драконица Вэретис. «Ещё шаг, — говорит канцлер, — и каждая сторона увидит именно то предательство, которое ждала».", beats: ["В конце раунда Одран пытается уничтожить улику.", "Для разоблачения нужны три успеха разных героев.", "Вэретис слушает Каэла или героя, который помог виверне.", "На половине ОЗ Одран предлагает тайный компромисс."], checks: "Убеждение 14, Запугивание 15, Ловкость 13 для спасения яйца.", failForward: "Без доказательств герои могут спасти яйцо и бежать, но война ещё не остановлена.", transition: "Теперь игроки решают, какой правде позволить прозвучать." },
  { id: "ending-guide", time: "55–60 минут", title: "Цена мира", purpose: "Завершить игру политическим решением.", readAloud: "Яйцо снова в бронзовой колыбели. Перед вами доказательства, а по обе стороны моста ждут армии. Правда может сохранить договор, разрушить совет или превратить вас в беглецов.", beats: ["Предложите открытый суд, тихий компромисс или спасение яйца ценой изгнания.", "Каждый игрок называет, чего боится потерять его герой.", "При равенстве решает герой, сохранивший последнюю улику."], checks: "Финал не требует броска.", failForward: "Любой вариант оставляет возможность продолжения.", transition: "Договор получает новую печать — или рвётся пополам." },
];

const endings = [
  { id: "break", number: "01", title: "Открытая правда", summary: "Улики предъявлены обеим сторонам. Заговорщики арестованы, договор возобновлён.", consequence: "Плюс: война остановлена. Цена: двор расколот, а герои наживают влиятельных врагов.", readAloud: "Маэлис ломает фальшивую печать перед послами. Вэретис склоняет голову над спасённым яйцом, а людские солдаты разворачивают копья против наёмников.", epilogue: "Через месяц на границе работает совместный дозор людей и драконов.", images: ["./assets/maps/treaty-hall.webp", "./assets/maps/burned-tower.webp", "./assets/maps/broken-bridge.webp"], captions: ["Улика в Зале договора", "Правда среди пепла", "Новая печать мира"] },
  { id: "mara", number: "02", title: "Тихий компромисс", summary: "Одран устранён без публичного суда. Мир сохранён, но часть правды скрыта.", consequence: "Плюс: армии расходятся без потерь. Цена: система заговора остаётся.", readAloud: "Одран исчезает под охраной без гербов, а совет объявляет нападение ошибкой командира. Вэретис принимает объяснение, но запоминает тех, кто предпочёл молчание.", epilogue: "Герои тайно следят за выполнением договора.", images: ["./assets/cards/odran.webp", "./assets/maps/ancient-crossing.webp", "./assets/maps/treaty-hall.webp"], captions: ["Цена молчания", "Секретный путь", "Закрытое заседание"] },
  { id: "seal", number: "03", title: "Беглецы с яйцом", summary: "Доказательств недостаточно. Герои спасают наследника, но обе армии считают их предателями.", consequence: "Плюс: будущий дракон спасён. Цена: война ещё не остановлена.", readAloud: "Каэл подхватывает колыбель, Элва открывает тайный спуск, а Вэретис закрывает мост крыльями. За спиной звучат приказы об аресте.", epilogue: "Через месяц портреты героев висят на заставах, но слух о спасённом яйце меняет солдат.", images: ["./assets/maps/broken-bridge.webp", "./assets/cards/kael.webp", "./assets/cards/maelis.webp"], captions: ["Побег через мост", "Путь в земли драконов", "Доказательства существуют"] },
];

const rollValue = (sides: number) => Math.floor(Math.random() * sides) + 1;

function BattleMap() {
  const [stageIndex, setStageIndex] = useState(0);
  const [allTokens, setAllTokens] = useState<Record<string, Token[]>>(() =>
    Object.fromEntries(stages.map((stage) => [stage.id, stage.tokens]))
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [dieSides, setDieSides] = useState(20);
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
                <p>d20 — для проверок и атак; остальные кубики — для урона, лечения и эффектов.</p>
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
  const [selectedHeroes, setSelectedHeroes] = useState<string[]>([]);
  const items = mode === "heroes" ? heroes : enemies;
  const toggleHero = (name: string) => setSelectedHeroes((current) => current.includes(name) ? current.filter((hero) => hero !== name) : [...current, name]);

  return (
    <section className="cards-section" id="cards">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Участники последнего договора</span>
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
            <p>При атаке бросьте d20 и прибавьте АТК. Если сумма равна ЗАЩ цели или выше, атака попала.</p>
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
            <p>Используется против давления, угроз и магического принуждения: бросьте d20 + ВОЛ.</p>
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
          <span>Ардан бросает d20: выпало 12. Его АТК +4, итог — 16. У наёмника ЗАЩ 13, поэтому атака попала.</span>
        </div>
      </div>
      <div className={`card-grid ${mode}`}>
        {items.map((item) => (
          <article className={`character-card ${selectedHeroes.includes(item.name) ? "chosen" : ""}`} key={item.name}>
            <div className="card-image">
              <img src={item.image} alt={`Карточка: ${item.name}`} loading="lazy" decoding="async" />
            </div>
            <div className="card-copy">
              <h3>{item.name}</h3>
              <b>{item.stats}</b>
              {"abilities" in item ? (
                <>
                  <span className="card-copy-label">Способности</span>
                  <ul>{item.abilities?.map((ability) => <li key={ability}>{ability}</li>)}</ul>
                  <button className="choose-character" type="button" aria-pressed={selectedHeroes.includes(item.name)} onClick={() => toggleHero(item.name)}>{selectedHeroes.includes(item.name) ? "✓ Герой выбран" : "Выбрать героя"}</button>
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
      {mode === "heroes" && <div className="selection-summary" aria-live="polite"><b>Выбрано: {selectedHeroes.length} из {heroes.length}</b><span>{selectedHeroes.length ? selectedHeroes.join(" · ") : "Нажмите «Выбрать героя» на карточках игроков."}</span>{selectedHeroes.length > 0 && <button type="button" onClick={() => setSelectedHeroes([])}>Сбросить выбор</button>}</div>}
    </section>
  );
}

function Story() {
  const timeline = [
    ["0–8", "Совет перед бурей", "Выберите героев и найдите первые улики."],
    ["8–22", "Сгоревшая башня", "Разоблачите подставное нападение."],
    ["22–36", "Древняя переправа", "Отключите рунического стража."],
    ["36–55", "Разбитый мост", "Спасите яйцо и докажите заговор."],
    ["55–60", "Цена мира", "Решите, какую правду услышат армии."],
  ];

  return (
    <section className="story-section" id="story">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Сценарий на 60 минут</span>
          <h2>Путь к последнему договору</h2>
        </div>
        <p>Серьёзное приключение о расследовании и хрупком мире между людьми и драконами.</p>
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
            <b>d20 + бонус</b>
            <p>Результат не ниже сложности означает успех.</p>
          </div>
          <div className="rule">
            <b>Натуральная 20</b>
            <p>+1 урон или дополнительный полезный эффект.</p>
          </div>
          <div className="rule">
            <b>При 0 ОЗ</b>
            <p>Герой не выбывает и один раз за раунд даёт союзнику +1.</p>
          </div>
          <blockquote>«Война начинается не с удара, а с первой удобной лжи»</blockquote>
        </div>
      </div>

      <div className="scene-details">
        <div className="gm-guide-heading">
          <span className="panel-label">Подробная шпаргалка</span>
          <h3>Сценарий для ведущего</h3>
          <p>Открывайте сцены по ходу игры. Выделенный текст можно читать игрокам дословно.</p>
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
        <a className="brand" href="#top" aria-label="Последний договор — на главную">
          <i>◆</i><span>ПОСЛЕДНИЙ<br /><b>ДОГОВОР</b></span>
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
          <span className="eyebrow">Серьёзное фэнтези · 3–6 игроков · 60 минут</span>
          <h1>Раскройте заговор.<br /><em>Остановите новую войну.</em></h1>
          <p>Двадцать пять лет люди и драконы хранили мир. Теперь драконье яйцо похищено, пограничная башня сожжена, а обе стороны обвиняют друг друга. До рассвета герои должны найти правду — и решить, кто имеет право её услышать.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#map">Открыть игровое поле <span>→</span></a>
            <a className="text-button" href="#story">Смотреть сценарий</a>
          </div>
          <div className="meta-row">
            <span><b>6</b> уникальных героев</span>
            <span><b>4</b> тактические карты</span>
            <span><b>d20</b> проверки и бой</span>
          </div>
        </div>
        <div className="hero-visual">
          <img src="./assets/maps/broken-bridge.webp" alt="Переговоры на Разбитом мосту" />
          <div className="scan-line" />
          <div className="floating-label label-one"><i /> Яйцо похищено</div>
          <div className="floating-label label-two"><i /> Договор под угрозой</div>
        </div>
      </section>

      <div className="mission-strip">
        <span>Ваша миссия</span>
        <p>Верните драконье яйцо, соберите доказательства провокации и не дайте канцлеру превратить старые страхи в новую войну.</p>
      </div>

      <BattleMap />
      <Cards />
      <Story />

      <section className="final-choice">
        <span className="eyebrow">Финал зависит от игроков</span>
        <h2>Какую цену заплатят за мир?</h2>
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
                    <img src={image} alt={`${ending.title}: ${ending.captions[index]}`} loading="lazy" decoding="async" />
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
        <a className="brand" href="#top"><i>◆</i><span>ПОСЛЕДНИЙ<br /><b>ДОГОВОР</b></span></a>
        <p>Серьёзное фэнтези-приключение о расследовании, политике и выборе</p>
        <a href="#top">Наверх ↑</a>
      </footer>
    </main>
  );
}
