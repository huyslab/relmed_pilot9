// Prevent refreshing the page
function preventRefresh(e) {
    // Cancel the event
    e.preventDefault();
    e.returnValue = '';
  }
  
// Make sure fullscreen is kept, warn otherwise and return to full screen
const fullscreen_prompt = {
    type: jsPsychFullscreen,
    fullscreen_mode: true,
    css_classes: ['instructions'],
    timeline: [
      {
        message: `<p>This study only runs in full screen mode.<p>
            <p>Press the button below to return to full screen mode and continue.</p>`
      }
    ],
    conditional_function: check_fullscreen,
    on_finish: function() {
      // Update warning count
      var up_to_now = parseInt(jsPsych.data.get().last(1).select('n_warnings').values);
      jsPsych.data.addProperties({
        n_warnings: up_to_now + 1
      });
    },
    data: {
      trialphase: 'fullscreen-prompt'
    }
}

const pre_kick_out_warning = {
    type: jsPsychHtmlKeyboardResponse,
    conditional_function: function() {
      if ((jsPsych.data.get().last(1).select('n_warnings').values[0] >= window.interimWarning) &&
      !jsPsych.data.get().last(1).select('pre_kick_out_warned').values[0]
    ) {
        jsPsych.data.addProperties(
            {
                pre_kick_out_warned: true
            }
        );
        return true;
      } else {
        return false;
      }
    },
    css_classes: ['instructions'],
    timeline: [
        {
            stimulus: `<p>You seem to be taking too long to respond on the tasks.</p>
                <p>Please try to respond more quickly. Also, please keep your attention on the task window, and don't use other tabs or windows.</p>
                <p>If you continue to receive too many warnings, we will have to stop your particpation in this experiment</p>
                <p>Place your fingers back on the keyboard, and press one of the keys your were using for this task to continue.</p>
            `,
            on_start: function(trial) {
                // Save data
                saveDataREDCap(retry = 3);
        }
        }
    ],
    choices: ["arrowright", "arrowleft", "arrowup", "b"],
    data: {
      trialphase: 'pre-kick-out-warning'
    }
}

let kick_out_warning = {}
if (window.context == "relmed") {
    console.log("Relmed context detected");
    kick_out_warning = {
        type: jsPsychHtmlKeyboardResponse,
        conditional_function: function() {
            const n_warnings = jsPsych.data.get().last(1).select('n_warnings').values[0];
            const warned = jsPsych.data.get().select('trialphase').values.includes("speed-accuracy");
          if ((n_warnings == window.maxWarnings) && (!warned)) {
            return true;
          } else {
            return false;
          }
        },
        css_classes: ['instructions'],
        timeline: [
            {
            stimulus: `<p>You might be making taking a little too long to make your choices.</p>
            <p>We're interested in your quick judgments, so please try to respond a little faster—even if it feels a bit less precise.</p>
            <p>Press either the right or left arrow to continue.</p>
            `
            }
        ],
        choices: ["arrowright", "arrowleft"],
        data: {
          trialphase: 'speed-accuracy'
        }
    }    
} else {
    console.log("Prolific context detected");
    console.log(window.context)

    kick_out_warning = {
        type: jsPsychHtmlKeyboardResponse,
        conditional_function: function() {
          if (jsPsych.data.get().last(1).select('n_warnings').values[0] >= window.maxWarnings) {
            return true;
          } else {
            return false;
          }
        },
        css_classes: ['instructions'],
        timeline: [
            {   
                stimulus: '...',
                trial_duration: 200,
                on_finish: function(data) {
                    // Save data
                    saveDataREDCap(retry = 3);
                    // Allow refresh
                    window.removeEventListener('beforeunload', preventRefresh);
                }
            },
            {
            stimulus: `<p>You may not be following the study instructions as intended, as you didn't respond more than 15 times.</p>
                <p>Unfortunately, you cannot continue with this study.</p>
                <p>If you believe this is a mistake, please email haoyang.lu@ucl.ac.uk, explaining the circumstances.</p>
                <p>Please return this study on <a href="https://app.prolific.com/">Prolific</a>.</p>
                <p>You may now close this tab.</p>
            `
            }
        ],
        choices: ["NO_KEYS"],
        data: {
          trialphase: 'kick-out'
        }
    }
    
}
const kick_out = {
    timeline: [
        pre_kick_out_warning,
        kick_out_warning
    ]
}

