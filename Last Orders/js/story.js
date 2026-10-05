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
              travel     one line shown on the map on the way to the next dilemma
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
    cove: { x: 838, y: 200, name: "GULL COVE" },
    gunner: { x: 752, y: 394, name: "COAST ROAD" },
    harbor: { x: 846, y: 332, name: "SALTMARSH" }
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
          travel: "Your unit marches on through the night toward the coast.",
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
            { text: "The other tanks open fire. Harrow is killed.", fx: "shots" },
            "You and five soldiers from your unit escape into the dark."
          ],
          travel: "With Harrow dead, you lead the five of them toward your hometown.",
          next: "cellar"
        }
      ],
      debrief: {
        concept: "Obeying orders & side effects",
        context: "Real history: in 1950, Seoul’s Hangang Bridge was blown up while refugees were crossing it.",
        lenses: {
          util: { verdict: "A", says: "40 deaths to save thousands is worth it.", text: "Utilitarians judge by results. Forty deaths to save thousands is the better outcome, so blow the bridge." },
          kant: { verdict: "B", says: "Killing innocents is wrong, even under orders.", text: "Deontology says killing innocent people is wrong no matter the result. Being ordered to doesn’t make it someone else’s choice." },
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
          travel: "Lev’s road takes your unit safely to the last checkpoint before the harbor.",
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
          travel: "You and Private Okafor are marched through the night to an enemy camp.",
          next: "captured"
        }
      ],
      debrief: {
        concept: "The ticking-bomb problem",
        context: "Torture is banned by the Geneva Conventions, even in war and even under orders.",
        lenses: {
          util: { verdict: "A", says: "If it saves forty soldiers, the pain is worth it.", text: "If torturing one person saves forty soldiers, the result is worth it. (Many utilitarians still worry that torture produces false information.)" },
          kant: { verdict: "B", says: "Torture uses a person as a tool. Never OK.", text: "Torturing someone uses them purely as a tool to get what you want. Deontology says that is always wrong, whatever it achieves." },
          virtue: { verdict: "B", says: "Cruelty damages the person who does it.", text: "A good person is merciful. Torture turns you into someone cruel, even if it works." }
        },
        question: "You didn’t know the torture would work. Should a choice be judged by what you knew at the time, or by how it turned out?"
      }
    },

    /* ───────────────────────── II (after defying) ───────────────────────── */
    cellar: {
      chapter: 2,
      title: "The Cellar",
      place: "Your mother’s house, Ostrava",
      time: "00:40",
      km: 33,
      scene: "cellar",
      theme: "Ends vs. means",
      beats: [
        "Ostrava, your hometown. Your mother has been looking after your baby son here since the war began.",
        "She’s gone. But Eli is here, asleep in a drawer by the stove. He’s two months old.",
        "An enemy patrol turns into the street. You and your five soldiers hide in the cellar, Eli in your arms.",
        "It’s hot and airless down here. Eli wakes up and starts to scream. Nothing you do calms him.",
        { who: "Pvt. Okafor", text: "Wren, keep him quiet. If they hear him, they’ll kill all of us. Him too." },
        "Boots cross the floor above you. The only way to silence him now is to smother him."
      ],
      prompt: "Silence your son?",
      dilemma: "Is it right to kill your own child to save everyone else?",
      choices: [
        {
          key: "A",
          label: "Silence him",
          sub: "Cover his mouth until he stops.",
          pro: "The patrol won’t hear. Six people live.",
          con: "You kill your own son.",
          icon: "mute",
          tags: { obey: null, ends: true },
          beats: [
            "You press your hand over his mouth and hold him close. You don’t let go.",
            { text: "The footsteps stop above you. Then they move on.", variant: "passed" },
            "An hour later, you and five soldiers climb out of the cellar. Nobody says a word."
          ],
          travel: "Nobody speaks the whole way to the last checkpoint before the harbor.",
          next: "checkpoint"
        },
        {
          key: "B",
          label: "Let him cry",
          sub: "Hold him close and hope.",
          pro: "You don’t harm your son.",
          con: "If the patrol hears, they may kill all of you, Eli too.",
          icon: "heart",
          tags: { obey: null, ends: false },
          beats: [
            "You hold Eli against your chest and pray.",
            { text: "The cellar door bursts open. A flashlight finds you.", variant: "found" },
            "Your squad is dragged out at gunpoint. An old neighbor begs to take Eli, and the soldiers let her.",
            { who: "Neighbor", text: "I’ll get him to the ships. I promise." }
          ],
          travel: "You and your squad are marched through the night to an enemy camp.",
          next: "captured"
        }
      ],
      debrief: {
        concept: "The crying baby dilemma",
        context: "Psychologist Joshua Greene used this “crying baby” dilemma to study how the brain makes moral choices. People are deeply divided on it.",
        lenses: {
          util: { verdict: "A", says: "If you’re found, he dies anyway. Save the rest.", text: "If the patrol finds you, everyone dies, Eli included. Silencing him costs no extra life and saves six. Utilitarians say the numbers decide, even here." },
          kant: { verdict: "B", says: "Never kill an innocent, even to save others.", text: "Killing an innocent person is wrong, whatever it saves. Smothering Eli makes his death the tool that saves everyone else, and a parent has a special duty to protect their child." },
          virtue: { verdict: "split", says: "A tragic dilemma: no choice leaves a good person whole.", text: "Philosopher Rosalind Hursthouse calls this a tragic dilemma. A loving parent can’t do it, but a wise person can’t ignore five other lives either. Whatever you choose scars you." }
        },
        question: "Does it matter that he’s your own child? Should we care more about our family than about strangers?"
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
            { who: "Major Voss", text: "You got lucky. Next time it’s a bomb, and we all die. You’re under arrest." },
            { text: "Then enemy shells hit the checkpoint. Everyone runs for the harbor.", fx: "boom" },
            "In the smoke, you get separated from the others. Now the enemy is between you and the harbor."
          ],
          travel: "Cut off and alone, you head for the cliffs above the sea.",
          next: "cove"
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
            { text: "Then enemy shells hit the checkpoint. Voss orders everyone back to the harbor.", fx: "boom" },
            "He puts you at the wheel of the last truck of wounded."
          ],
          travel: "The convoy of wounded races down the coast road toward the harbor.",
          next: "gunner"
        }
      ],
      debrief: {
        concept: "Moral luck",
        context: "At the Nuremberg trials (1945–46), “I was just following orders” was rejected as a defense.",
        lenses: {
          util: { verdict: "A", says: "A real bomb risk justifies firing.", text: "There was a real chance of a bomb. Firing protected the most people, based on what you knew." },
          kant: { verdict: "split", says: "Your intention matters, not how it turned out.", text: "Deontology judges your intention, not the result. Deontologists disagree about whether “shoot any car that won’t stop” is a fair rule." },
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
        "Colonel Anselm plans to shoot all ten of you, as revenge for one of his soldiers.",
        { who: "Colonel Anselm", text: "Unless you shoot one of them yourself. Then the other nine go free. You too." },
        { text: "He points at Private Okafor, your friend since basic training. A soldier starts filming.", variant: "camera" },
        { who: "Colonel Anselm", text: "Your side says we’re the monsters. Let’s show them what you are." },
        { who: "Pvt. Okafor", text: "Don’t, Wren. He’ll kill them anyway. He just wants the video." }
      ],
      prompt: "Shoot Okafor?",
      dilemma: "Would you kill your friend to stop someone else from killing ten?",
      choices: [
        {
          key: "A",
          label: "Shoot him",
          sub: "Do what the colonel says.",
          pro: "If he keeps his word, nine people live, you included.",
          con: "You kill your friend on camera. The colonel might lie anyway.",
          icon: "pistol",
          tags: { obey: null, ends: true },
          beats: [
            "Your hands shake so badly you need both of them.",
            { text: "Okafor doesn’t look away.", fx: "shot", variant: "shot" },
            "The colonel keeps his word. Nine prisoners, you among them, are pushed out into the dark.",
            { who: "Colonel Anselm", text: "Thank you, Corporal. Everyone will see this." }
          ],
          travel: "Free, but alone behind enemy lines, you run for the coast.",
          next: "cove"
        },
        {
          key: "B",
          label: "Refuse",
          sub: "Don’t give him his video.",
          pro: "You don’t kill your friend or become the colonel’s weapon.",
          con: "If he isn’t bluffing, all ten of you are shot.",
          icon: "cross",
          tags: { obey: null, ends: false },
          beats: [
            { who: "Colonel Anselm", text: "Then you have chosen for all of them." },
            "The rifles rise. Okafor takes your hand.",
            { text: "He wasn’t bluffing. You never became his executioner. Ten people died instead of one.", fx: "volley" }
          ],
          ending: "clean_hands"
        }
      ],
      debrief: {
        concept: "Integrity: “Jim and the Indians”",
        context: "Adapted from a 1973 thought experiment by Bernard Williams. Williams thought the person should probably shoot, but argued that utilitarianism can’t explain why it’s so hard.",
        lenses: {
          util: { verdict: "A", says: "He’s probably not bluffing. Save the nine.", text: "A man who shoots prisoners for revenge probably isn’t bluffing, so refusing likely means ten deaths. Even counting the risk that he lies and the harm his video could do, shooting gives the best chance of saving lives." },
          kant: { verdict: "B", says: "If you shoot, the murder is yours.", text: "If you shoot, you are the murderer, and the colonel has used you as his weapon. If you refuse, the killing is his choice and his responsibility." },
          virtue: { verdict: "split", says: "Loyalty says never. Wisdom can’t ignore nine lives.", text: "A loyal friend could never pull that trigger. But practical wisdom can’t ignore nine other lives. The colonel has built a trap where no choice leaves a good person whole." }
        },
        question: "If the colonel kills ten people because you refused, is that your fault?"
      }
    },

    /* ───────────────────────── IV (after firing) ───────────────────────── */
    gunner: {
      chapter: 4,
      title: "The Gunner",
      place: "The coast road",
      time: "05:20",
      km: 6,
      scene: "road",
      theme: "Ends vs. means",
      beats: [
        "You’re driving the last truck in a convoy of a hundred wounded men. The harbor is six kilometers away.",
        "Enemy armored cars are chasing the convoy down the coast road.",
        "One machine gun is holding them back. The gunner is Kit, the boy who carried water for your platoon in Veyra. He’s twelve.",
        { who: "Kit", text: "Corporal Wren! I held them, like they told me. Can I come now?" },
        "If Kit leaves the gun, nothing stops the armored cars from catching the convoy. If he stays, he’ll be killed or captured."
      ],
      prompt: "Take Kit with you?",
      dilemma: "Is it right to leave a child to die to save a hundred men?",
      choices: [
        {
          key: "B",
          label: "Take him",
          sub: "Pull Kit into the truck.",
          pro: "Kit gets out alive.",
          con: "Nobody holds the road. The convoy may be caught.",
          icon: "child",
          tags: { obey: false, ends: false },
          beats: [
            { text: "You brake hard. Kit scrambles into the cab, shaking.", variant: "taken" },
            "Behind you, the road goes quiet.",
            { text: "A kilometer from the harbor, the armored cars catch the convoy.", fx: "shots" },
            { who: "You", text: "Kit, run for the ships. Don’t look back." },
            { text: "He runs. You turn the truck across the road to block it.", fx: "barrage" }
          ],
          ending: "twelve"
        },
        {
          key: "A",
          label: "Drive on",
          sub: "Leave Kit at his post.",
          pro: "The road holds. A hundred men reach the ships.",
          con: "Kit stays behind, alone.",
          icon: "truck",
          tags: { obey: true, ends: true },
          beats: [
            { who: "You", text: "Keep firing, Kit. Just a little longer." },
            { text: "In the mirror, Kit gets smaller. His gun keeps firing.", variant: "leave" },
            { text: "Every truck reaches the harbor. A hundred wounded men are carried aboard.", scene: "harbor" },
            { text: "As your ship pulls out at 05:52, the gun on the coast road goes quiet.", variant: "sailing" }
          ],
          ending: "the_road"
        }
      ],
      debrief: {
        concept: "Child soldiers & sacrifice",
        context: "Based on Sidney Lewis, who joined the British Army at 12 and fought as a machine gunner at the Somme in 1916. Today, using children under 15 in combat is a war crime.",
        lenses: {
          util: { verdict: "A", says: "A hundred lives outweigh one, even a child’s.", text: "One boy against a hundred wounded men. It’s painful, but utilitarians count every life equally, so a hundred lives outweigh one, even a child’s." },
          kant: { verdict: "split", says: "You didn’t put him there, but he can’t consent.", text: "Deontologists are divided. Driving on isn’t killing Kit, and you have a duty to the wounded in your truck. But a twelve-year-old can’t truly agree to risk his life, so leaving him at the gun uses him as a tool." },
          virtue: { verdict: "B", says: "A good person doesn’t leave a child behind.", text: "A good person protects the most vulnerable first, and Kit is a child. Driving on also saves your own life, so it’s hard to be sure it’s duty and not fear." }
        },
        question: "Adults ordered Kit to hold the road. If he dies there, who is responsible: Kit, his officers, or you for driving past?"
      }
    },

    /* ───────────────────────── IV (after escaping) ───────────────────────── */
    cove: {
      chapter: 4,
      title: "The Tide",
      place: "Gull Cove",
      time: "05:10",
      km: 3,
      scene: "cove",
      theme: "Duty vs. survival",
      beats: [
        "Dawn is close. You’re alone on the cliffs above Gull Cove, behind enemy lines.",
        "Three kilometers away, what’s left of your unit is holding pier four while the last ships load.",
        { who: "A dead soldier’s radio", text: "…any units near Gull Cove… pier four… fall b— …need every man… do you copy?…" },
        "Gunfire ahead. Enemy soldiers are on the path between you and the docks.",
        "Below you, a small fishing boat is tied up in the cove. Past the cape, neutral rescue ships are picking up anyone who reaches them.",
        "The tide is going out. It will carry the boat straight to the rescue ships, but never back to the harbor."
      ],
      prompt: "Take the boat?",
      dilemma: "Do you owe your unit your life, even if you might not make a difference?",
      choices: [
        {
          key: "A",
          label: "Take the boat",
          sub: "Ride the tide out to the rescue ships.",
          pro: "You reach the rescue ships. You’ll almost certainly live.",
          con: "You abandon your unit, maybe when they need you most.",
          icon: "boat",
          tags: { obey: false, ends: null },
          beats: [
            { text: "You untie the boat. The tide pulls you out toward the rescue ships.", variant: "drift" },
            "Behind you, the gunfire at the docks goes on for an hour. Then it stops.",
            { text: "At first light, a rescue ship pulls you aboard. You’re safe.", scene: "survive" },
            "You never find out what the voice on the radio was trying to say."
          ],
          ending: "the_tide"
        },
        {
          key: "B",
          label: "Go back for them",
          sub: "Fight your way to the docks.",
          pro: "Your unit gets one more rifle, maybe when it matters most.",
          con: "You’ll probably be killed on the way.",
          icon: "unit",
          tags: { obey: true, ends: null },
          beats: [
            { text: "You leave the boat behind and run toward the gunfire.", variant: "gone" },
            { text: "You come up behind the enemy line. They never see you coming.", fx: "shots" },
            { text: "Pier four. Your rifle keeps them off the gangway for four minutes. Sixty more people get aboard.", scene: "harbor" },
            { text: "The last ship pulls away. You are still on the pier.", variant: "departing", fx: "barrage" }
          ],
          ending: "pier_four"
        }
      ],
      debrief: {
        concept: "Duty vs. self-preservation",
        context: "In World War I, Britain executed 306 of its own soldiers for desertion and cowardice. Many had shell shock. All were pardoned in 2006.",
        lenses: {
          util: { verdict: "A", says: "One rifle probably won’t change much. Stay alive.", text: "You can’t tell if one more rifle would change anything, and you’d probably die getting there. A likely death for an uncertain benefit is a bad trade. Alive, you can still help people later." },
          kant: { verdict: "B", says: "“Run when it’s dangerous” can’t be a rule for everyone.", text: "Deontology’s test: could every soldier follow your rule? If all soldiers ran whenever staying got dangerous, no one could rely on anyone, and your unit is relying on you. Duty means going back." },
          virtue: { verdict: "B", says: "Courage means facing death for your friends.", text: "For Aristotle, the clearest example of courage is facing death in battle for others. Courage isn’t recklessness, but loyalty to your friends counts for a lot." }
        },
        question: "If you can’t know whether your help will make any difference, are you still obligated to try?"
      }
    }
  },

  endings: {
    clean_hands: { title: "Clean Hands", survived: false, epitaph: "You refused to kill. Ten died instead of one." },
    the_road: { title: "The Road Held", survived: true, epitaph: "A hundred men reached the ships because a twelve-year-old held the road." },
    twelve: { title: "Twelve Years Old", survived: false, epitaph: "Kit made it to the ships. Many of the wounded didn’t, and neither did you." },
    the_tide: { title: "The Ebb Tide", survived: true, epitaph: "You saved yourself. You’ll never know if they needed you." },
    pier_four: { title: "Pier Four", survived: false, epitaph: "You went back for them. Sixty people sailed because you did." }
  },

  // The ethical profile at the end: which school of thought your choices sit closest to
  frameworks: {
    util: { name: "Utilitarianism", short: "Utilitarian", who: "Bentham · Mill", motto: "Best result for the most people" },
    kant: { name: "Deontology", short: "Deontology", who: "Immanuel Kant", motto: "Some acts are always wrong" },
    virtue: { name: "Virtue ethics", short: "Virtue ethics", who: "Aristotle", motto: "What would a good person do?" }
  },
  profiles: {
    util: { label: "a Utilitarian", text: "You judged choices by their results. When harm bought a better outcome, you paid the price." },
    kant: { label: "a Deontologist", text: "Some lines you would not cross, whatever the orders or the numbers." },
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
      <li><strong>Child soldiers, 1916 and today.</strong> Sidney Lewis lied about his age, joined the British Army at 12, and fought as a machine gunner at the Battle of the Somme. Today, using children under 15 in combat is a war crime under the Rome Statute of the International Criminal Court (1998).</li>
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
      <li>Do we owe more to our own family than to strangers?</li>
      <li>If someone else will commit a great evil unless you commit a smaller one, whose fault is the outcome?</li>
      <li>Can a child ever agree to risk their life for others? If not, can anyone ask them to?</li>
      <li>Are you obligated to help when you can’t know whether your help will make any difference?</li>
    </ol>

    <h2>Why being good doesn’t keep you alive</h2>
    <p>I deliberately disconnected survival from morality. In this game, defying an unjust order can get you killed, and doing something terrible can get you home. Philosophers Bernard Williams and Thomas Nagel called this <strong>moral luck</strong>: the outcome of a choice often depends on things outside our control, yet we judge people by outcomes anyway. If the game rewarded every good choice with survival, it would teach the comforting lie that morality always pays. The dilemmas only work if doing right might cost you everything.</p>

    <h2>My reasoning and conclusions</h2>
    <p>After writing every branch of this game, I don’t think “always obey” or “always follow your conscience” holds up against these dilemmas. Here is where I landed.</p>
    <p><strong>Orders never remove responsibility.</strong> I agree with the Nuremberg principle: if a moral choice is possible, the person who pulls the trigger owns what happens. At the checkpoint, Voss’s order explains why you fired, but it doesn’t make the family’s suffering someone else’s act. Orders still matter, though. A soldier who ignores orders on a hunch puts others at risk. At the bridge, waiting for the refugees cost the lieutenant his life. I think obedience is a real duty, but a limited one, and it ends where an order asks you to deliberately harm innocent people.</p>
    <p><strong>Ends can justify some means, but not all of them.</strong> I’m persuaded by the idea behind the doctrine of double effect. Blowing a bridge, where innocent deaths are a foreseen side effect of stopping a military threat, is different from torturing a prisoner, where hurting a person is the tool you use. The first kind can be defended if the good is large enough. The second treats a human being as a thing, and I agree with deontologists that numbers can’t erase that line. The colonel’s offer is the hardest case for me. Shooting Okafor saves nine people only if a man who executes prisoners keeps his word, and it hands him exactly the video he wants. I still lean toward shooting, because refusing almost certainly means ten deaths, while the colonel’s lie is only a possibility. That is where I part ways with a strict deontologist, but I don’t think someone who refuses is wrong.</p>
    <p><strong>The crying baby breaks my own rule.</strong> Smothering Eli uses him as a tool, which I just said numbers can’t justify. But if the patrol finds the cellar, Eli dies anyway, so refusing saves no one and costs five more lives. I can’t call either choice right. I think it is what Rosalind Hursthouse calls a tragic dilemma: there is no right answer, only a choice you have to live with.</p>
    <p><strong>Virtue ethics explains what the other two miss:</strong> what these choices do to the person who makes them. The player who drives past Kit survives, but has to become someone who could do that and live with it.</p>
    <p><strong>My conclusion.</strong> We should judge choices by the reasons and information a person had at the time, not by how luck turned out. We should hold ourselves responsible for what we do with our own hands, even under orders. And being good is not a strategy for staying alive. If morality only counted when it paid off, it would just be self-interest.</p>
  `
};
