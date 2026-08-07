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
  { kind: "assault", label: "Сэр Альрик Дейн", short: "А", side: "hero" as const, maxHp: 16 },
  { kind: "tech", label: "Ваэла Нэр", short: "В", side: "hero" as const, maxHp: 11 },
  { kind: "medic", label: "Бранн Орсик", short: "Б", side: "hero" as const, maxHp: 15 },
  { kind: "shadow", label: "Мирель Пепельное Крыло", short: "М", side: "hero" as const, maxHp: 12 },
  { kind: "drone", label: "Наёмник Пепельной роты", short: "Н", side: "enemy" as const, maxHp: 8 },
  { kind: "mirror", label: "Капитан Хадрик Сорн", short: "Х", side: "enemy" as const, maxHp: 18 },
  { kind: "hound", label: "Руническая гончая", short: "Г", side: "enemy" as const, maxHp: 10 },
  { kind: "spider", label: "Кристальная паучиха", short: "П", side: "enemy" as const, maxHp: 18 },
  { kind: "glitch", label: "Каменный страж", short: "С", side: "enemy" as const, maxHp: 22 },
  { kind: "golem", label: "Орун, базальтовый исполин", short: "О", side: "enemy" as const, maxHp: 40 },
  { kind: "director", label: "Магистр Элгар Восс", short: "Э", side: "enemy" as const, maxHp: 12 },
];

const heroPreset = roster.slice(0, 4).map((hero, index) => ({ ...hero, id: `hero-${index}`, x: 35 + index * 10, y: 86, currentHp: hero.maxHp }));

const stages: Stage[] = [
  { id: "city", kicker: "Этап 01", title: "Первый удар", time: "0–8 минут", map: "./assets/maps/eclipse-city.webp", goal: "Спасти рабочих и найти первые следы запретной добычи.", details: ["Разум 10 раскрывает, что приказ Элгара подписан заранее.", "Серебристая пыль ведёт к закрытому уровню шахты.", "Провал не останавливает сцену: рабочий отдаёт героям старую карту."], tokens: [...heroPreset] },
  { id: "gate", kicker: "Этап 02", title: "Перекрытая шахта", time: "8–20 минут", map: "./assets/maps/blocked-mine.webp", goal: "Пройти охрану и забрать журнал тайных работ.", details: ["Хадрика можно убедить, что Элгар сделает его виновным.", "Гончая отключается проверкой Разума 13.", "Вентиляционный тоннель позволяет обойти короткий бой."], tokens: [...heroPreset.map((t, i) => ({ ...t, id: `g-${i}` })), { ...roster[4], id: "gate-merc-1", x: 67, y: 34, currentHp: roster[4].maxHp }, { ...roster[5], id: "gate-hadrik", x: 77, y: 29, currentHp: roster[5].maxHp }, { ...roster[6], id: "gate-hound", x: 57, y: 42, currentHp: roster[6].maxHp }] },
  { id: "pact", kicker: "Этап 03", title: "Зал старого договора", time: "20–32 минуты", map: "./assets/maps/bell-hall.webp", goal: "Понять назначение колокола и пройти древних стражей.", details: ["Паучиха защищает кладку и не преследует отступающих.", "Страж пропускает группу при предъявлении приказа Элгара.", "Правда: колокол управляет Оруном и удерживает гору."], tokens: [...heroPreset.map((t, i) => ({ ...t, id: `p-${i}` })), { ...roster[7], id: "pact-spider", x: 68, y: 52, currentHp: roster[7].maxHp }, { ...roster[8], id: "pact-guardian", x: 50, y: 24, currentHp: roster[8].maxHp }] },
  { id: "bell", kicker: "Этап 04", title: "Колокол Чёрной Луны", time: "32–50 минут", map: "./assets/maps/bell-hall.webp", goal: "Получить четыре успеха раньше трёх провалов и решить судьбу шахты.", details: ["Сила, Разум, Воля, Ловкость или Общение — сложность 13.", "Элгар предлагает подчинить Оруна ради процветания города.", "Обычное оружие наносит исполину только половину урона."], tokens: [...heroPreset.map((t, i) => ({ ...t, id: `b-${i}` })), { ...roster[5], id: "bell-hadrik", x: 42, y: 24, currentHp: roster[5].maxHp }, { ...roster[9], id: "bell-orun", x: 70, y: 20, currentHp: roster[9].maxHp }, { ...roster[10], id: "bell-elgar", x: 57, y: 31, currentHp: roster[10].maxHp }] },
];