const create_instruction_kick_out = (task) => {
    if (window.context == "relmed") {
        return undefined;
    } else {
        return {
            type: jsPsychHtmlKeyboardResponse,
            conditional_function: function () {
                if (jsPsych.data.get().last(1).select(`${task}_instruction_fail`).values[0] >= window.max_instruction_fails) {
                    return true;
                } else {
                    return false;
                }
            },
            css_classes: ['instructions'],
            timeline: [
                {
                    stimulus: '...',
                    trial_duration: 200,
                    on_finish: function (data) {
                        // Save data
                        saveDataREDCap(retry = 3);
                        // Allow refresh
                        window.removeEventListener('beforeunload', preventRefresh);
                    }
                },
                {
                    stimulus: `<p>Thank you for your time—unfortunately, it seems that the instructions weren’t fully understood, so we won’t be able to proceed with the experiment.</p>
                    <p>If you believe this is a mistake, please email haoyang.lu@ucl.ac.uk, explaining the circumstances.</p>
                    <p>Please return this study on <a href="https://app.prolific.com/">Prolific</a>.</p>
                    <p>You may now close this tab.</p>
                `
                }
            ],
            choices: ["NO_KEYS"],
            data: {
                trialphase: 'kick-out'
            }
        }
    }
}
  
  // Function that checks for fullscreen
function check_fullscreen(){
    if (window.debug || window.context === "relmed"){
        return false
    }

    var int = jsPsych.data.getInteractionData(),
    exit = int.values().filter(function(e){
        return e.event == "fullscreenexit"
    }),
    enter = int.values().filter(function(e){
        return e.event == "fullscreenenter"
    });

    if (exit.length > 0){
        return exit[exit.length - 1].time > enter[enter.length - 1].time
    }else{
        return false
    }
}

// Post messages to Azure server
function postToParent(message, fallback = () => {}) {
    try {
        if (window.parent && window.parent.postMessage) {
            // Send message to localhost and relmed.ac.uk
            window.parent.postMessage(message, 'http://localhost:3000');
            window.parent.postMessage(message, 'https://relmed.ac.uk');
            window.parent.postMessage(message, 'https://www.relmed.ac.uk');
        } else {
            throw new Error("Parent window or postMessage is unavailable.");
        }
    } catch (error) {
        console.error("Failed to send message to parent window:", error);
    
        // Implement a fallback or handle the error
        fallback();
    }
}

function updateState(state) {

    // Save data to REDCap
    if (!state.includes("no_resume")){
        saveDataREDCap();
    }

    // Update safe state
    updateSafeFun();

    console.log(state);
    postToParent({
        state: state
    });
}

// Save data to REDCap
function saveDataREDCap(retry = 1, extra_fields = {}, callback = () => {}) {

    // Get data, remove stimulus string
    let jspsych_data = jsPsych.data.get().ignore('stimulus').json();

    const data_message = {
        data: {
            record_id: window.participantID + "_" + window.module_start_time,
            participant_id: window.participantID,
            sitting_start_time: window.module_start_time,
            session: window.session,
            module: window.task,
            data: jspsych_data 
        },
        ...extra_fields
    };

    console.log("Data to be sent:", data_message);

    if (window.context === "relmed") {
        postToParent(
            data_message,
            () => {
                setTimeout(function () {
                    saveDataREDCap(retry - 1);
                }, 1000);
            }
        );

        callback();

    } else if (window.context === "prolific") {

        var redcap_record = JSON.stringify([{
            record_id: window.participantID + "_" + window.module_start_time,
            participant_id: window.participantID,
            sitting_start_time: window.module_start_time,
            session: window.session,
            module: window.task,
            data: jspsych_data
        }])
    
        fetch('https://h6pgstm0f9.execute-api.eu-north-1.amazonaws.com/prod/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: redcap_record
        })
        .then(data => {
            if (data.status === 200) {
                console.log('Data successfully submitted to REDCap');
            } else {
                console.error('Error submitting data:', data.message);
            }
            return data.json()
        })
        .then(data => {
            console.log(data)
            callback(); // Call the callback function if submission is successful
        }
        )
        .catch(error => {
            console.error('Error:', error);
            if (retry > 0) {
                console.log('Retrying to submit data...');
                setTimeout(function(){
                    saveDataREDCap(retry - 1);
                }, 1000);
            } else {
                console.error('Failed to submit data after retrying.');
                callback(error); // Call the callback function with the error if retries are exhausted
            }
        });
    }

}

