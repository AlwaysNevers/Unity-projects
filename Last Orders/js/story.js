/*
  LAST ORDERS — story content
  ------------------------------------------------------------
  All of the game's writing lives in this file, so you can edit
  the story, the philosophy debrief, and the Designer's Notes
  without touching the game engine.

  Structure
    intro      the opening cards
    nodes      the seven dilemmas (a playthrough visits four)
    endings    the five endings
    profiles   the "ethical profile" shown in the debrief
    notes      the Designer's Notes page (HTML)

  Each choice has:
    tags.obey  true = followed an order, false = defied one, null = no order given
    tags.ends  true = did harm to reach a good outcome, false = refused to
    next       the id of the next dilemma, or
    ending     the id of an ending
  Each dilemma's debrief has three "lenses". Their verdict is the key
  of the choice that framework would most likely pick ("A", "B"),
  or "split" when thinkers in that tradition disagree.
*/

window.STORY = {
  start: "bridge",

  intro: [
    {
      kicker: "November 2031",
      text: [
        "The Third World War is eleven weeks old. Nobody calls it that on the radio yet, but everybody knows.",
        "Tonight the eastern front collapsed. The city of Veyra is burning behind you, and the armored divisions of the Directorate are rolling west faster than anyone thought possible."
      ]
    },
    {
      kicker: "Corporal Wren, 3rd Rifle Company",
      text: [
        "That’s you. Twenty-two years old. Eight months in uniform.",
        "The last evacuation ship leaves Saltmarsh Harbor at dawn, forty kilometers away. Between here and there are rivers, minefields, enemy patrols, and thousands of civilians trying to reach the same ship."
      ]
    },
    {
      kicker: "Before you begin",
      text: [
        "You will face four decisions. Each has two options, and neither is clean.",
        "Doing the right thing will not always keep you alive. Staying alive will not prove you did the right thing. When it’s over, you’ll see how three schools of moral philosophy would judge what you chose."
      ]
    }
  ],

  nodes: {
    /* ───────────────────────── I ───────────────────────── */
    bridge: {
      chapter: 1,
      title: "The Bridge",
      dispatch: "Kessel River crossing · 21:47 · 40 km to Saltmarsh",
      scene: "bridge",
      text: [
        "The Kessel River bridge is the only crossing for twenty kilometers. Your company has wired it with explosives, and the detonator is in your hands.",
        "On the far bank, the dust of an enemy armored column rises against the firelight. Two kilometers out, maybe less. If those tanks cross, they reach the harbor road by midnight and cut off thousands of retreating soldiers and civilians.",
        "But the bridge isn’t empty. Forty refugees are still on it: an old bus with a shattered windshield, families on foot, a man pushing his mother in a wheelbarrow.",
        "Lieutenant Harrow’s voice cracks over the radio. “Wren. Blow it. That’s an order. Now.”",
        "They need three more minutes. You don’t know if the tanks will give you three minutes."
      ],
      choices: [
        {
          key: "A",
          label: "Press the detonator",
          sub: "Follow the order. Forty lives to protect thousands.",
          tags: { obey: true, ends: true },
          fx: "explosion",
          variant: "blown",
          result: [
            "Your thumb comes down.",
            "The blast is louder than anything you’ve ever heard. When the smoke thins, the middle span is gone, and so is everything that was on it.",
            "On the far bank the tanks grind to a halt. Within the hour the column turns north. The harbor road is safe, and thousands of people will reach the ships tonight because of what you just did.",
            "Harrow claps your shoulder. “You did your job, Wren.” You don’t answer. You can still see the wheelbarrow."
          ],
          next: "prisoner"
        },
        {
          key: "B",
          label: "Wait for the refugees",
          sub: "Defy the order. Give them the time they need and risk everything.",
          tags: { obey: false, ends: false },
          fx: "explosion",
          variant: "blown",
          result: [
            "You switch off the radio.",
            "Ninety seconds. The bus clears the span. The last family stumbles onto your bank. Then the lead tank rolls onto the bridge, and you press the button.",
            "The tank goes down with the bridge, but the tanks behind it open fire on your position. A shell lands where Harrow was standing. You don’t see him again. Your company scatters into the dark.",
            "When the shooting stops, you’re alone with twelve of the refugees you saved. None of them speak your language, but they follow you anyway."
          ],
          next: "cellar"
        }
      ],
      debrief: {
        concept: "Superior orders and the doctrine of double effect",
        context: "This has happened. On 28 June 1950, early in the Korean War, the South Korean army blew up Seoul’s Hangang Bridge to slow the invading North Korean army while it was crowded with refugees. Hundreds were killed. Historians still argue about whether it was necessary.",
        lenses: {
          util: {
            verdict: "A",
            text: "Count the lives: forty on the bridge against thousands on the harbor road. Bentham and Mill judge an act by its consequences, so blowing the bridge now is right, however terrible it feels."
          },
          kant: {
            verdict: "B",
            text: "Kant says never treat a person merely as a means. Many Kantians would say you may not knowingly kill innocent people for a good end, and that an order doesn’t move your responsibility onto Harrow. The finger on the detonator is still yours."
          },
          virtue: {
            verdict: "split",
            text: "Aristotle asks what a person of practical wisdom would do. Courage is not recklessness, and gambling thousands of lives on a hunch could be rash. Compassion that never acts is hollow, too. Virtue ethics gives no formula here. It asks what your choice made you."
          }
        },
        questions: [
          "If the refugees die because you pressed the button, and you only pressed it because you were ordered to, who killed them: you, Harrow, or the enemy whose tanks forced the choice?",
          "Is there a moral difference between killing people as a side effect and killing them on purpose?"
        ]
      }
    },

    /* ───────────────────────── II (after obeying) ───────────────────────── */
    prisoner: {
      chapter: 2,
      title: "The Prisoner",
      dispatch: "Holloway farm · 00:12 · 31 km to Saltmarsh",
      scene: "farmhouse",
      text: [
        "Midnight. Your company shelters in an abandoned farmhouse while rain hammers the roof.",
        "Your squad caught an enemy scout in the orchard: Private Lev Arkin, nineteen years old, soaked and shaking. He has spent a week in the fields between here and the coast. He knows which roads are mined.",
        "Without that knowledge, the company has to take the long route through the Tannen forest, where enemy patrols are thick. With it, you could walk straight to the harbor.",
        "Harrow hands you a pair of pliers. “He knows the safe road. Get it out of him. Whatever it takes. I don’t want to know how.”",
        "Lev looks at the pliers, then at you. He’s crying."
      ],
      choices: [
        {
          key: "A",
          label: "Do whatever it takes",
          sub: "Hurt him until he talks. Forty soldiers’ lives depend on that road.",
          tags: { obey: true, ends: true },
          result: [
            "Afterward, you can’t remember how long it took. You remember the sound.",
            "By two in the morning, Lev has drawn the safe road on your map with a shaking hand. At dawn the company walks it. He told the truth: not a single mine. Every soldier in your company is alive because of what you did in that room.",
            "You leave Lev tied up in the farmhouse for his own side to find. You tell yourself they will.",
            "By morning you reach the coast road, where an Allied checkpoint is still holding."
          ],
          next: "checkpoint"
        },
        {
          key: "B",
          label: "Refuse",
          sub: "Treat him as a prisoner of war. Some things you don’t do, even to save lives.",
          tags: { obey: false, ends: false },
          result: [
            "You set the pliers on the table. “No.”",
            "Harrow stares at you for a long time. Then he walks out without a word. You give Lev your water and a dry blanket. He tells you nothing, and you don’t ask.",
            "Without the safe road, the company takes the forest route. At three in the morning the trees light up with muzzle flashes. Harrow is the first to fall. You fire until your rifle clicks empty. Then a boot knocks you flat, and someone is shouting in a language you don’t understand.",
            "You’ve been captured."
          ],
          next: "captured"
        }
      ],
      debrief: {
        concept: "Torture and the ticking-bomb argument",
        context: "Torture is banned absolutely by the Geneva Conventions and the UN Convention Against Torture, even in wartime and even under orders. The “ticking bomb” case, where torturing one person would save many, is still one of the most argued-over thought experiments in ethics. In this story, torture worked. Real interrogators often report that it produces false information.",
        lenses: {
          util: {
            verdict: "A",
            text: "If torture reliably saves many lives, an act-utilitarian can justify it here. Rule-utilitarians push back: a world where soldiers torture prisoners is worse overall, with more false confessions, more retaliation, and more brutalized soldiers."
          },
          kant: {
            verdict: "B",
            text: "Torture is the clearest case of using a person merely as a means: breaking someone’s will to extract what you want from them. Kant would forbid it whatever the outcome. No order from a superior can override the moral law."
          },
          virtue: {
            verdict: "B",
            text: "What kind of person tortures a crying nineteen-year-old? Virtue ethics looks at character, and cruelty corrodes the person who practices it, even when it has a purpose. Mercy here is not weakness."
          }
        },
        questions: [
          "You didn’t know the torture would work when you chose. Should a choice be judged by what the chooser knew, or by what actually happened?",
          "If an absolute rule like “never torture” gets people killed, is it still the right rule?"
        ]
      }
    },

    /* ───────────────────────── II (after defying) ───────────────────────── */
    cellar: {
      chapter: 2,
      title: "The Cellar",
      dispatch: "St. Ada’s school, Ostrava · 00:40 · 33 km to Saltmarsh",
      scene: "cellar",
      text: [
        "You and the refugees are hiding in the cellar of a bombed-out school. Boots crunch on broken glass above your heads. An enemy patrol is searching the street building by building, and tonight they aren’t taking prisoners.",
        "Beside you, a wounded man named Tomas is burning with fever. He’s delirious, moaning louder and louder.",
        "A woman presses her scarf into your hand. She doesn’t need to translate. Hold it over his mouth until the patrol leaves, and the twelve people in this cellar will probably live. Tomas, as weak as he is, probably won’t.",
        "There is one other way. You could slip out the back window and make noise in the street to draw the patrol after you. They might chase you. Or they might realize someone is hiding nearby and tear the block apart."
      ],
      choices: [
        {
          key: "A",
          label: "Silence Tomas",
          sub: "One certain death to save twelve.",
          tags: { obey: null, ends: true },
          result: [
            "You press the scarf over Tomas’s mouth. He barely struggles. That’s the worst part.",
            "The boots overhead stop. Someone laughs. The footsteps move on, fade, and disappear.",
            "When you lift the scarf, Tomas is still. The woman who gave it to you touches your hand. Twelve people climb out of that cellar before dawn. None of them look at you.",
            "By morning you’ve led them to the coast road, where an Allied checkpoint is still holding."
          ],
          next: "checkpoint"
        },
        {
          key: "B",
          label: "Draw the patrol away",
          sub: "Refuse to kill him. Gamble your life, and theirs, instead.",
          tags: { obey: null, ends: false },
          result: [
            "You squeeze out the back window and kick over a row of empty barrels. Every flashlight in the street swings toward you.",
            "You run. You almost make it to the treeline.",
            "From the ground, with a rifle barrel pressed against your neck, you watch the patrol march past the school without a second glance. The gamble paid off, for them. Tomas will see the morning. So will the others.",
            "You’re marched, hands bound, to an enemy field camp."
          ],
          next: "captured"
        }
      ],
      debrief: {
        concept: "Doing versus allowing: the trolley problem made personal",
        context: "Philosophers Philippa Foot and Judith Jarvis Thomson noticed that most people will pull a lever to send a runaway trolley toward one person instead of five, but won’t push a man off a footbridge to stop it, even though the numbers are the same. Survivors of World War II hiding places have described facing choices like this cellar.",
        lenses: {
          util: {
            verdict: "A",
            text: "One certain death against a gamble with thirteen lives, including yours. Expected-value reasoning favors silencing Tomas: the most lives saved with the most certainty."
          },
          kant: {
            verdict: "B",
            text: "Holding the scarf means killing an innocent man with your own hands so that others can live. That is using him as a means. You may risk your own life. You may not take his."
          },
          virtue: {
            verdict: "B",
            text: "Drawing the patrol away shows courage and self-sacrifice, an act beyond duty (philosophers call this supererogatory). A wise person also weighs recklessness: if your gamble had failed, thirteen people would have died for your conscience."
          }
        },
        questions: [
          "Is killing one person worse than letting thirteen die? Why does it feel different when it’s your hands on the scarf instead of a lever?",
          "Tomas never agreed to die. Would it change anything if he had?"
        ]
      }
    },

    /* ───────────────────────── III ───────────────────────── */
    checkpoint: {
      chapter: 3,
      title: "The Checkpoint",
      dispatch: "Checkpoint Bravo-7, coast road · 03:18 · 9 km to Saltmarsh",
      scene: "checkpoint",
      text: [
        "The last Allied checkpoint before Saltmarsh Harbor. Major Voss put you on the barrier the moment you arrived.",
        "The orders came an hour ago: enemy saboteurs have been driving civilian cars packed with explosives into checkpoints up and down the coast. Any vehicle that doesn’t stop at the warning line is to be fired on. No exceptions.",
        "Headlights. A blue hatchback, coming fast. You wave your flashlight. You fire a warning shot into the air. It doesn’t slow down.",
        "In the glare you see a man at the wheel, and in the back seat, something small. A child. Or a bag.",
        "Voss is shouting. “Fire! Fire, Wren!” Forty meters. Thirty."
      ],
      choices: [
        {
          key: "B",
          label: "Hold your fire",
          sub: "Defy the order. You won’t shoot at what might be a family.",
          tags: { obey: false, ends: false },
          variant: "stopped",
          result: [
            "You lower your rifle. So does the private beside you, because you did.",
            "The hatchback crosses the warning line, skids, and crunches into the sandbags. The driver tumbles out with his hands up, screaming that his brakes failed on the hill. In the back seat, a little boy is crying. There is no bomb.",
            "Voss takes your rifle and has you zip-tied in the back of a supply truck. “You got lucky, Corporal. Next time it’s a bomb, and all of us die because you had a feeling.” You’ll face a court-martial at the harbor.",
            "You never reach the harbor. Enemy shells hit the convoy at four in the morning. In the chaos you work your wrists free and run for the cliffs, toward the only light you can see: an old lighthouse."
          ],
          next: "signal"
        },
        {
          key: "A",
          label: "Open fire",
          sub: "Obey. If it’s a bomb, you just saved everyone at this checkpoint.",
          tags: { obey: true, ends: true },
          variant: "stopped",
          fx: "shots",
          result: [
            "You fire. Everyone on the line fires.",
            "The hatchback veers, hits the barrier, and stops. Silence, then the hiss of a burst radiator.",
            "There is no bomb. There is a man named Pavel Dresner, whose brakes failed on the hill, and his seven-year-old son in the back seat. The medic works on the boy for a long time. You never find out how it ends.",
            "Voss writes it up as “engagement per standing orders.” He tells you it wasn’t your fault. It’s true in the way that the paperwork says it’s true. At dawn, a truck takes the checkpoint crew down to the harbor."
          ],
          next: "boat"
        }
      ],
      debrief: {
        concept: "Moral luck and the superior-orders defense",
        context: "At the Nuremberg Trials (1945–46), “I was following orders” was rejected as a defense when a moral choice was possible. But soldiers at real checkpoints get seconds to decide, and car bombs are a real threat. Philosopher Bernard Williams used the term “moral luck” for how we judge the same choice differently depending on how it turns out.",
        lenses: {
          util: {
            verdict: "A",
            text: "Weigh the odds. If there’s a real chance the car holds a bomb, firing protects many people at the checkpoint. A utilitarian can say you made the right call on the information you had, even though it ended horribly."
          },
          kant: {
            verdict: "split",
            text: "Kant judges the will, not the outcome. You didn’t know the family was innocent, so the question is whether you acted from duty on a rule you could will for everyone. Kantians disagree on whether “fire on any car that won’t stop” is such a rule."
          },
          virtue: {
            verdict: "B",
            text: "Practical wisdom means seeing the situation clearly: the swerving car, the shape in the back seat. A good soldier is not a machine. In 1983, Soviet officer Stanislav Petrov trusted his judgment over his instruments, refused to report a false nuclear alarm, and may have prevented a world war."
          }
        },
        questions: [
          "If the car had held a bomb, the same refusal would have killed everyone at the checkpoint. Was your choice any better or worse because of how it turned out?",
          "When you obey an order that kills innocent people, how much of the blame is yours?"
        ]
      }
    },

    captured: {
      chapter: 3,
      title: "The Colonel’s Offer",
      dispatch: "Directorate field camp · 03:55 · 14 km to Saltmarsh",
      scene: "camp",
      text: [
        "Floodlights, barbed wire, and ten prisoners kneeling in the mud, Allied soldiers and civilians together. You’re one of them.",
        "Colonel Anselm walks down the line. He is calm, almost polite. One of his men was killed by a sniper tonight, he explains, and his orders are to execute ten prisoners in reprisal.",
        "Then he stops in front of you and holds out a pistol with a single bullet in it.",
        "“I am a reasonable man, so I will make you an offer. Shoot one of them, any one, and I let the other nine go. You included. Refuse, and my men shoot all ten.”",
        "The old fisherman kneeling beside you whispers, “Do it. Pick me. Please. I’m old.”",
        "The colonel waits."
      ],
      choices: [
        {
          key: "A",
          label: "Take the pistol",
          sub: "Kill one innocent person so that nine can live.",
          tags: { obey: null, ends: true },
          result: [
            "Your hands shake so badly you need both of them.",
            "The fisherman closes his eyes and says something you’ll never understand. Then it’s done.",
            "Colonel Anselm keeps his word. At dawn, nine prisoners are marched to the road and released, and you are one of them. “You see?” he says. “War makes all of us into something.”",
            "You walk toward the coast without looking back. Before sunrise you reach the cliffs above Saltmarsh Harbor, where an old lighthouse still stands."
          ],
          next: "signal"
        },
        {
          key: "B",
          label: "Refuse",
          sub: "You will not become his executioner, whatever it costs.",
          tags: { obey: null, ends: false },
          ending: "clean_hands",
          result: [
            "You look at the pistol, then at the colonel. “No.”",
            "He sighs, as if you’ve disappointed him. “Then you have chosen for all of them.”",
            "The line of rifles rises. You reach for the old fisherman’s hand, and he takes it.",
            "You never became a murderer. Ten people died instead of one. You will never have to decide which of those facts matters more."
          ]
        }
      ],
      debrief: {
        concept: "Integrity: Bernard Williams’s “Jim and the Indians”",
        context: "This dilemma is adapted from a 1973 thought experiment by Bernard Williams. He used it to argue that utilitarianism leaves out something important: we are especially responsible for what we ourselves do, not only for what happens. Williams actually thought Jim should probably take the gun. His point was that utilitarianism makes the answer look far too easy.",
        lenses: {
          util: {
            verdict: "A",
            text: "One death is better than ten. A utilitarian would call refusing a form of moral self-indulgence: keeping your hands clean at the cost of nine lives."
          },
          kant: {
            verdict: "B",
            text: "If you pull the trigger, the murder is yours. If you refuse, the ten deaths belong to the colonel, who chose them. You are responsible for your own actions, not for the evil other people freely choose."
          },
          virtue: {
            verdict: "split",
            text: "The old man volunteered. Is honoring his sacrifice an act of compassion, or is it letting a murderer turn you into his tool? Virtue ethicists disagree. The answer depends on what a wise and just person could live with afterward."
          }
        },
        questions: [
          "If the colonel kills ten people because you refused, did you cause their deaths?",
          "Does the old man’s consent change what the act is?"
        ]
      }
    },

    /* ───────────────────────── IV ───────────────────────── */
    boat: {
      chapter: 4,
      title: "The Last Boat",
      dispatch: "Saltmarsh Harbor, pier 4 · 05:40 · Departure 06:00",
      scene: "harbor",
      text: [
        "The last evacuation ship, the Aurora, is taking on its final passengers. Enemy guns are already shelling the outer docks.",
        "You’ve been posted on the gangplank, and the orders are simple: the ship is over capacity. Soldiers only from here on, because the army needs every one of them to keep fighting. No more civilians. Hold the line, and when the horn sounds, board last.",
        "A woman pushes through the crowd holding a girl of about six. A name is written on a tag around the girl’s neck: MIRA. “Please. Just her. She’s small. Please.”",
        "The deck officer shakes his head. Every seat is counted. If Mira goes aboard, someone has to come off, and the only person on this gangplank who isn’t already counted is you."
      ],
      choices: [
        {
          key: "A",
          label: "Hold the line",
          sub: "Obey the order. Board the ship, live, and keep fighting.",
          tags: { obey: true, ends: true },
          ending: "last_aboard",
          variant: "departing",
          result: [
            "“I’m sorry,” you tell her. You don’t know if she hears it over the shelling.",
            "The horn sounds. You’re the last one up the gangplank before it lifts away. From the rail you watch the woman and the girl grow smaller on the dock until the smoke swallows them.",
            "The Aurora makes it out. You make it out. In the months that follow you will fight again, and you’ll be good at it, and you will save lives.",
            "You will think about Mira every single day."
          ]
        },
        {
          key: "B",
          label: "Give Mira your place",
          sub: "Step off the gangplank. She goes. You stay.",
          tags: { obey: false, ends: false },
          ending: "miras_place",
          variant: "departing",
          result: [
            "You lift Mira over the rope and set her on the deck. The deck officer opens his mouth, closes it, and waves her aboard.",
            "You step back onto the dock. The horn sounds. The gangplank lifts.",
            "Her mother squeezes your hand. Together you watch the Aurora slide out into open water, with a six-year-old girl waving from the rail.",
            "Twenty minutes later, the shells reach the inner docks. The Aurora makes it out. Mira makes it out. You don’t."
          ]
        }
      ],
      debrief: {
        concept: "Duty, role, and going beyond duty",
        context: "Evacuations like Dunkirk (1940) and Saigon (1975) forced exactly these decisions about who gets a place when there aren’t enough. Acts that go beyond what morality requires, like giving your life for a stranger, are called supererogatory: praiseworthy, but not required.",
        lenses: {
          util: {
            verdict: "A",
            text: "Cold as it sounds, a trained soldier may save many lives in the war to come. Many utilitarians would say hold the line. Others would count the whole lifetime a six-year-old has ahead of her."
          },
          kant: {
            verdict: "A",
            text: "You swore an oath, and this order is not wicked in itself; the shortage of seats is not your doing. Kant holds that you also have duties to preserve your own life. Giving your seat is permitted, but not required."
          },
          virtue: {
            verdict: "B",
            text: "Compassion and courage point toward giving your place. Aristotle praised the person who gives up even their life for what is noble. Virtue also includes loyalty to your comrades and your post, which is why this one hurts."
          }
        },
        questions: [
          "Is there a limit to what morality can demand of you? Is giving your life for a stranger a duty or a gift?",
          "Does wearing a uniform change what you owe civilians?"
        ]
      }
    },

    signal: {
      chapter: 4,
      title: "The Signal",
      dispatch: "Cape Lorn lighthouse · 05:22 · 2 km above Saltmarsh",
      scene: "lighthouse",
      text: [
        "The lighthouse is empty except for a radio set and a dead signalman. From the lantern room you can see everything. Below, thousands of people are boarding the last ships in Saltmarsh Harbor. On the hills behind it, the enemy’s artillery is shelling the docks from inside a village.",
        "The radio crackles. Allied Command, desperate. “Any station, any station. We need eyes on those guns. Give us coordinates and we’ll hit them.”",
        "You can see the guns. You can also see the village around them: lit windows, laundry lines, a church. The enemy put the guns there on purpose.",
        "And you know one more thing. The moment you transmit, their direction-finders will trace your signal to this lighthouse."
      ],
      choices: [
        {
          key: "A",
          label: "Call in the strike",
          sub: "Save the evacuation, at the cost of the village and probably you.",
          tags: { obey: true, ends: true },
          ending: "coordinates",
          variant: "strike",
          fx: "barrage",
          result: [
            "You read the coordinates twice, slowly, the way you were trained.",
            "Two minutes later the sky over the hills turns white. The enemy guns fall silent. Below you, every ship in the harbor starts to move, full, out into open sea.",
            "You’re still watching them when you hear the first shell whistling toward the lighthouse. They found you, just as you knew they would.",
            "Thousands of people escaped because of your call. In the village on the hill, the church bell will not ring again."
          ]
        },
        {
          key: "B",
          label: "Stay silent",
          sub: "Don’t send shells into a village. Slip away and live.",
          tags: { obey: false, ends: false },
          ending: "silent_radio",
          result: [
            "You switch off the radio.",
            "You climb down the cliff path to a cove where a fishing boat is tied up, half flooded, and bail it out with your helmet. By sunrise you’re drifting north along the coast, out of range.",
            "Behind you the guns fire all morning. You don’t turn around. Weeks later you read the numbers in a newspaper: two of the evacuation ships never made it out of Saltmarsh Harbor.",
            "The village on the hill is still standing. You are still alive. You aren’t sure whether either fact is a comfort."
          ]
        }
      ],
      debrief: {
        concept: "Proportionality and human shields",
        context: "Under the laws of war, attacking a military target can be legal even if civilians may die, as long as the expected harm isn’t excessive compared to the military advantage. This is the principle of proportionality. Placing weapons among civilians is itself a war crime, but it doesn’t make the other side’s choice easy.",
        lenses: {
          util: {
            verdict: "A",
            text: "Thousands of evacuees against a village. The numbers favor the strike, even after counting your own life."
          },
          kant: {
            verdict: "A",
            text: "Many deontologists rely on the doctrine of double effect, which goes back to Thomas Aquinas. An act with a foreseen but unintended harm can be allowed if the harm isn’t the means and the good is proportionate. The guns are your target. The village is not."
          },
          virtue: {
            verdict: "A",
            text: "Courage means facing death for something worth it. Staying silent had a principled reason and a selfish one. Only you know which one moved you. Aristotle would say that is exactly what matters."
          }
        },
        questions: [
          "The enemy placed civilians around the guns. If those civilians die, who is responsible?",
          "You had a good reason to stay silent and a selfish reason too. Does it matter which one actually moved you?"
        ]
      }
    }
  },

  endings: {
    clean_hands: {
      title: "Clean Hands",
      survived: false,
      epitaph: "You refused to kill. Ten people died instead of one."
    },
    last_aboard: {
      title: "The Last Aboard",
      survived: true,
      epitaph: "You followed your orders, and you lived."
    },
    miras_place: {
      title: "Mira’s Place",
      survived: false,
      epitaph: "A six-year-old girl lived because you didn’t."
    },
    coordinates: {
      title: "The Coordinates",
      survived: false,
      epitaph: "Thousands escaped. A village and a lighthouse did not."
    },
    silent_radio: {
      title: "The Silent Radio",
      survived: true,
      epitaph: "You spared a village and saved yourself. Two ships did not make it out."
    }
  },

  profiles: {
    instrument: {
      name: "The Soldier’s Arithmetic",
      text: "You trusted the chain of command and the math of lives. When an order promised to save more people than it cost, you carried it out, even when it meant doing something terrible yourself. Utilitarians would defend most of your choices. Kant would ask whether you ever stopped being the author of your own actions."
    },
    objector: {
      name: "The Conscientious Objector",
      text: "You treated some acts as off-limits, whatever the orders and whatever the numbers. Kant would recognize you. A utilitarian would ask how many people paid for your clean hands, and whether that was fair to them."
    },
    calculator: {
      name: "The Lone Calculator",
      text: "You ignored orders when they clashed with your own judgment, but you were willing to do terrible things when the math demanded it. You answer to outcomes, not to rank and not to rules."
    },
    dutiful: {
      name: "The Reluctant Soldier",
      text: "You followed orders when they didn’t require you to harm innocent people directly, and drew your line at using a person as a tool. Your ethics sit between duty to your role and duty to humanity."
    },
    torn: {
      name: "The Torn",
      text: "Your choices don’t fit a single theory. Sometimes you followed the numbers, sometimes your conscience, sometimes your orders. Many philosophers think this is the honest position: no single framework captures everything that matters."
    }
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