const heroes = [
  {
    name: "Сэр Альрик Дейн", image: "./assets/cards/alric.webp", stats: "Человек · рыцарь · ОЗ 16 · ЗАЩ 15 · СИЛ +4 · ЛОВ +1 · РАЗ +2 · ВОЛ +3",
    accent: "cyan",
    abilities: ["Закрыть союзника — принять атаку по соседнему герою", "Последняя клятва — один раз остаться с 1 ОЗ и сразу действовать", "Длинный меч — d20 + 4, урон 1d8 + 2"],
  },
  {
    name: "Ваэла Нэр", image: "./assets/cards/vaela.webp", stats: "Глубинный эльф · геомант · ОЗ 11 · ЗАЩ 12 · СИЛ +1 · ЛОВ +2 · РАЗ +5 · ВОЛ +4",
    accent: "violet",
    abilities: ["Память камня — узнать недавние события рядом со стеной", "Резонансная тишина — один раз отменить удар колокола", "Каменный осколок — d20 + 5, урон 1d6 + 2"],
  },
  {
    name: "Бранн Орсик", image: "./assets/cards/brann.webp", stats: "Горный дворф · инженер · ОЗ 15 · ЗАЩ 14 · СИЛ +3 · ЛОВ +1 · РАЗ +4 · ВОЛ +3",
    accent: "green",
    abilities: ["Аварийный ремонт — дважды восстановить 1d6 + 2 ОЗ", "Удержать свод — один раз отменить обрушение в зоне", "Рунический молот — d20 + 3, урон 1d6 + 2"],
  },
  {
    name: "Мирель Пепельное Крыло", image: "./assets/cards/mirelle.webp", stats: "Тифлинг · разведчица · ОЗ 12 · ЗАЩ 13 · СИЛ +1 · ЛОВ +5 · РАЗ +3 · ВОЛ +2",
    accent: "pink",
    abilities: ["Найти слабое место — следующая атака получает +3", "Дымовой болт — один раз создать безопасное облако", "Компактный арбалет — d20 + 5, урон 1d6 + 2"],
  },
];

const enemies = [
  { name: "Наёмник Пепельной роты", image: "./assets/cards/hadrik.webp", stats: "ОЗ 8 · АТК +3 · ЗАЩ 12", skill: "Меч наносит 1d6 + 1. Сдаётся после поражения капитана." },
  { name: "Капитан Хадрик Сорн", image: "./assets/cards/hadrik.webp", stats: "ОЗ 18 · АТК +4 · ЗАЩ 14", skill: "Команда: выбранный союзник получает +2 к следующей атаке." },
  { name: "Руническая гончая", image: "./assets/cards/rune-hound.webp", stats: "ОЗ 10 · АТК +3 · ЗАЩ 14", skill: "Отключается без боя успешной проверкой Разума 13." },
  { name: "Кристальная паучиха", image: "./assets/cards/crystal-spider.webp", stats: "ОЗ 18 · АТК +4 · ЗАЩ 13", skill: "Паутина лишает перемещения; не преследует вдали от кладки." },
  { name: "Каменный страж", image: "./assets/cards/stone-guardian.webp", stats: "ОЗ 22 · АТК +5 · ЗАЩ 16", skill: "Прекращает бой, если герои предъявят доказательства нарушения." },
  { name: "Орун, базальтовый исполин", image: "./assets/cards/orun.webp", stats: "ОЗ 40 · АТК +6 · ЗАЩ 16", skill: "Удар наносит 2d6 + 2; обычное оружие причиняет половину урона." },
  { name: "Магистр Элгар Восс", image: "./assets/cards/elgar.webp", stats: "ОЗ 12 · АТК +3 · ЗАЩ 12", skill: "Использует серебряный жезл, охрану и механизм колокола вместо прямого боя." },
];

