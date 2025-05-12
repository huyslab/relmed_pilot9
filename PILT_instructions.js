// Instructions for the PILT
const small_coin_size = 100;
const demo_stimuli = [
    "almond_1.jpg",
    "envelope_1.jpg",
    "strainer_1.jpg",
    "anchor_1.jpg",
    "bus_1.jpg",
    "cantaloupe_1.jpg"
]

function prepare_PILT_instructions() {
    const inter_block_instruct = {
        type: jsPsychInstructions,
        css_classes: ['instructions'],
        pages: () => [inter_block_stimulus()],
        show_clickable_nav: true,
        data: {trialphase: "pilt_instruction"}
    }

    let inst =  [
        {
            type: jsPsychInstructions,
            css_classes: ['instructions'],
            pages: () => {

            let pages = [
            `<p><b>THE CARD CHOOSING GAME</b></p>
                <p>In this game you will flip cards to collect the coins behind them.</p>
                <p>Some cards are luckier than others. Your goal is to collect as much money as possible${window.task == "screening" ? "" : " and avoid losing it"}.</p>
                <p>At the end of this session, you will be paid a bonus based on the sum of coins you collected.</p>`,
            `<p>On each turn of this game, you will see two cards.
                You have ${window.context === "relmed" ? "four" : "three"} seconds to flip one of the two cards.</p>
                <p>This will reveal the coin you collect: either 1 pound, 50 pence, or 1 penny.</p>
                <div style='display: grid;'><table style='width: 200px; grid-column: 2;'><tr>
                <td><img src='imgs/1pound.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td>
                <td><img src='imgs/50pence.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td>
                <td><img src='imgs/1penny.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td></tr></table></div>`,
        ];

        if (window.session !== "screening"){
            pages.push(`<p>When you flip a card, you might see broken coins like these:</p>\
                <div style='display: grid;'><table style='width: 200px; grid-column: 2;'><tr>
                <td><img src='imgs/1poundbroken.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td>
                <td><img src='imgs/50pencebroken.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td>
                <td><img src='imgs/1pennybroken.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td></tr></table></div>
                <p>This means you lose that amount of game coins.</p>`);
            pages.push(`<p>Sometimes, losing coins cannot be avoided. Your goal then is to lose as little money as possible.</p>
                <p>To cover these losses, you will start the game with £100 in game coins.</p>`)
        }

        return pages
    },
        show_clickable_nav: true,
        data: {trialphase: "pilt_instruction"},
        on_start: () => {updateState("pilt_instructions_start")}
    }
    ];

    inst.push(
        {
            type: jsPsychHtmlKeyboardResponse,
            css_classes: ['instructions'],
            stimulus: `<p>You choose a card by pressing the left or the right arrow keys.</p>
                    <p>Let's try it out now! Flip a card on the next screen.</p>
                    <p>When you're ready, place your fingers comfortably on the <strong>left and right arrow keys</strong> as shown below. Press down <strong> both left and right arrow keys at the same time </strong> to begin.</p>
                    <img src='imgs/PILT_keys.jpg' style='width:250px;'></img>
                    `,
            // choices: ['arrowleft', 'arrowright'],
            data: {trialphase: "pilt_instruction"},
            response_ends_trial: false,
            simulation_options: {simulate: false},
            on_load: function() {
                const start = performance.now();
                const multiKeysListener = setupMultiKeysListener(
                    ['ArrowRight', 'ArrowLeft'], 
                    function() {
                        jsPsych.finishTrial({
                            rt: Math.floor(performance.now() - start)
                        });
                        // Clean up the event listeners to prevent persistining into the next trial
                        multiKeysListener.cleanup();
                    }
                );
            }
        },
        {
            timeline: build_PILT_task(
                [[
                    {   
                        stimulus_left: demo_stimuli[0],
                        stimulus_right: demo_stimuli[1],
                        stimulus_middle: "",
                        feedback_middle: "",
                        n_stimuli: 2,
                        present_pavlovian: window.session !== "screening",
                        pavlovian_images: pavlovian_images_f(),
                        optimal_side: "",
                        feedback_left: 1,
                        feedback_right: 1,
                        optimal_right: 1,
                        block: "practice1",
                        trial: 1,
                        valence: 0,
                        response_deadline: -1,
                        stimulus_group: 1,
                        stimulus_group_id: 1,
                        n_groups: 1,
                        rest: {},
                        early_stop: false
                    }
                ]],
                false
            )
        }
    );

    inst = inst.concat([{
        type: jsPsychInstructions,
        css_classes: ['instructions'],
        pages: [
            `<p>You found a one pound coin!</p>
            <p>Some cards are better than others, and through trial and error, you can learn which ones are best.</p> 
            <p>However, even the best cards may sometimes give only a penny${window.task == "screening" ? "" : " or occasionally break a one-pound coin"}.</p>`
        ],
        show_clickable_nav: true,
        data: {trialphase: "pilt_instruction"}
    },
    {
        type: jsPsychHtmlKeyboardResponse,
        css_classes: ['instructions'],
        stimulus: `<p>Let's practice collecting coins. \
            On the next screen, choose cards to collect as much money as you can.</p>
            <p>One of the picture cards has mostly £1 coins behind it, while the other has mostly broken £1 coins behind it.</p>
            <p>When you're ready, place your fingers comfortably on the <strong>left and right arrow keys</strong> as shown below. Press down <strong> both left and right arrow keys at the same time </strong> to begin.</p>
            <img src='imgs/PILT_keys.jpg' style='width:250px;'></img>
`,
        // choices: ['arrowleft', 'arrowright'],
        data: {trialphase: "pilt_instruction"},
        response_ends_trial: false,
        simulation_options: {simulate: false},
        on_load: function() {
            const start = performance.now();
            const multiKeysListener = setupMultiKeysListener(
                ['ArrowRight', 'ArrowLeft'], 
                function() {
                    jsPsych.finishTrial({
                        rt: Math.floor(performance.now() - start)
                    });
                    // Clean up the event listeners to prevent persistining into the next trial
                    multiKeysListener.cleanup();
                }
            );
        }

    }]);

    let dumbbell_on_right = shuffleArray([true, true, false, true, false, false], window.session);
    let reward_magnitude = shuffleArray([1, 1, 1, 0.5, 1, 0.5], window.session + "b");

    inst.push(
        {
            timeline: build_PILT_task(
                [
                    dumbbell_on_right.map((e, i) => 
                        ({
                            stimulus_left: e ? demo_stimuli[2] : demo_stimuli[3],
                            stimulus_right: e ? demo_stimuli[3] : demo_stimuli[2],
                            stimulus_middle: "",
                            feedback_middle: "",
                            present_pavlovian: window.session !== "screening",
                            pavlovian_images: pavlovian_images_f(),
                            n_stimuli: 2,
                            optimal_side: "",
                            feedback_left: e ? -1. : reward_magnitude[i],
                            feedback_right: e ? reward_magnitude[i] : -1.,
                            optimal_right: e,
                            block: "practice2",
                            trial: i,
                            valence: 0,
                            stimulus_group: 1,
                            stimulus_group_id: 1,
                            n_groups: 1,
                            rest: {},
                            early_stop: false
                        })
                    )
                ],
                false
            )
        }
    )

    inst = inst.concat(
        [
            inter_block_instruct,
            {
                type: jsPsychInstructions,
                css_classes: ['instructions'],
                pages: [`<p>Before you start playing, you'll answer a few questions about the instructions you just read.</p>
                        <p>You must answer all questions correctly to begin the game.</p>\
                        <p>If not, you can review the instructions and try again.</p>`],
                show_clickable_nav: true,
                data: {trialphase: "pilt_instruction"}
            }
    ]);

    let quiz_questions = [
        {
            prompt: `Some cards are better than others, but even the best cards might only give a penny${window.session !== "screening" ? " or break a £1 coin" : ''}.`,
            options: ["True", "False"],
            required: true
        },
        {
            prompt: `My goal is to collect as much game coins as I can${window.session !== "screening" ? " and avoid losing them" : ''}.`,
            options: ["True", "False"],
            required: true
        },
    ];

    if (window.session !== "screening"){
        quiz_questions.splice(1, 0, {
            prompt: "If I find a broken coin, that means I lose that amount.",
            options: ["True", "False"],
            required: true
        });
    }

    inst.push(
        {
            type: jsPsychSurveyMultiChoice,
            questions: quiz_questions,
            css_classes: ["instructions"],
            preamble: `<div class=instructions><p>For each statement, please indicate whether it is true or false:</p></div>`,
            data: {
                trialphase: "instruction_quiz"
            },
            simulation_options: {
                data: {
                    response: window.session === "screening" ? {
                        Q0: `True`,
                        Q1: `True`
                    } : {
                        Q0: `True`,
                        Q1: `True`,
                        Q2: `True`
                    }
                }
            }   
        }
    );

    inst.push(
        {
            type: jsPsychInstructions,
            css_classes: ['instructions'],
            timeline: [
                {
                    pages: [
                    `<p>You did not answer all the quiz questions correctly. 
                    Please read the instructions again before you continue</p>`
                    ]
                }
            ],
            conditional_function: check_quiz_failed,
            show_clickable_nav: true,
            data: {
                trialphase: "quiz_failure"
            }
        }
    );

    const inst_loop = {
        timeline: inst,
        loop_function: check_quiz_failed
    }


    const inst_total = [
        inst_loop,
        {
            type: jsPsychHtmlKeyboardResponse,
            css_classes: ['instructions'],
            stimulus: `<p>Great! Let's start playing for real.</p>
            <p>You will now complete ${window.session === "screening" ? "another round" : "21 rounds"} of the card choosing game, taking ${window.session === "screening" ? "a couple of minutes" : "15-20 minutes"} on average to complete.</p>
            ${window.session !== "screening" ? "<p>You will be able to take a short break between rounds, if you feel you need it.</p>" : ""}
            <p>When you're ready, place your fingers comfortably on the <strong>left and right arrow keys</strong> as shown below. Press down <strong> both left and right arrow keys at the same time </strong> to begin.</p>
            <img src='imgs/PILT_keys.jpg' style='width:250px;'></img>`,
            choices: ['arrowright', 'arrowleft'],
            data: {trialphase: "pilt_instruction"},
            on_finish: () => {
                jsPsych.data.addProperties({
                    pilt_n_warnings: 0
                });
            },
            response_ends_trial: false,
            simulation_options: {simulate: false},
            on_load: function() {
                const start = performance.now();
                const multiKeysListener = setupMultiKeysListener(
                    ['ArrowRight', 'ArrowLeft'], 
                    function() {
                        jsPsych.finishTrial({
                            rt: Math.floor(performance.now() - start)
                        });
                        // Clean up the event listeners to prevent persistining into the next trial
                        multiKeysListener.cleanup();
                    }
                );
            }
        }
    ]

    return inst_total
} 

