/*
  LAST ORDERS — story content
  ------------------------------------------------------------
  All of the game's writing lives in this file, so you can edit
  the story, the philosophy, and the Designer's Notes without
  touching the game engine.

  Each dilemma ("node") has:
    beats     short subtitle lines shown one at a time.
              A beat is a string, or { who, text, fx, variant, scene }.
    theme     which of the project's two questions it tests
    prompt    the big question shown when it's time to decide
    dilemma   the ethical question underneath it, in plain words
    choices   two options. sub says what you do; pro and con say what
              you gain and what it costs, as far as you know at the time.
              Each option has its own consequence beats.
              tags.obey  true = followed an order, false = defied one, null = no order
              tags.ends  true = did harm for a better outcome, false = refused to
              next       the next dilemma, or ending = which ending
    debrief   how three ethical frameworks judge the choice.
              verdict is the key ("A"/"B") that framework leans toward, or "split".
              says is the short reason shown in-game; text is the fuller one.
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
      theme: "Orders vs. conscience",
      beats: [
        "The Kessel bridge. The only way across the river for twenty kilometers.",
        "Your unit has wired it with explosives. You’re holding the detonator.",
        "Enemy tanks are coming. If they cross, thousands of people fleeing to the harbor will be trapped.",
        "But forty refugees are still on the bridge. They need about three more minutes to get across.",
        { who: "Lt. Harrow · radio", text: "Wren, blow the bridge. That’s an order. Now." }
      ],
      prompt: "Blow the bridge?",
      dilemma: "Should you obey an order that kills innocent people?",
      choices: [
        {
          key: "A",
          label: "Detonate",
          sub: "Follow Harrow’s order.",
          pro: "The tanks are stopped. Thousands escape.",
          con: "The 40 refugees on the bridge die.",
          icon: "detonator",
          tags: { obey: true, ends: true },
          beats: [
            { text: "Your thumb comes down.", fx: "explosion", variant: "blown" },
            "The middle of the bridge falls into the river. Everyone on it goes with it.",
            "The tanks stop. The harbor road is safe. Thousands will reach the ships tonight.",
            { who: "Lt. Harrow", text: "You did your job, Wren." }
          ],
          next: "prisoner"
        },
        {
          key: "B",
          label: "Wait",
          sub: "Disobey. Give them three minutes.",
          pro: "The 40 refugees get across alive.",
          con: "The tanks might cross too. Your unit is exposed.",
          icon: "hourglass",
          tags: { obey: false, ends: false },
          beats: [
            { text: "You switch off the radio and wait.", variant: "crossing" },
            "The last family reaches your side. Then the first tank rolls onto the bridge.",
            { text: "You press the button. The tank goes down with the bridge.", fx: "explosion", variant: "blowntank" },
            { text: "The other tanks open fire. Harrow is killed. Your unit scatters.", fx: "shots" },
            "You’re alone now, with twelve of the refugees you saved."
          ],
          next: "cellar"
        }
      ],
      debrief: {
        concept: "Obeying orders & side effects",
        context: "Real history: in 1950, Seoul’s Hangang Bridge was blown up while refugees were crossing it.",
        lenses: {
          util: { verdict: "A", says: "40 deaths to save thousands is worth it.", text: "Utilitarians judge by results. Forty deaths to save thousands is the better outcome, so blow the bridge." },
          kant: { verdict: "B", says: "Killing innocents is wrong, even under orders.", text: "Kant says killing innocent people is wrong no matter the result. Being ordered to doesn’t make it someone else’s choice." },
          virtue: { verdict: "split", says: "Brave duty, or cold obedience? It depends.", text: "Aristotle would ask what a brave and wise person would do. Is pressing the button courage or cold obedience? Thinkers disagree." }
        },
        question: "If you only pressed the button because you were ordered to, who is responsible for the deaths: you, Harrow, or the enemy?"
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
      theme: "Ends vs. means",
      beats: [
        "Midnight. Your unit hides in an abandoned farmhouse.",
        "You’ve captured an enemy scout. His name is Lev Arkin. He’s nineteen.",
        "He knows which roads to the coast are free of mines.",
        "Without that, your unit has to go through the Tannen forest, which is full of enemy patrols.",
        { who: "Lt. Harrow", text: "Make him tell you the safe road. Whatever it takes." },
        "Harrow hands you a pair of pliers. Lev starts to cry."
      ],
      prompt: "Torture him?",
      dilemma: "Is torture ever acceptable if it could save lives?",
      choices: [
        {
          key: "A",
          label: "Make him talk",
          sub: "Torture him, as ordered.",
          pro: "You might learn the safe road for your unit.",
          con: "You torture a terrified prisoner. He might lie.",
          icon: "pliers",
          tags: { obey: true, ends: true },
          beats: [
            { text: "You don’t remember how long it took. You remember the sound.", variant: "dark" },
            "By two in the morning, Lev draws the safe road on your map with shaking hands.",
            "He told the truth. Not a single mine. Everyone in your unit survives the night."
          ],
          next: "checkpoint"
        },
        {
          key: "B",
          label: "Refuse",
          sub: "Disobey. Treat him humanely.",
          pro: "You don’t torture anyone.",
          con: "Your unit must risk the forest.",
          icon: "shield",
          tags: { obey: false, ends: false },
          beats: [
            "You put the pliers down and give Lev some water.",
            "Without the safe road, your unit goes through the forest.",
            { text: "Three in the morning. Gunfire from the trees. Harrow is the first to fall.", scene: "forest", fx: "shots" },
            "Someone knocks you to the ground. You’ve been captured."
          ],
          next: "captured"
        }
      ],
      debrief: {
        concept: "The ticking-bomb problem",
        context: "Torture is banned by the Geneva Conventions, even in war and even under orders.",
        lenses: {
          util: { verdict: "A", says: "If it saves forty soldiers, the pain is worth it.", text: "If torturing one person saves forty soldiers, the result is worth it. (Many utilitarians still worry that torture produces false information.)" },
          kant: { verdict: "B", says: "Torture uses a person as a tool. Never OK.", text: "Torturing someone uses them purely as a tool to get what you want. Kant says that is always wrong, whatever it achieves." },
          virtue: { verdict: "B", says: "Cruelty damages the person who does it.", text: "A good person is merciful. Torture turns you into someone cruel, even if it works." }
        },
        question: "You didn’t know the torture would work. Should a choice be judged by what you knew at the time, or by how it turned out?"
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
      theme: "Ends vs. means",
      beats: [
        "You and the twelve refugees hide in the basement of a bombed school.",
        "Above you, an enemy patrol is searching the building. If they find you, they’ll kill everyone.",
        "Tomas, one of the refugees, is wounded and feverish. He’s moaning, louder and louder. The patrol will hear.",
        "A woman hands you her scarf. She means: keep him quiet, even if it kills him.",
        "Your other option: run out the back and make noise, so the patrol chases you instead."
      ],
      prompt: "Silence Tomas?",
      dilemma: "Is it right to kill one innocent person to save many?",
      choices: [
        {
          key: "A",
          label: "Silence him",
          sub: "Hold the scarf over his mouth.",
          pro: "The patrol won’t hear. Twelve people live.",
          con: "Tomas will probably die, by your hands.",
          icon: "mute",
          tags: { obey: null, ends: true },
          beats: [
            "You hold the scarf over his mouth. He barely struggles.",
            { text: "The footsteps stop. Someone laughs. Then the patrol moves on.", variant: "passed" },
            "Twelve people climb out at dawn. Tomas doesn’t."
          ],
          next: "checkpoint"
        },
        {
          key: "B",
          label: "Draw them away",
          sub: "Run out and make noise.",
          pro: "You don’t kill anyone.",
          con: "You’ll likely be caught. If the trick fails, all 13 die.",
          icon: "run",
          tags: { obey: null, ends: false },
          beats: [
            { text: "You kick over barrels in the street. Every flashlight turns toward you.", fx: "shots", variant: "passed" },
            "You almost reach the trees.",
            "The patrol never checks the school. Everyone in the basement lives.",
            "You’re taken to an enemy camp."
          ],
          next: "captured"
        }
      ],
      debrief: {
        concept: "The trolley problem, up close",
        context: "Based on the trolley problem by philosophers Philippa Foot and Judith Jarvis Thomson.",
        lenses: {
          util: { verdict: "A", says: "One death is better than risking thirteen.", text: "Silencing Tomas means one likely death instead of risking thirteen. The numbers favor it." },
          kant: { verdict: "B", says: "You may risk your life, not take his.", text: "Killing an innocent person with your own hands is wrong. You may risk your own life, but you may not take his." },
          virtue: { verdict: "B", says: "Protecting everyone yourself is the brave choice.", text: "Drawing the patrol away takes courage and protects everyone, Tomas included. A good person would try it." }
        },
        question: "Why does it feel worse to do it with your own hands than by pulling a lever?"
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
      theme: "Orders vs. conscience",
      beats: [
        "The last checkpoint before the harbor. Major Voss is in charge.",
        "Enemies have been driving car bombs into checkpoints. The order: if a car won’t stop, shoot.",
        "A car is speeding toward you. You fire a warning shot. It doesn’t stop.",
        "You can see a shape in the back seat. Maybe a child. Maybe a bomb.",
        { who: "Major Voss", text: "Fire! Fire, Wren!" }
      ],
      prompt: "Open fire?",
      dilemma: "Should you follow an order when you can’t be sure it’s right?",
      choices: [
        {
          key: "B",
          label: "Hold fire",
          sub: "Disobey. Don’t shoot.",
          pro: "If it’s a family, they live.",
          con: "If it’s a bomb, everyone here dies.",
          icon: "hand",
          tags: { obey: false, ends: false },
          beats: [
            { text: "The car skids into the sandbags and stops.", variant: "stopped" },
            "Its brakes had failed. Inside: a father and his little boy. No bomb.",
            { who: "Major Voss", text: "You got lucky. Next time it’s a bomb, and we all die." },
            { text: "You’re arrested. Then the shelling starts, and you escape toward the cliffs.", fx: "boom" }
          ],
          next: "signal"
        },
        {
          key: "A",
          label: "Fire",
          sub: "Follow the order.",
          pro: "If it’s a bomb, you save the checkpoint.",
          con: "If it’s a family, you kill them.",
          icon: "crosshair",
          tags: { obey: true, ends: true },
          beats: [
            { text: "Everyone on the line fires.", fx: "shots", variant: "stopped" },
            "There was no bomb. The brakes had failed. Inside: a father and his seven-year-old son.",
            { who: "Major Voss", text: "You followed orders. It’s not your fault." },
            "At dawn, a truck takes you down to the harbor."
          ],
          next: "boat"
        }
      ],
      debrief: {
        concept: "Moral luck",
        context: "At the Nuremberg trials (1945–46), “I was just following orders” was rejected as a defense.",
        lenses: {
          util: { verdict: "A", says: "A real bomb risk justifies firing.", text: "There was a real chance of a bomb. Firing protected the most people, based on what you knew." },
          kant: { verdict: "split", says: "Your intention matters, not how it turned out.", text: "Kant judges your intention, not the result. Kantians disagree about whether “shoot any car that won’t stop” is a fair rule." },
          virtue: { verdict: "B", says: "A good soldier thinks, not just obeys.", text: "A good soldier uses judgment, not just orders. In 1983, Soviet officer Stanislav Petrov trusted his judgment and ignored a false nuclear alarm." }
        },
        question: "If the car had held a bomb, would holding fire have been the wrong choice?"
      }
    },

    captured: {
      chapter: 3,
      title: "The Colonel’s Offer",
      place: "Enemy field camp",
      time: "03:55",
      km: 14,
      scene: "camp",
      theme: "Ends vs. means",
      beats: [
        "You’ve been captured. You kneel in the mud with nine other prisoners.",
        "The enemy colonel plans to shoot all ten of you, as revenge for one of his soldiers.",
        { who: "Colonel Anselm", text: "I’ll make you an offer. Shoot one prisoner yourself, and I let the other nine go." },
        { who: "Colonel Anselm", text: "Refuse, and my men shoot all ten. You included." },
        { who: "Old fisherman", text: "Pick me. Please. I’m old." }
      ],
      prompt: "Take the pistol?",
      dilemma: "Would you kill one person to stop someone else from killing ten?",
      choices: [
        {
          key: "A",
          label: "Take the pistol",
          sub: "Shoot the old fisherman.",
          pro: "Nine people live, including you.",
          con: "You kill an innocent man.",
          icon: "pistol",
          tags: { obey: null, ends: true },
          beats: [
            "Your hands shake so badly you need both of them.",
            { text: "The fisherman closes his eyes.", fx: "shot", variant: "shot" },
            "The colonel keeps his word. At dawn, nine prisoners walk free.",
            { who: "Colonel Anselm", text: "You see? War turns all of us into something." }
          ],
          next: "signal"
        },
        {
          key: "B",
          label: "Refuse",
          sub: "Don’t become his executioner.",
          pro: "You never kill anyone.",
          con: "All ten are shot, including you.",
          icon: "cross",
          tags: { obey: null, ends: false },
          beats: [
            { who: "Colonel Anselm", text: "Then you have chosen for all of them." },
            "The rifles rise. The old fisherman takes your hand.",
            { text: "You never became a murderer. Ten people died instead of one.", fx: "volley" }
          ],
          ending: "clean_hands"
        }
      ],
      debrief: {
        concept: "Integrity: “Jim and the Indians”",
        context: "Adapted from a 1973 thought experiment by philosopher Bernard Williams.",
        lenses: {
          util: { verdict: "A", says: "One death is better than ten.", text: "One death is better than ten. Refusing just to keep your own hands clean costs nine extra lives." },
          kant: { verdict: "B", says: "If you shoot, the murder is yours.", text: "If you shoot, you are the murderer. If you refuse, the colonel is responsible for what he chooses to do." },
          virtue: { verdict: "split", says: "Honor his sacrifice, or refuse to be used?", text: "The old man volunteered. Is shooting him mercy, or letting the colonel turn you into his weapon? Thinkers disagree." }
        },
        question: "If the colonel kills ten people because you refused, is that your fault?"
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
      theme: "Orders vs. conscience",
      beats: [
        "Saltmarsh Harbor. The last ship out, the Aurora, is almost full. Shells are landing nearby.",
        "Your order: guard the boarding ramp. Only soldiers may get on now.",
        "A mother pushes through the crowd with her six-year-old daughter, Mira.",
        { who: "Mira’s mother", text: "Please. Just take her. She’s small." },
        "There’s room for exactly one more person: you. If Mira takes your place, you stay behind."
      ],
      prompt: "Give up your place?",
      dilemma: "Do you owe a stranger your life?",
      choices: [
        {
          key: "A",
          label: "Hold the line",
          sub: "Obey. Board the ship yourself.",
          pro: "You escape and live.",
          con: "Mira is left behind.",
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
          sub: "Disobey. Put Mira on the ship.",
          pro: "Mira escapes.",
          con: "You’re left behind under the shelling.",
          icon: "child",
          tags: { obey: false, ends: false },
          beats: [
            "You lift Mira onto the deck and step back onto the dock.",
            { text: "The Aurora pulls away. A little girl waves from the rail.", variant: "departing" },
            { text: "Twenty minutes later, the shells reach the dock.", fx: "barrage" }
          ],
          ending: "miras_place"
        }
      ],
      debrief: {
        concept: "Duty vs. going beyond duty",
        context: "Evacuations like Dunkirk (1940) and Saigon (1975) forced the same choice about who gets a place.",
        lenses: {
          util: { verdict: "A", says: "A soldier can save many more lives later.", text: "A trained soldier can save many more lives in the war to come. Holding the line gives the best overall outcome." },
          kant: { verdict: "A", says: "Your duty is your post. Sacrifice is optional.", text: "Your duty is to your post. Giving up your life for a stranger is allowed, but not required." },
          virtue: { verdict: "B", says: "Compassion and courage say: give her your place.", text: "Compassion and courage both point toward giving Mira your place." }
        },
        question: "Can morality demand that you give up your life, or can it only ask?"
      }
    },

    signal: {
      chapter: 4,
      title: "The Signal",
      place: "Cape Lorn lighthouse",
      time: "05:22",
      km: 2,
      scene: "lighthouse",
      theme: "Ends vs. means",
      beats: [
        "You reach an empty lighthouse above the harbor. It has a working radio.",
        "Below you, thousands of people are boarding the last ships.",
        "Enemy guns on a hill are shelling them. The guns are hidden inside a village full of civilians.",
        { who: "Allied Command · radio", text: "Anyone out there: give us the location and we’ll bomb those guns." },
        "If you use the radio, the enemy will track the signal to you."
      ],
      prompt: "Call in the strike?",
      dilemma: "Is it right to kill innocent people as a side effect of saving more?",
      choices: [
        {
          key: "A",
          label: "Call it in",
          sub: "Radio the location.",
          pro: "The guns stop. Thousands escape.",
          con: "The village is destroyed. The enemy will find you.",
          icon: "radio",
          tags: { obey: true, ends: true },
          beats: [
            "You read out the location twice, the way you were trained.",
            { text: "The hill turns white. The guns go silent. The ships sail.", fx: "barrage", variant: "strike" },
            { text: "Then you hear a shell coming for the lighthouse.", fx: "incoming" }
          ],
          ending: "coordinates"
        },
        {
          key: "B",
          label: "Stay silent",
          sub: "Say nothing and slip away.",
          pro: "The village is spared. You get away.",
          con: "The guns keep firing on the ships.",
          icon: "radiooff",
          tags: { obey: false, ends: false },
          beats: [
            { text: "You switch off the radio and climb down to a fishing boat.", scene: "survive" },
            "By sunrise you’re safely out to sea.",
            "Weeks later you learn that two evacuation ships never left the harbor."
          ],
          ending: "silent_radio"
        }
      ],
      debrief: {
        concept: "Side effects & human shields",
        context: "The laws of war allow strikes on military targets if the harm to civilians isn’t out of proportion.",
        lenses: {
          util: { verdict: "A", says: "Thousands saved outweighs one village.", text: "Saving thousands of evacuees outweighs the loss of one village. Call the strike." },
          kant: { verdict: "A", says: "You target the guns. Deaths are a side effect.", text: "The guns are the target. The deaths in the village are a side effect, not your goal. This idea is called the doctrine of double effect." },
          virtue: { verdict: "A", says: "Courage means risking yourself for others.", text: "Courage means risking yourself for others. Staying silent to save yourself is hard to call brave." }
        },
        question: "The enemy hid its guns among civilians. If those civilians die, who is responsible?"
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
    util: { name: "Utilitarianism", short: "Utilitarian", who: "Bentham · Mill", motto: "Best result for the most people" },
    kant: { name: "Kantian ethics", short: "Kantian", who: "Immanuel Kant", motto: "Some acts are always wrong" },
    virtue: { name: "Virtue ethics", short: "Virtue ethics", who: "Aristotle", motto: "What would a good person do?" }
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