const gmScenes = [
  { id: "first-strike", time: "0–8 минут", title: "Первый удар", purpose: "Сразу показать угрозу городу и дать героям четыре ясные улики.", readAloud: "Затмение накрывает Каменный Предел. Из глубины приходит удар колокола — слишком низкий, чтобы его услышать только ушами. Подъёмник рушится, улицы дрожат, а шахтёр шепчет: «Магистр отправил людей ниже закрытого уровня».", beats: ["Дайте каждому игроку одно короткое спасательное действие.", "Покажите серебристую пыль, щит Пепельной роты, часть приказа и старую карту.", "Рабочий сообщает, что наёмники запечатали проход."], checks: "Сила 10 для подъёмника, Разум 10 для приказа, Ловкость 10 для спасения рабочего.", failForward: "Даже при провале рабочие спасены ценой 2 ОЗ одного героя; карта остаётся у команды.", transition: "След серебряной пыли ведёт к перекрытому входу в шахту." },
  { id: "blocked-gate", time: "8–20 минут", title: "Перекрытая шахта", purpose: "Дать выбор между боем, переговорами, скрытностью и инженерией.", readAloud: "Железные ворота перетянуты цепями. За ними Хадрик держит людей в строю, а медные знаки на рунической гончей загораются один за другим. «Ниже ничего нет, — говорит капитан. — Возвращайтесь в город».", beats: ["Хадрик не хочет умирать за Элгара и реагирует на правдивое обвинение.", "Гончую можно отключить одной изменённой руной.", "За воротами лежит журнал работ с прямым приказом пробить печать."], checks: "Общение 13, Разум 13, Скрытность 12 или атака против ЗАЩ охраны.", failForward: "После трёх раундов Хадрик отступает, оставив журнал, но предупреждает Элгара.", transition: "Последняя запись указывает на Зал старого договора." },
  { id: "old-pact", time: "20–32 минуты", title: "Зал старого договора", purpose: "Объяснить истинное назначение колокола и показать, что не каждый страж — враг.", readAloud: "Кристаллы на стенах отвечают на каждый шаг тусклым светом. В центре галереи паучиха закрывает кладку телом, а за ней каменный страж поднимает алебарду. На его груди вырезано: «Договор хранит гору».", beats: ["Паучиху можно отвлечь, успокоить земной магией, обойти или победить.", "Страж понимает древнюю надпись и приказ Элгара.", "Герои узнают: колокол удерживает гору и управляет Оруном."], checks: "Разум 13, Воля 13, Ловкость 13; Ваэла получает один автоматический успех.", failForward: "Страж пропускает героев после короткого боя, но первый финальный провал уже засчитывается.", transition: "Новый удар колокола открывает путь к нижнему механизму." },
  { id: "black-bell", time: "32–50 минут", title: "Колокол Чёрной Луны", purpose: "Соединить командное испытание, противостояние с Элгаром и моральный выбор.", readAloud: "Элгар держит серебряное сердце колокола обеими руками. За ним поднимается Орун, осыпая свод каменной пылью. «Без этой руды город обанкротится, — говорит магистр. — Помогите подчинить исполина, и Каменный Предел переживёт зиму».", beats: ["Команде нужны четыре успеха раньше трёх провалов.", "Каждый герой может использовать свой лучший подход один раз.", "Хадрик меняет сторону после успешного убеждения.", "Атака защищает работающего с механизмом героя, но не заменяет настройку."], checks: "Сила, Разум, Воля, Ловкость или Общение 13. Атака — против ЗАЩ текущего врага.", failForward: "При трёх провалах Орун запечатывает шахту; герои спасаются и переходят к финалу «Молчание колокола».", transition: "Когда звон стихает, игроки решают судьбу договора, руды и самого города." },
  { id: "verdict", time: "50–60 минут", title: "Цена камня", purpose: "Дать время на спор игроков и короткий эпилог без нового боя.", readAloud: "Колокол молчит. Над Каменным Пределом остаётся чёрное солнце, а внизу ждут рабочие, глубинные эльфы и люди Элгара. Одно решение определит, кому теперь принадлежит гора.", beats: ["Предложите три финала ниже без подсказки о правильном выборе.", "Пусть каждый игрок назовёт, что его герой готов потерять.", "При равенстве решает персонаж, совершивший последний успех у колокола."], checks: "Финал не требует броска.", failForward: "Любой выбор завершает часовую игру и оставляет зацепку для продолжения.", transition: "Опишите один месяц последствий и завершите сессию." },
];