function check_quiz_failed() {
    const data = jsPsych.data.get().filter({trialphase: "instruction_quiz"}).last(1).select('response').values[0];

    return !Object.values(data).every(value => value === "True");
}

const lottery_instructions = {
    type: jsPsychInstructions,
    css_classes: ['instructions'],
    pages: [
        `<p>You have almost completed this session!</p>
            <p>Next, we will add to your bonus payment.</p>
            <p>On the next page, you will be presented with a representative sample of the conents 
            your safe. After flipping the cards and shuffling, you will get to chose ${window.context === "relmed" ? "four cards" : "one card"}, which will be added to your bonus.</p>
            <p>Note that broken coins are worth £0.</p>`
    ],
    show_clickable_nav: true,
    data: {trialphase: "lottery_instructions"}
}

// Post-PILT test instructions
const test_instructions = (task) => {
    return {
        type: jsPsychInstructions,
        css_classes: ['instructions'],
        pages: [
            '<p>You will now continue to another round of the card choosing game.</p>\
                <p>On this round you won\'t be able to see the coins you discover and collect. However, they are still being added to your safe.</p>\
                <p>On each trun you will be presented with two cards you already know. Do you best to choose the best card.</p>'
        ],
        show_clickable_nav: true,
        on_start: () => {
            updateState(`${task}_test_instructions_start`);
        },
        data: {trialphase: `post-${task}_test_instructions`},
        on_finish: () => {
            
            jsPsych.data.addProperties({
                [`${task}_test_n_warnings`]: 0
            });

            console.log(jsPsych.data.get().last(1).select(`${task}_test_n_warnings`).values)
        }
    }
}

