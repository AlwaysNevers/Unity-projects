/*
  LAST ORDERS — story content
  ------------------------------------------------------------
  All of the game's writing lives in this file, so you can edit
  the story, the philosophy, and the Designer's Notes without
  touching the game engine.

  Each dilemma ("node") has:
    beats     short subtitle lines shown one at a time.
              A beat is a string, or { who, text, fx, variant, scene }.
    prompt    the big question shown when it's time to decide
    choices   two options. Each has its own consequence beats.
              tags.obey  true = followed an order, false = defied one, null = no order
              tags.ends  true = did harm for a better outcome, false = refused to
              next       the next dilemma, or ending = which ending
    debrief   how three ethical frameworks judge the choice.
              verdict is the key ("A"/"B") that framework leans toward, or "split".
*/

window.STORY = {
  start: "bridge",

  // Opening title cards, shown over the burning city
  opening: [
    { big: "November 2031", small: "The Third World War is eleven weeks old." },
    { big: "The front has collapsed", small: "The city of Veyra is burning.", fx: "boom" },
    { big: "You are Corporal Wren", small: "22 years old. Eight months in uniform." },
    { big: "The last ship leaves at dawn", small: "Saltmarsh Harbor. 40 kilometers away." },
    { big: "Four choices", small: "Doing the right thing will not always keep you alive." }
  ],

  // Positions on the tactical map (virtual 1000 x 600 stage)
  places: {
    veyra: { x: 110, y: 290, name: "VEYRA" },
    bridge: { x: 262, y: 300, name: "KESSEL BRIDGE" },
    prisoner: { x: 405, y: 205, name: "HOLLOWAY FARM" },
    cellar: { x: 410, y: 395, name: "OSTRAVA" },
    captured: { x: 590, y: 165, name: "ENEMY CAMP" },
    checkpoint: { x: 645, y: 345, name: "CHECKPOINT B-7" },
    signal: { x: 822, y: 150, name: "CAPE LORN" },
    boat: { x: 846, y: 332, name: "SALTMARSH" }
  },

  nodes: {
    /* ───────────────────────── I ───────────────────────── */
    bridge: {
      chapter: 1,
      title: "The Bridge",
      place: "Kessel River crossing",
      time: "21:47",
      km: 40,
      scene: "bridge",
      beats: [
        "The Kessel bridge. The only crossing for twenty kilometers.",
        "It’s wired with explosives. The detonator is in your hands.",
        "Across the river, an enemy tank column. Two minutes out.",
        "If they cross, thousands of people on the harbor road are trapped.",
        "But forty refugees are still on the bridge.",
        { who: "Lt. Harrow · radio", text: "Wren. Blow it. That’s an order. Now." }
      ],
      prompt: "Blow the bridge?",
      promptSub: "Forty refugees on it. Thousands behind you.",
      choices: [
        {
          key: "A",
          label: "Detonate",
          sub: "Obey. Stop the tanks.",
          icon: "detonator",
          tags: { obey: true, ends: true },
          beats: [
            { text: "Your thumb comes down.", fx: "explosion", variant: "blown" },
            "The middle span falls into the river. Everyone on it goes with it.",
            "The tanks stop. The harbor road is safe. Thousands will reach the ships tonight.",
            { who: "Lt. Harrow", text: "You did your job, Wren." }
          ],
          next: "prisoner"
        },
        {
          key: "B",
          label: "Wait",
          sub: "Defy the order. Let them cross.",
          icon: "hourglass",
          tags: { obey: false, ends: false },
          beats: [
            { text: "You switch off the radio. Ninety seconds.", variant: "crossing" },
            "The last family reaches your side. The lead tank rolls onto the bridge.",
            { text: "You press the button.", fx: "explosion", variant: "blowntank" },
            { text: "The tanks behind it open fire. Harrow is gone. Your company scatters.", fx: "shots" },
            "You’re alone now, with twelve of the refugees you saved."
          ],
          next: "cellar"
        }
      ],
      debrief: {
        concept: "Superior orders & double effect",
        context: "Real history: Seoul’s Hangang Bridge was blown up with refugees on it in 1950.",
        lenses: {
          util: { verdict: "A", text: "Forty lives against thousands. Blow it." },
          kant: { verdict: "B", text: "You may not knowingly kill innocents, and an order doesn’t make it Harrow’s act." },
          virtue: { verdict: "split", text: "Courage or recklessness? It depends on what a wise person would see." }
        },
        question: "If you only pressed it because you were ordered to, who killed them?"
      }
    },

    /* ───────────────────────── II (after obeying) ───────────────────────── */
    prisoner: {
      chapter: 2,
      title: "The Prisoner",
      place: "Holloway farm",
      time: "00:12",
      km: 31,
      scene: "farmhouse",
      beats: [
        "Midnight. An abandoned farmhouse. Rain.",
        "Your squad caught an enemy scout. Lev Arkin. Nineteen years old.",
        "He knows which roads to the coast are mined.",
        "Without that, your company goes through the Tannen forest, where the patrols are.",
        { who: "Lt. Harrow", text: "Get the safe road out of him. Whatever it takes." },
        "He hands you a pair of pliers. Lev is crying."
      ],
      prompt: "Torture him?",
      promptSub: "His pain, or your company’s lives.",
      choices: [
        {
          key: "A",
          label: "Make him talk",
          sub: "Whatever it takes.",
          icon: "pliers",
          tags: { obey: true, ends: true },
          beats: [
            { text: "You don’t remember how long it took. You remember the sound.", variant: "dark" },
            "By two in the morning, Lev draws the safe road with shaking hands.",
            "He told the truth. Not one mine. Every soldier in your company lives."
          ],
          next: "checkpoint"
        },
        {
          key: "B",
          label: "Refuse",
          sub: "He’s a prisoner of war.",
          icon: "shield",
          tags: { obey: false, ends: false },
          beats: [
            "You put the pliers down. You give Lev your water.",
            "Without the safe road, the company takes the forest.",
            { text: "Three in the morning. Muzzle flashes in the trees. Harrow falls first.", scene: "forest", fx: "shots" },
            "A rifle butt knocks you flat. You’ve been captured."
          ],
          next: "captured"
        }
      ],
      debrief: {
        concept: "The ticking-bomb problem",
        context: "Torture is banned by the Geneva Conventions, even under orders.",
        lenses: {
          util: { verdict: "A", text: "If it saves forty lives, one person’s pain is worth it." },
          kant: { verdict: "B", text: "Torture uses a person purely as a tool. Never allowed." },
          virtue: { verdict: "B", text: "Cruelty corrodes the person who does it." }
        },
        question: "You didn’t know it would work. Should a choice be judged by what you knew, or how it turned out?"
      }
    },

    /* ───────────────────────── II (after defying) ───────────────────────── */
    cellar: {
      chapter: 2,
      title: "The Cellar",
      place: "St. Ada’s school, Ostrava",
      time: "00:40",
      km: 33,
      scene: "cellar",
      beats: [
        "A school cellar. Twelve refugees, and you.",
        "Above you, boots on broken glass. An enemy patrol. They aren’t taking prisoners tonight.",
        "Tomas is wounded and delirious. He’s moaning. Louder. Louder.",
        "A woman presses her scarf into your hand. You know what she means.",
        "Or you could run out the back and draw the patrol away. They might chase you. They might tear the block apart."
      ],
      prompt: "Silence Tomas?",
      promptSub: "One certain death, or a gamble with thirteen lives.",
      choices: [
        {
          key: "A",
          label: "Silence him",
          sub: "Save the twelve.",
          icon: "mute",
          tags: { obey: null, ends: true },
          beats: [
            "You hold the scarf over his mouth. He barely struggles.",
            { text: "The boots stop. Someone laughs. The footsteps move on.", variant: "passed" },
            "Twelve people climb out at dawn. Tomas doesn’t."
          ],
          next: "checkpoint"
        },
        {
          key: "B",
          label: "Draw them away",
          sub: "Risk yourself instead.",
          icon: "run",
          tags: { obey: null, ends: false },
          beats: [
            { text: "You kick over barrels in the street. Every flashlight swings toward you.", fx: "shots", variant: "passed" },
            "You almost reach the trees.",
            "The patrol never checks the school. Everyone in the cellar lives.",
            "You’re marched to an enemy camp."
          ],
          next: "captured"
        }
      ],
      debrief: {
        concept: "The trolley problem, up close",
        context: "Based on the trolley problem by philosophers Philippa Foot and Judith Jarvis Thomson.",
        lenses: {
          util: { verdict: "A", text: "One certain death beats risking thirteen." },
          kant: { verdict: "B", text: "You may risk your own life. You may not take his." },
          virtue: { verdict: "B", text: "Self-sacrifice is courage, as long as it isn’t reckless." }
        },
        question: "Why does it feel worse with your own hands than by pulling a lever?"
      }
    },

    /* ───────────────────────── III ───────────────────────── */
    checkpoint: {
      chapter: 3,
      title: "The Checkpoint",
      place: "Checkpoint Bravo-7",
      time: "03:18",
      km: 9,
      scene: "checkpoint",
      beats: [
        "The last checkpoint before the harbor.",
        "Enemy car bombs have been hitting checkpoints. Orders: any car that doesn’t stop, you shoot.",
        "Headlights. A car, coming fast. You fire a warning shot. It doesn’t slow down.",
        "In the back seat: a child? Or a bag?",
        { who: "Major Voss", text: "Fire! Fire, Wren!" }
      ],
      prompt: "Open fire?",
      promptSub: "Thirty meters. Maybe a bomb. Maybe a family.",
      choices: [
        {
          key: "B",
          label: "Hold fire",
          sub: "Defy the order.",
          icon: "hand",
          tags: { obey: false, ends: false },
          beats: [
            { text: "The car skids into the sandbags.", variant: "stopped" },
            "The brakes had failed. A father and his little boy. No bomb.",
            { who: "Major Voss", text: "You got lucky. Next time it’s a bomb, and we all die." },
            { text: "You’re arrested. Then the shelling starts. You run for the cliffs.", fx: "boom" }
          ],
          next: "signal"
        },
        {
          key: "A",
          label: "Fire",
          sub: "Obey. Protect the checkpoint.",
          icon: "crosshair",
          tags: { obey: true, ends: true },
          beats: [
            { text: "Everyone on the line fires.", fx: "shots", variant: "stopped" },
            "No bomb. A father whose brakes had failed, and his seven-year-old son.",
            { who: "Major Voss", text: "Engagement per standing orders. Not your fault." },
            "At dawn, a truck takes you down to the harbor."
          ],
          next: "boat"
        }
      ],
      debrief: {
        concept: "Moral luck",
        context: "At Nuremberg (1945–46), “I was following orders” was rejected as a defense.",
        lenses: {
          util: { verdict: "A", text: "A real chance of a bomb justifies firing." },
          kant: { verdict: "split", text: "Kant judges your intention, not the outcome. Kantians disagree about this rule." },
          virtue: { verdict: "B", text: "A good soldier sees clearly, like Stanislav Petrov, who refused to report a false nuclear alarm in 1983." }
        },
        question: "If it had been a bomb, would holding fire have been wrong?"
      }
    },

    captured: {
      chapter: 3,
      title: "The Colonel’s Offer",
      place: "Enemy field camp",
      time: "03:55",
      km: 14,
      scene: "camp",
      beats: [
        "Ten prisoners kneel in the mud. You’re one of them.",
        "A sniper killed one of the colonel’s men. His orders: shoot ten prisoners in revenge.",
        { who: "Colonel Anselm", text: "Shoot one of them, and I let the other nine go. Including you." },
        { who: "Colonel Anselm", text: "Refuse, and my men shoot all ten." },
        { who: "Old fisherman", text: "Pick me. Please. I’m old." }
      ],
      prompt: "Take the pistol?",
      promptSub: "Kill one innocent person to save nine.",
      choices: [
        {
          key: "A",
          label: "Take the pistol",
          sub: "One dies. Nine live.",
          icon: "pistol",
          tags: { obey: null, ends: true },
          beats: [
            "Your hands shake so hard you need both of them.",
            { text: "The fisherman closes his eyes.", fx: "shot", variant: "shot" },
            "The colonel keeps his word. Nine walk free at dawn.",
            { who: "Colonel Anselm", text: "You see? War makes all of us into something." }
          ],
          next: "signal"
        },
        {
          key: "B",
          label: "Refuse",
          sub: "You won’t be his executioner.",
          icon: "cross",
          tags: { obey: null, ends: false },
          beats: [
            { who: "Colonel Anselm", text: "Then you have chosen for all of them." },
            "The rifles rise. The old fisherman takes your hand.",
            { text: "You never became a murderer. Ten died instead of one.", fx: "volley" }
          ],
          ending: "clean_hands"
        }
      ],
      debrief: {
        concept: "Integrity: “Jim and the Indians”",
        context: "Adapted from a 1973 thought experiment by philosopher Bernard Williams.",
        lenses: {
          util: { verdict: "A", text: "One death is better than ten." },
          kant: { verdict: "B", text: "If you shoot, the murder is yours. If you refuse, it’s his." },
          virtue: { verdict: "split", text: "Honoring the old man’s sacrifice, or becoming the colonel’s tool?" }
        },
        question: "If the colonel kills ten because you refused, did you cause it?"
      }
    },

    /* ───────────────────────── IV ───────────────────────── */
    boat: {
      chapter: 4,
      title: "The Last Boat",
      place: "Saltmarsh Harbor, pier 4",
      time: "05:40",
      km: 0,
      scene: "harbor",
      beats: [
        "The last ship, the Aurora. Shells are hitting the outer docks.",
        "Your orders: guard the gangplank. Soldiers only. The ship is full.",
        "A mother pushes through the crowd with a little girl. Her name tag says MIRA.",
        { who: "Mira’s mother", text: "Please. Just her. She’s small." },
        "If one more person gets on, someone has to get off. The only one not counted yet is you."
      ],
      prompt: "Give up your place?",
      promptSub: "Hold the line and live, or trade your seat for hers.",
      choices: [
        {
          key: "A",
          label: "Hold the line",
          sub: "Obey. Board last. Live.",
          icon: "ship",
          tags: { obey: true, ends: true },
          beats: [
            "“I’m sorry.”",
            { text: "You’re the last one aboard. Mira and her mother disappear into the smoke.", variant: "departing" },
            "You live. You’ll think about her every day."
          ],
          ending: "last_aboard"
        },
        {
          key: "B",
          label: "Give her your place",
          sub: "She goes. You stay.",
          icon: "child",
          tags: { obey: false, ends: false },
          beats: [
            "You lift Mira onto the deck and step back onto the dock.",
            { text: "The Aurora pulls away. A little girl waves from the rail.", variant: "departing" },
            { text: "Twenty minutes later, the shells reach the inner docks.", fx: "barrage" }
          ],
          ending: "miras_place"
        }
      ],
      debrief: {
        concept: "Duty vs. going beyond duty",
        context: "Evacuations like Dunkirk (1940) and Saigon (1975) forced the same choice.",
        lenses: {
          util: { verdict: "A", text: "A trained soldier may save many lives in the war to come." },
          kant: { verdict: "A", text: "Your oath holds. Giving up your life is allowed, but not required." },
          virtue: { verdict: "B", text: "Compassion and courage point toward giving her your place." }
        },
        question: "Can morality demand your life, or only ask for it?"
      }
    },

    signal: {
      chapter: 4,
      title: "The Signal",
      place: "Cape Lorn lighthouse",
      time: "05:22",
      km: 2,
      scene: "lighthouse",
      beats: [
        "An empty lighthouse. A working radio.",
        "Below you, thousands of people are boarding the last ships.",
        "On the hill, the enemy guns are shelling them, hidden inside a village.",
        { who: "Allied Command · radio", text: "Any station. Give us coordinates and we’ll hit those guns." },
        "The moment you transmit, they’ll trace your signal to this lighthouse."
      ],
      prompt: "Call in the strike?",
      promptSub: "Save the evacuation. Destroy the village, and probably yourself.",
      choices: [
        {
          key: "A",
          label: "Call it in",
          sub: "Save thousands.",
          icon: "radio",
          tags: { obey: true, ends: true },
          beats: [
            "You read the coordinates twice, the way you were trained.",
            { text: "The hill turns white. The guns go silent. The ships sail.", fx: "barrage", variant: "strike" },
            { text: "Then you hear the shell coming for the lighthouse.", fx: "incoming" }
          ],
          ending: "coordinates"
        },
        {
          key: "B",
          label: "Stay silent",
          sub: "Spare the village. Live.",
          icon: "radiooff",
          tags: { obey: false, ends: false },
          beats: [
            { text: "You switch off the radio and climb down to a fishing boat.", scene: "survive" },
            "By sunrise you’re out of range.",
            "Weeks later you learn that two evacuation ships never left the harbor."
          ],
          ending: "silent_radio"
        }
      ],
      debrief: {
        concept: "Proportionality & human shields",
        context: "The laws of war allow strikes on military targets if civilian harm is proportionate.",
        lenses: {
          util: { verdict: "A", text: "Thousands of evacuees against one village." },
          kant: { verdict: "A", text: "The guns are the target. The deaths are foreseen, not intended (double effect)." },
          virtue: { verdict: "A", text: "Courage means facing death for something worth it." }
        },
        question: "The enemy hid its guns among civilians. If they die, who is responsible?"
      }
    }
  },

  endings: {
    clean_hands: { title: "Clean Hands", survived: false, epitaph: "You refused to kill. Ten died instead of one." },
    last_aboard: { title: "The Last Aboard", survived: true, epitaph: "You followed your orders, and you lived." },
    miras_place: { title: "Mira’s Place", survived: false, epitaph: "A six-year-old girl lived because you didn’t." },
    coordinates: { title: "The Coordinates", survived: false, epitaph: "Thousands escaped. The village and the lighthouse did not." },
    silent_radio: { title: "The Silent Radio", survived: true, epitaph: "You spared a village and saved yourself. Two ships didn’t make it." }
  },

  // The ethical profile at the end: which school of thought your choices sit closest to
  frameworks: {
    util: { name: "Utilitarianism", short: "Utilitarian", who: "Bentham · Mill", idea: "Do what brings the best results for the most people." },
    kant: { name: "Kantian ethics", short: "Kantian", who: "Immanuel Kant", idea: "Some acts are wrong, whatever the results. Never use people as tools." },
    virtue: { name: "Virtue ethics", short: "Virtue", who: "Aristotle", idea: "Do what a good person would do, and ask what each choice makes you." }
  },
  profiles: {
    util: { label: "a Utilitarian", text: "You judged choices by their results. When harm bought a better outcome, you paid the price." },
    kant: { label: "a Kantian", text: "Some lines you would not cross, whatever the orders or the numbers." },
    virtue: { label: "a Virtue Ethicist", text: "You chose with compassion and courage, and asked what each choice would make you." },
    plural: { label: "a Pluralist", text: "Your choices don’t fit one theory. Many philosophers think that’s the honest position." }
  },

  /* The Designer's Notes page. This is where the assignment's
     "explain your own reasoning and conclusions" lives.
     EDIT THE "MY REASONING AND CONCLUSIONS" SECTION IN YOUR OWN WORDS. */
  notes: `
    <p class="lede">Last Orders is a choose-your-own-adventure game about two old questions that a third world war would make urgent again: <strong>When should a soldier refuse an order?</strong> and <strong>Can a good outcome justify a terrible act?</strong></p>

    <h2>The ethical issue</h2>
    <p>Every army depends on obedience. A soldier who second-guesses every order puts comrades at risk, and a chain of command exists so that no single frightened person has to carry every decision. But history is full of atrocities carried out by people who were only following orders, and full of disasters prevented by people who refused.</p>
    <p>The second question sits underneath the first. Most orders in war ask a soldier to cause harm for the sake of a larger good: stop the tanks, get the information, protect the checkpoint. The trolley problem asks whether it is right to kill one person to save five. War asks it every night, with real people on the tracks.</p>

    <h2>Context: this has really happened</h2>
    <ul>
      <li><strong>Nuremberg, 1945–46.</strong> After World War II, the Allied tribunal rejected “superior orders” as a defense. Nuremberg Principle IV states that following orders does not relieve a person of responsibility “provided a moral choice was in fact possible to him.”</li>
      <li><strong>The Milgram experiment, 1961–63.</strong> Stanley Milgram found that about 65% of ordinary volunteers would give what they believed was a dangerous 450-volt shock to a stranger because a man in a lab coat told them to. Obedience is much stronger than most of us assume.</li>
      <li><strong>My Lai, 1968.</strong> US Army helicopter pilot Hugh Thompson Jr. landed between American soldiers and Vietnamese villagers during a massacre and ordered his crew to protect the civilians. He was treated as a traitor for years and later awarded the Soldier’s Medal.</li>
      <li><strong>Near misses of World War III.</strong> In 1962, Soviet officer Vasili Arkhipov refused to approve launching a nuclear torpedo during the Cuban Missile Crisis. In 1983, Stanislav Petrov ignored a computer warning of an American missile attack, correctly guessing it was a false alarm. Both men went against procedure, and both may have prevented a nuclear war.</li>
    </ul>

    <h2>Three ethical perspectives</h2>
    <dl class="frameworks">
      <div>
        <dt>Utilitarianism</dt>
        <dd><em>Jeremy Bentham, John Stuart Mill.</em> The right act is the one that produces the best overall consequences, usually the most well-being for the most people. Orders matter only if obeying them leads to better results. Any act, even a terrible one, can be justified if the outcome is good enough.</dd>
      </div>
      <div>
        <dt>Deontology</dt>
        <dd><em>Immanuel Kant.</em> Some acts are right or wrong in themselves, whatever the consequences. Kant’s Categorical Imperative says to act only on rules you could will everyone to follow, and to treat people always as ends in themselves, never merely as means. Duty here means the moral law, not obedience to a commander.</dd>
      </div>
      <div>
        <dt>Virtue ethics</dt>
        <dd><em>Aristotle.</em> Instead of asking “What rule applies?” or “What outcome is best?”, ask “What would a good person do, and what kind of person does this choice make me?” Virtues like courage, compassion, and loyalty are found in the balance between extremes, and practical wisdom (<em>phronesis</em>) is the skill of seeing what a situation really calls for.</dd>
      </div>
    </dl>

    <h2>Questions the game asks</h2>
    <ol>
      <li>Does following an order move moral responsibility to the person who gave it?</li>
      <li>Is there a moral difference between killing someone as a side effect and killing them as a means to an end?</li>
      <li>Should a choice be judged by the chooser’s intentions, by the information they had, or by how it actually turned out?</li>
      <li>Are there acts that are wrong no matter how many lives they would save?</li>
      <li>If someone else will commit a great evil unless you commit a smaller one, whose fault is the outcome?</li>
      <li>Can morality require you to give up your life, or is self-sacrifice always beyond duty?</li>
    </ol>

    <h2>Why being good doesn’t keep you alive</h2>
    <p>I deliberately disconnected survival from morality. In this game, defying an unjust order can get you killed, and doing something terrible can get you home. Philosophers Bernard Williams and Thomas Nagel called this <strong>moral luck</strong>: the outcome of a choice often depends on things outside our control, yet we judge people by outcomes anyway. If the game rewarded every good choice with survival, it would teach the comforting lie that morality always pays. The dilemmas only work if doing right might cost you everything.</p>

    <h2>My reasoning and conclusions</h2>
    <p>After writing every branch of this game, I don’t think “always obey” or “always follow your conscience” holds up against these dilemmas. Here is where I landed.</p>
    <p><strong>Orders never remove responsibility.</strong> I agree with the Nuremberg principle: if a moral choice is possible, the person who pulls the trigger owns what happens. At the checkpoint, Voss’s order explains why you fired, but it doesn’t make the family’s suffering someone else’s act. Orders still matter, though. A soldier who ignores orders on a hunch puts others at risk. At the bridge, waiting for the refugees cost the lieutenant his life. I think obedience is a real duty, but a limited one, and it ends where an order asks you to deliberately harm innocent people.</p>
    <p><strong>Ends can justify some means, but not all of them.</strong> I’m persuaded by the idea behind the doctrine of double effect. Blowing a bridge or striking enemy guns, where innocent deaths are a foreseen side effect of stopping a military threat, is different from torturing a prisoner or smothering Tomas, where hurting a person is the tool you use. The first kind can be defended if the good is large enough. The second treats a human being as a thing, and I agree with Kant that numbers can’t erase that line. The colonel’s offer is the hardest case for me. When the old man volunteers and everyone will die anyway, I think taking the pistol respects his choice rather than using him. That is where I part ways with a strict Kantian.</p>
    <p><strong>Virtue ethics explains what the other two miss:</strong> what these choices do to the person who makes them. The player who holds the gangplank survives, but has to become someone who could do that and live with it.</p>
    <p><strong>My conclusion.</strong> We should judge choices by the reasons and information a person had at the time, not by how luck turned out. We should hold ourselves responsible for what we do with our own hands, even under orders. And being good is not a strategy for staying alive. If morality only counted when it paid off, it would just be self-interest.</p>
  `
};