// Function to call at the end of the experiment
function end_experiment() {

    window.removeEventListener('beforeunload', preventRefresh);

    if (window.context === "relmed") {
        saveDataREDCap(10, {
            message: "endTask"
        });
    } else {
        saveDataREDCap(10, {
            message: "endTask"
        }, () => {
            // Redirect
            window.location.replace("https://app.prolific.com/submissions/complete?cc=CQTRGXFP")
        });
    }
}

// Function for formatting data from API
function format_date_from_string(s){
    const dateTime = new Date(s);

    // Get individual components
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(dateTime.getDate()).padStart(2, '0');
    const hours = String(dateTime.getHours()).padStart(2, '0');
    const minutes = String(dateTime.getMinutes()).padStart(2, '0');
    const seconds = String(dateTime.getSeconds()).padStart(2, '0');

    // Format the date and time
    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    return formattedDate + "_" + formattedTime
}

// Functions for computing remaining feedback after early stop
function countPILTAfterLastNonPILT(arr) {
    let count = 0;
    let foundNonPILT = false;
    
    // Iterate from the end to the beginning of the array
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] !== "PILT") {
        // If a non-PILT string is found, stop the iteration
        foundNonPILT = true;
        break;
      } else {
        // If foundNonPILT is true and we encounter "PILT", increase the count
        count++;
      }
    }
  
    return count;
}

// Find maximum of two vectors in each positin, and return sum
function getSumofMax(arr1, arr2) {
    function add(accumulator, a) {
        return accumulator + a;
      }
      
// Assuming arr1 and arr2 are of the same length
    return arr1.map((value, index) => Math.max(value, arr2[index])).reduce(add, 0);
}

// Extract observed coins for lottery
function get_coins_from_data() {

    // Get PILT trials
    let trials = jsPsych.data.get().filter({trial_type: "PILT"});

    // Get block numbers for filtering
    let blocks = trials.select('block').values;

    // Get left and right outcome for each trial
    let feedback_right = trials.select('feedback_right').values;
    let feedback_left = trials.select('feedback_left').values;
    let feedback_middle = trials.select('feedback_middle').values;

    // Get response
    let response = trials.select('response').values;

    // Get presented feedback
    let chosen_feedback = trials.select('chosen_feedback').values;

    let coins_for_lottery = []
    for (i=0; i<response.length; i++){

        // Skip practice blocks
        if (typeof blocks[i] !== "number"){
            continue
        }

        // Worst outcome for missed response
        if (response[i] === "noresp"){
            const worst = Math.min(...[feedback_right[i], feedback_left[i], feedback_middle[i]].filter(item => typeof item === 'number'));

            coins_for_lottery.push(worst);
        } else {
            coins_for_lottery.push(chosen_feedback[i]);
        }
        
    }

    // Get reversal trials
    trials = jsPsych.data.get().filter({trial_type: "reversal"});

    // Get left and right outcome for each trial
    feedback_right = trials.select('feedback_right').values;
    feedback_left = trials.select('feedback_left').values;
    
    // Get response
    response = trials.select('response').values;

    // Get chosen feedback
    chosen_feedback = trials.select('chosen_feedback').values;

    for (i=0; i<response.length; i++){

        // Worst outcome for missed response
        if ((response[i] !== "right") & (response[i] !== "left")){
            const worst = Math.min(feedback_right[i], feedback_left[i]);

            coins_for_lottery.push(worst);
        } else {
            coins_for_lottery.push(chosen_feedback[i]);
        }
        
    }

    return coins_for_lottery
}