// LTM instructions
const LTM_instructions = [
    {
        type: jsPsychInstructions,
        css_classes: ['instructions'],
        pages: [
            '<p>You will now play another round of the card choosing game.</p>\
                <p>Your goal remains to add as much money as you can to your safe.</p>',
            `<p>This time, you will choose between three cards on every turn.<p>
            <p>In every triplet, one picture card will always have £1 and 50-pence coins behind it, while the other two cards will have only pennies.<p>
            <p>You can earn more by learning which is the better picture card in each triplet and choosing that card when you next see same triplet.</p>`,
            `<p>Use the right arrow key to choose the card on the right, the left arrow key to choose the card on the left, 
            and <b>use the upwards arrow key to choose the card in the middle.</b>
            `
        ],
        show_clickable_nav: true,
        data: {trialphase: "LTM_instructions"}
    },
    {
        type: jsPsychHtmlKeyboardResponse,
        css_classes: ['instructions'],
        stimulus: `<p>Let's get started!</p>
        <p>You will play one round with no breaks, lasting about 8 minutes.</p>
        <p>When you are ready to start playing, place your fingers on the left, right, and up arrow keys as shown below, and press the up arrow key.</p>
        <img src='imgs/WM_keys.jpg' style='width:250px;'></img>`,
        choices: ['arrowup'],
        data: {trialphase: "LTM_instructions"},
        on_finish: () => {
            jsPsych.data.addProperties({
                ltm_n_warnings: 0
            });
        }
    }
]