const endings = [
  { id: "break", number: "01", title: "Возобновлённый договор", summary: "Элгар разоблачён, запретная шахта закрыта, а люди и глубинные эльфы снова делят ответственность за гору.", consequence: "Плюс: Орун остановлен и договор восстановлен. Цена: город ждут тяжёлые годы без серебряной руды.", readAloud: "Ваэла кладёт журнал работ на каменный стол. Орун опускается на колено, а представители двух народов ставят новые печати поверх трещины старого договора.", epilogue: "Через месяц открывается совместный совет горы, а Бранн возглавляет безопасное укрепление верхних шахт.", images: ["./assets/maps/bell-hall.webp", "./assets/cards/vaela.webp", "./assets/maps/eclipse-city.webp"], captions: ["Колокол снова настроен", "Голос глубинного народа", "Город принимает цену"] },
  { id: "mara", number: "02", title: "Молчание колокола", summary: "Серебряное сердце разрушено. Орун засыпает, но гора больше не защищена древним механизмом.", consequence: "Плюс: Элгар теряет власть и опасность отступает. Цена: у города есть лишь несколько лет на переселение.", readAloud: "Последний осколок серебряного сердца гаснет в ладони Мирель. Вместе с ним стихает Орун — и впервые за триста лет в глубине становится совершенно тихо.", epilogue: "Через месяц начинаются первые переселения; жители спорят, спасли их герои или лишили будущего.", images: ["./assets/cards/mirelle.webp", "./assets/maps/blocked-mine.webp", "./assets/cards/elgar.webp"], captions: ["Разбитое сердце", "Закрытый нижний уровень", "Конец власти Элгара"] },
  { id: "seal", number: "03", title: "Власть над камнем", summary: "Герои помогают Элгару подчинить Оруна. Шахты укреплены, и город получает доступ к запретной руде.", consequence: "Плюс: Каменный Предел становится богатым. Цена: глубинные эльфы считают договор окончательно нарушенным.", readAloud: "Орун разворачивается к обрушенному своду и поднимает его плечами. Над городом вспыхивают новые плавильни, но далеко под землёй гаснут огни посольства глубинных эльфов.", epilogue: "Через месяц серебро течёт рекой, а на южных тропах появляются первые отряды изгнанников.", images: ["./assets/cards/orun.webp", "./assets/cards/alric.webp", "./assets/maps/eclipse-city.webp"], captions: ["Подчинённый исполин", "Новая власть", "Богатство под затмением"] },
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
          <span className="eyebrow">Люди и стражи Каменного Предела</span>
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
            <b>СИЛ</b>
            <h4>Сила</h4>
            <p>Подъём тяжестей, удержание механизмов и ближний бой. Бросьте d20 и прибавьте СИЛ.</p>
          </article>
          <article>
            <b>ЗАЩ</b>
            <h4>Защита</h4>
            <p>Число, которое атакующий должен набрать или превысить. Укрытие обычно временно повышает ЗАЩ на +1. Высокая ЗАЩ означает, что по цели труднее попасть.</p>
          </article>
          <article>
            <b>ЛОВ</b>
            <h4>Ловкость</h4>
            <p>Скрытность, дальние атаки, баланс и работа с быстрыми механизмами. Бросьте d20 + ЛОВ.</p>
          </article>
          <article>
            <b>РАЗ</b>
            <h4>Разум</h4>
            <p>Знания, руны, расследование и ремонт. Бросьте d20 + РАЗ против указанной сложности.</p>
          </article>
          <article>
            <b>ВОЛ</b>
            <h4>Воля</h4>
            <p>Стойкость перед звоном, страхом, давлением и магией. Бросьте d20 + ВОЛ.</p>
          </article>
          <article>
            <b>АТАКА</b>
            <h4>Попадание и урон</h4>
            <p>Бросьте d20 с бонусом оружия. Если итог не ниже ЗАЩ цели, бросьте указанный кубик урона и вычтите результат из ОЗ.</p>
          </article>
          <article>
            <b>СЛОЖНОСТЬ</b>
            <h4>Порог проверки</h4>
            <p>10 — обычная, 13 — трудная, 16 — очень трудная. Результат d20 + характеристика должен быть не ниже порога.</p>
          </article>
        </div>
        <div className="combat-example">
          <b>Пример атаки</b>
          <span>Альрик бросает d20: выпало 10. Его бонус меча +4, итог — 14. У наёмника ЗАЩ 12, поэтому атака попала.</span>
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
    ["0–8", "Первый удар", "Спасите рабочих и найдите след запретной руды."],
    ["8–20", "Перекрытая шахта", "Пройдите Хадрика, гончую и закрытые ворота."],
    ["20–32", "Старый договор", "Узнайте, зачем колокол удерживает гору."],
    ["32–50", "Чёрная Луна", "Настройте механизм раньше третьего провала."],
    ["50–60", "Цена камня", "Решите судьбу города, договора и Оруна."],
  ];

  return (
    <section className="story-section" id="story">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Сценарий на 60 минут</span>
          <h2>Шестьдесят минут до обрушения</h2>
        </div>
        <p>Серьёзное приключение о долге, цене процветания и древнем договоре, который город предпочёл забыть.</p>
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
          <blockquote>«Гора помнит каждый долг — даже тот, который город решил забыть»</blockquote>
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
        <a className="brand" href="#top" aria-label="Звон Чёрной Луны — на главную">
          <i>◒</i><span>ЗВОН<br /><b>ЧЁРНОЙ ЛУНЫ</b></span>
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
          <span className="eyebrow">Реалистичное фэнтези · 4 игрока · 60 минут</span>
          <h1>Колокол проснулся.<br /><em>Гора требует ответа.</em></h1>
          <p>Во время затмения под Каменным Пределом звучит древний колокол. Запретная печать пробита, базальтовый исполин поднимается из глубины, а до полного обрушения остаётся меньше часа.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#map">Открыть игровое поле <span>→</span></a>
            <a className="text-button" href="#story">Смотреть сценарий</a>
          </div>
          <div className="meta-row">
            <span><b>4</b> уникальных героя</span>
            <span><b>4</b> этапа приключения</span>
            <span><b>d20</b> проверки и бой</span>
          </div>
        </div>
        <div className="hero-visual">
          <img src="./assets/maps/eclipse-city.webp" alt="Затмение над Каменным Пределом" />
          <div className="scan-line" />
          <div className="floating-label label-one"><i /> Печать разрушена</div>
          <div className="floating-label label-two"><i /> До обрушения — 60 минут</div>
        </div>
      </section>

      <div className="mission-strip">
        <span>Ваша миссия</span>
        <p>Найдите источник звона, остановите Оруна и решите, стоит ли спасать город ценой окончательного нарушения древнего договора.</p>
      </div>

      <BattleMap />
      <Cards />
      <Story />

      <section className="final-choice">
        <span className="eyebrow">Финал зависит от игроков</span>
        <h2>Кому теперь принадлежит гора?</h2>
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
        <a className="brand" href="#top"><i>◒</i><span>ЗВОН<br /><b>ЧЁРНОЙ ЛУНЫ</b></span></a>
        <p>Часовое фэнтези-приключение о долге, памяти камня и цене процветания</p>
        <a href="#top">Наверх ↑</a>
      </footer>
    </main>
  );
}