// Calculate the frequency of each unique value in the array
function calculateFrequencies(array) {
    const frequencyMap = {};
    array.forEach(value => {
        if (frequencyMap[value]) {
            frequencyMap[value]++;
        } else {
            frequencyMap[value] = 1;
        }
    });
    return frequencyMap;
}

// Function that adds up two frequency objects
function addFrequencyVectors(freq1, freq2) {
    const result = { ...freq1 };

    for (const key in freq2) {
        if (result[key]) {
            result[key] += freq2[key];
        } else {
            result[key] = freq2[key];
        }
    }

    return result;
}

// Function to calculate proportions from a frequency map
function calculateProportions(frequencyMap) {
    // Calculate the total size from the sum of all frequencies
    let totalSize = 0;
    for (let value in frequencyMap) {
        totalSize += frequencyMap[value];
    }
    
    // Convert frequencies to proportions
    const proportionMap = {};
    for (let value in frequencyMap) {
        proportionMap[value] = frequencyMap[value] / totalSize;
    }
    return proportionMap;
}

// Get the current safe state and update it with new data
function updateSafeFrequencies() {
    // Get the state of safe from the URL variable, or set it to an empty object if not present
    const last_safe_state = window.session_state["safe"] || {};

    console.log("Last safe state:", last_safe_state);

    // Get the current state of the safe from the data
    const current_safe = calculateFrequencies(get_coins_from_data());

    // Add the current state to the last state
    return addFrequencyVectors(last_safe_state, current_safe);
}

// Function to update the safe state and send it back to the parent window
function updateSafeFun() {

    // Call the function to update the safe state
    const updated_safe = updateSafeFrequencies();

    console.log("Updated safe state:", updated_safe);

    let updated_session_state_obj = window.session_state || {};
    updated_session_state_obj["safe"] = updated_safe;

    // Send the updated state back to the parent window
    postToParent({
        session_state: JSON.stringify(updated_session_state_obj)
    });
}

const updateSafe = {
    type: jsPsychCallFunction,
    func: updateSafeFun
}

// Create a represantative array of coins of n length
function createProportionalArray(proportionMap, newSize) {
    
    // Step 3: Calculate the counts for the new array
    const newCounts = {};
    let sumCounts = 0;
    for (let value in proportionMap) {
        newCounts[value] = Math.floor(proportionMap[value] * newSize);
        sumCounts += newCounts[value];
    }

    // Step 4: Distribute the remaining elements to ensure the new array has the correct size
    let remainingElements = newSize - sumCounts;
    while (remainingElements > 0) {
        for (let value in newCounts) {
            if (remainingElements > 0) {
                newCounts[value]++;
                remainingElements--;
            }
        }
    }

    // Step 5: Create the new array based on the calculated counts
    const newArray = [];
    for (let value in newCounts) {
        for (let i = 0; i < newCounts[value]; i++) {
            newArray.push(parseFloat(value)); // Convert the key back to float
        }
    }

    return newArray;
}

// Compute the remaining nubmer of 1 pound, 50 pence, 1 penny, when they are the best option.
function computeBestRest(structure){

    // Pass null if null
    if (structure == null) {
        return null
    }

    for (let b=0; b<structure.length; b++){

        // Initiate counter at last trial as zero
        structure[b][structure[b].length - 1].rest = {};

        // Compute reverse cumulative sums
        for (let i = structure[b].length - 2; i >= 0; i--) {
            const next_optimal_outcome = (structure[b][i + 1].n_stimuli === 2) ? 
            (structure[b][i + 1].optimal_right ? structure[b][i + 1].feedback_right : structure[b][i + 1].feedback_left) :
            (structure[b][i + 1][`feedback_${structure[b][i + 1].optimal_side}`]);

            // Copy the rest object from the next trial
            structure[b][i].rest = { ...structure[b][i + 1].rest };

            // Update the count for the next optimal outcome
            const outcomeKey = next_optimal_outcome.toString();
            if (structure[b][i].rest[outcomeKey]) {
            structure[b][i].rest[outcomeKey]++;
            } else {
            structure[b][i].rest[outcomeKey] = 1;
            }
        }
    }
}