// WM instructions
const WM_instructions = [
    {
        type: jsPsychInstructions,
        css_classes: ['instructions'],
        pages: [
            '<p>You will now play another round of the card choosing game.</p>\
                <p>Your goal remains to add as much money as you can to your safe.</p>',
            `<p>This time, you will see only one card on each turn.<p>
            <p>You can flip this card by pressing either the left <span class="spacebar-icon">&nbsp;←&nbsp;</span>, up <span class="spacebar-icon">&nbsp;↑&nbsp;</span>, or right <span class="spacebar-icon">&nbsp;→&nbsp;</span> arrow keys on your keyboard.</p>
            <p>For each card, pressing one of the keys will always reveal £1 and 50-pence coins, while the other two keys will reveal only pennies.<p>
            <p>You can earn more by learning which is the better key to press for each card and pressing that key when you next see same card.</p>`
        ],
        show_clickable_nav: true,
        data: {trialphase: "WM_instructions"}
    },
    {
        type: jsPsychHtmlKeyboardResponse,
        css_classes: ['instructions'],
        stimulus: `<p>Let's get started!</p>
        <p>You will play one round with no breaks, lasting about 8 minutes.</p>
        <p>When you are ready to start playing, place your fingers on the left, right, and up arrow keys as shown below, and press the up arrow key.</p>
        <img src='imgs/WM_keys.jpg' style='width:250px;'></img>`,
        choices: ['arrowup'],
        data: {trialphase: "WM_instructions"},
        on_finish: () => {
            jsPsych.data.addProperties({
                wm_n_warnings: 0
            });
        }
    }
]