// Count occurances
function countOccurrences(array) {
    const counts = new Map();
  
    array.forEach(float => {
      if (counts.has(float)) {
        counts.set(float, counts.get(float) + 1);
      } else {
        counts.set(float, 1);
      }
    });
  
    return Object.fromEntries(counts);
}

function isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}


// Function to compile inter_block_stimulus
function inter_block_stimulus(){

    const last_trial = jsPsych.data.get().filter({trial_type: "PILT"}).last(1);

    // Valence of block
    const valence = last_trial.select("valence").values[0];
    
    // Block number for filtering
    const block = last_trial.select('block').values[0];

    // Number of pairs in block
    const n_groups = last_trial.select("n_groups").values[0]

    // Number of stimuli in block
    const n_stimuli = last_trial.select("n_stimuli").values[0];

    // Are there 50pence coins in the block?
    const feedbacks = jsPsych.data.get().filter({trial_type: "PILT", block: block}).select("feedback_right").values;
    const fifty = feedbacks.includes(0.5) || feedbacks.includes(-0.5);
    console.log(fifty)

    // Find chosen outcomes for block
    let chosen_outcomes = jsPsych.data.get().filter({trial_type: "PILT",
        block: block
    }).select('chosen_feedback').values;

    // Summarize into counts
    chosen_outcomes = countOccurrences(chosen_outcomes);

    // Initiate text
    let txt = ``

    // Add text and tallies for early stop
    if (window.skipThisBlock && window.task !== "screening"){
        
        txt += `<p>You've found the better ${n_groups > 1 ? "cards" : "card"}.</p><p>You will skip the remaining turns and `;
        
        txt += valence >= 0 ? `collect the remaining coins hidden under ` : 
            `lose only the remaining coins hidden under `;

        txt +=  n_groups > 1 ? "these cards." : "this card."
        
        if (valence != 0){
             txt += `<p>Altogether, these coins were ${valence == 1 ? "added to your safe" : "broken in your safe"} on this round:<p>`;
        }
       
        
        // Add rest to outcomes
        if (window.task !== "screening"){
            Object.keys(last_trial.select('rest').values[0]).forEach(key => {
                chosen_outcomes[key] += last_trial.select('rest').values[0][key];
            });
        }

    } else if (valence != 0) {
        txt += `<p><img src='imgs/safe.png' style='width:100px; height:100px;'></p>
        <p>These coins ${isValidNumber(block) ? "were" : "would have been"} 
        ${valence == 1 ? "added to your safe" : "broken in your safe"} on this round:</p>`
    }

    if (valence == 1){

        txt += `<div style='display: grid'><table><tr>
            <td><img src='imgs/1pound.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td>`
        
        if (fifty){
            txt +=  `<td><img src='imgs/50pence.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'</td>`
        }
           
        txt += `<td><img src='imgs/1penny.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td>
            </tr>
            <tr>
            <td>${isValidNumber(chosen_outcomes[1]) ? chosen_outcomes[1] : 0}</td>`;

        if (fifty) {
            txt += `<td>${isValidNumber(chosen_outcomes[0.5]) ? chosen_outcomes[0.5] : 0}</td>`
        }    
            
        txt += `<td>${isValidNumber(chosen_outcomes[0.01]) ? chosen_outcomes[0.01] : 0}</td>
            </tr></table></div>`;
    } else if (valence == -1) {
        txt += `<div style='display: grid'><table>
            <tr><td><img src='imgs/1poundbroken.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td>`
            
        if (fifty){
            txt += `<td><img src='imgs/50pencebroken.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'</td>`;
        }
            
        txt += `<td><img src='imgs/1pennybroken.png' style='width:${small_coin_size}px; height:${small_coin_size}px;'></td>
            </tr>
            <tr>
            <td>${isValidNumber(chosen_outcomes[-1]) ? chosen_outcomes[-1] : 0}</td>`

        if (fifty){
            txt += `<td>${isValidNumber(chosen_outcomes[-0.5]) ? chosen_outcomes[-0.5] : 0}</td>`;
        }
            
        txt += `<td>${isValidNumber(chosen_outcomes[-0.01]) ? chosen_outcomes[-0.01] : 0}</td>
            </tr></table></div>`;
    } else {
        const earnings = Object.entries(chosen_outcomes).reduce((sum, [value, count]) => {
            // Convert string keys to numbers explicitly for reliable calculation
            return sum + (Number(value) * count);
        }, 0);

        txt += `<p>Altogether on this round, you've ${earnings >= 0 ? "collected" : "lost"} coins worth £${Math.abs(earnings).toFixed(2)}.</p>`;
        
    }

    if (isValidNumber(block)){
        txt += n_stimuli === 2 ? `<p>Press the right arrow to continue.</p>` :
         `<p>Place your fingers on the left, right, and up arrow keys, and press either one to continue.</p>`
    }

    return txt
}


// Function to shuffle arrays in a consistent manner by using a string to set random seed
// Function to generate a numeric seed from a string
function stringToSeed(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash;
}

// Simple LCG (Linear Congruential Generator) for pseudo-random numbers
function seededRandom(seed) {
    return function() {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return (seed >>> 16) / 65536;
    };
}

// Fisher-Yates shuffle with seeded RNG
function shuffleArray(arr, seedString) {
    let seed = stringToSeed(seedString);
    let random = seededRandom(seed);
    let shuffled = arr.slice(); // Clone the array to avoid mutation

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Warnings for unresponsive trials
/**
 * Determines whether a warning can be shown for a given task on this trial.
 *
 * This function checks multiple conditions to decide if a warning should be displayed:
 * 1. The total number of warnings issued so far for the specified task (`${task}_n_warnings`) 
 *    is less than the maximum allowed (`window.max_warnings_per_task`).
 * 2. The warning was not already shown in the specified number of trials back 
 *    (default is the last trial, useful for pre-trial computations; change to 2 for post-trial computations). This is determined either by:
 *  a. The last trial's `trialphase` is `"no_choice_warning"` (used for tasks with external warning messages).
 *  b. Checking data field `"response_deadline_warning"` for the last task trial (used for tasks with interal warning messages).
 * 5. If `window.context` is `"prolific"`, a warning is always allowed, overriding other conditions.
 *
 * @param {string} task - The name of the task, used to track task-specific warnings.
 * @param {number} [warning_expected_n_back=1] - The number of trials back to check 
 *        whether a warning was already shown.
 * @returns {boolean} - Returns `true` if a warning can be shown, otherwise `false`.
 */
const can_be_warned = (task, warning_expected_n_back = 1) => {
    // Fetch number of previous warnings on this task
    const task_n_warnings = jsPsych.data.get().last(1).select(`${task}_n_warnings`).values[0] ?? 0;
    
    // Check the type of last trial. For tasks with external warning messages this would be "no_choice_warning"
    const last_trial = jsPsych.data.get().last(warning_expected_n_back).select("trialphase").values[0];
    
    // Check for a data field documenting warning message shown. For tasks with internal warning messages this would be "response_deadline_warning"
    const last_trial_shown = jsPsych.data.get().filter({trialphase: task}).last(warning_expected_n_back).select("response_deadline_warning").values[0] ?? false;

    return ((task_n_warnings < window.max_warnings_per_task) && (last_trial !== "no_choice_warning") && (!last_trial_shown)) || (window.context === "prolific");
};


// Function to create and show warning
function showTemporaryWarning(message, duration = 800) {
    // Create warning element
    const warningElement = document.createElement('div');
    warningElement.id = 'vigour-warning-temp';
    warningElement.innerText = message;

    // Style the warning
    warningElement.style.cssText = `
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        background-color: rgba(244, 206, 92, 0.9);
        padding: 15px 25px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 24px;
        font-weight: 500;
        color: #182b4b;
        opacity: 0;
        transition: opacity 0.2s ease;
        text-align: center;
        letter-spacing: 0.0px;
    `;

    // Add to document body
    document.body.appendChild(warningElement);

    // Force reflow to ensure transition works
    warningElement.offsetHeight;

    // Show warning
    warningElement.style.opacity = '1';

    // Remove after duration
    setTimeout(() => {
        warningElement.style.opacity = '0';
        setTimeout(() => {
            warningElement.remove();
        }, 200); // Wait for fade out transition
    }, duration);
}

function noChoiceWarning(resp_var = "response", stimulus = "", task = "") {
    const warning_trial = {
        timeline: [{
            type: jsPsychHtmlKeyboardResponse,
            choices: "NO_KEYS",
            stimulus: stimulus,
            data: {
                trialphase: "no_choice_warning"
            },
            trial_duration: 1000,
            on_load: function () {
                showTemporaryWarning("Don't forget to participate!", 800);
            }
        }],
        conditional_function: function () {
            const last_trial_choice = jsPsych.data.get().last(1).select(resp_var).values[0];

            return (last_trial_choice === null) && can_be_warned(task, 2)
            
        },
        on_finish: () => {
            // Update task warning counter if can be warned on this trial
            const task_n_warnings = jsPsych.data.get().last(1).select([`${task}_n_warnings`]).values[0];
            jsPsych.data.addProperties({
                [`${task}_n_warnings`]: task_n_warnings + 1
            });
        }
    }
    return warning_trial;
};

function setupMultiKeysListener(keysToTrack, callback_function, targetElement = document) {
    const pressedKeys = {};

    // Named functions are required for proper removal
    function handleKeyDown(event) {
        pressedKeys[event.key] = true;
        areKeysPressed() ? callback_function() : null;
    }

    function handleKeyUp(event) {
        pressedKeys[event.key] = false;
    }

    targetElement.addEventListener('keydown', handleKeyDown);
    targetElement.addEventListener('keyup', handleKeyUp);

    function areKeysPressed() {
        return keysToTrack.every(key => pressedKeys[key] === true);
    }

    // Cleanup function to remove listeners
    function cleanup() {
        targetElement.removeEventListener('keydown', handleKeyDown);
        targetElement.removeEventListener('keyup', handleKeyUp);
    }

    return {
        // areKeysPressed,
        cleanup
    };
}

function computeTotalBonus(){
    const pilt_bonus = computeRelativePILTBonus();
    const vigour_pit_bonus = computeRelativeVigourPITBonus();
    const control_bonus = computeRelativeControlBonus();

    const total_earned = pilt_bonus["earned"] + vigour_pit_bonus["earned"] + control_bonus["earned"];
    const min_total = pilt_bonus["min"] + vigour_pit_bonus["min"] + control_bonus["min"];
    const max_total = pilt_bonus["max"] + vigour_pit_bonus["max"] + control_bonus["max"];
    
    return ((total_earned - min_total) / (max_total - min_total) * 3);
}

const bonus_trial = {
    type: jsPsychHtmlButtonResponse,
    css_classes: ['instructions'],
    stimulus: function (trial) {
        let stimulus =  "Congratulations! You are nearly at the end of this session!"      
        const total_bonus = computeTotalBonus();
        stimulus += `
                <p>It is time to reveal your total bonus payment for this session.</p>
                <p>Altogether, you will earn an extra ${total_bonus.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}.</p>
            `;
        return stimulus;
    },
    choices: ['Continue'],
    data: { trialphase: 'vigour_bonus' },
    on_start: () => {
      updateState(`bonus_trial`);
    },
    on_finish: (data) => {
      data.total_bonus = computeTotalBonus().toFixed(2);
      
      updateState('bonus_trial_finished');
    },
    simulation_options: {
      simulate: false
    }
  };
  