function updateProbabilitiesInBranch(branch, newPossibility) {
    // Total possibilities before the new one
    const oldTotal = branch[0] - 1
    // If it's a new possibility, initialize it with a 0% chance
    if (!branch[1][newPossibility]) branch[1][newPossibility] = 0
    // Iterate through the possibilities to update their probabilities
    for (possibility in branch[1]) {
        // If it's the new one, add one to the total and calculate the new probability
        if (possibility === newPossibility) {
            const newAmmount = branch[1][possibility] * oldTotal + 1
            branch[1][possibility] = newAmmount / branch[0]
            // Otherwise calculate the ammount based on the possibility and then update it
        } else {
            const ammount = branch[1][possibility] * oldTotal
            branch[1][possibility] = ammount / branch[0]
        }
    }
    // Return the branch with the updated possibilities
    return branch
}


function getRandomOptionFromBranch(branch) {
    const rnd = Math.random()
    let cumulative = 0
    // Iterate through the probabilities 
    for (possibility of Object.entries(branch[1])) {
        const prob = possibility[1]
        if (rnd >= cumulative && rnd < cumulative + prob) {
            return possibility[0]
        } else {
            cumulative += prob
        }
    }
}

function getRandomItemFromArray(array) {
    const randomIndex = Math.floor(Math.random() * array.length)
    return array[randomIndex]
}

const markov = {
    /**
     * Generates a markov chain tree based on an array of text.
     * @param {array} phrases - The phrases to be processed
     * @param {object} options - Options
     */
    generateChain: (phrases = [], chainOptions = {}) => {
        const options = {
            limitStartingWords: true,
            ...chainOptions
        }
        //Initialize the chain and add the starting positions array if necessary
        const markovChain = { tree: {} }
        if (options.limitStartingWords) markovChain.startsBranch = [0, {}]

        phrases.forEach(phrase => {
            // Apply toLowerCase
            phrase = phrase.toLowerCase()
            // Match the words and if necessary the punctuation
            if (!phrase.match(/([\wçüéâäàêëèïîìôòõûùÿáíóúãýßöøæåñ]+['-]*[\wçüéâäàêëèïîìôõòûùÿáíóúãýßöøæåñ]*)|([,.!?])/g)) return
            const textArray = phrase.match(/([\wçüéâäàêëèïîìôòõûùÿáíóúãýßöøæåñ]+['-]*[\wçüéâäàêëèïîìôòõûùÿáíóúãýßöøæåñ]*)|([,.!?])/g)
            textArray.forEach((word, index) => {
                // If the current word or the next word is blank, skip
                if (!word || !textArray[index + 1]) return

                const nextWord = textArray[index + 1]
                const wordPair = word + " " + nextWord

                if (options.limitStartingWords && !markovChain.startsBranch[1][wordPair] && index === 0) {
                    markovChain.startsBranch[0] += 1
                    markovChain.startsBranch = updateProbabilitiesInBranch(markovChain.startsBranch, wordPair)
                }

                // Initialize the branch if it's a new possibility
                if (!markovChain.tree[wordPair]) {
                    // 0 -> number of continuations calculated
                    // {} -> continuations and their probabilities
                    markovChain.tree[wordPair] = [0, {}]
                }

                // Checks the word after current pair,
                // if it's the end of the phrase set it to "[end]" as a placeholder
                const nextNextWord = textArray[index + 2] ? textArray[index + 2] : "[end]"

                // Increase the total number of continuations in the branch
                markovChain.tree[wordPair][0] += 1
                // Update the branch
                markovChain.tree[wordPair] = updateProbabilitiesInBranch(markovChain.tree[wordPair], nextNextWord)
            })

        })
        // Return the chain
        return markovChain
    },
    /**
     * Generates a phrase from the selected chain
     * @param {*} chain - The markov chain object
     */
    generatePhraseFromChain: (chain) => {
        // Initialize the phrase
        let phraseArray = []
        // If the chain supports it, start from one of the starting positions
        if (chain.startsBranch) {
            phraseArray = getRandomOptionFromBranch(chain.startsBranch).split(' ')
        // Otherwise start from a random one
        } else {
            phraseArray = getRandomItemFromArray(Object.keys(chain.tree)).split(' ')
        }
        while (true) {
            // Look in the branch formed by the last two words of the phrase
            const currentBranch = `${phraseArray[phraseArray.length - 2]} ${phraseArray[phraseArray.length - 1]}`
            // If there are none, end the phrase
            if (!chain.tree[currentBranch]) {
                phraseArray.push('.')
                break
            }
            // Otherwise, randomly select the next work using the probabilities in the branch
            const nextWord = getRandomOptionFromBranch(chain.tree[currentBranch])
            // If it's the ending tag, end the phrase
            if (nextWord === "[end]") {
                phraseArray.push('.')
                break
            }
            // Otherwise add the word to the phrase
            phraseArray.push(nextWord)
        }
        // Return the phrase with proper punctuation formatting
        const phrase = phraseArray.join(' ').replace(/ +, +/g, ', ').replace(/ +\. */g, '. ')
        return phrase.charAt(0).toUpperCase() + phrase.slice(1)
    }
}

module.exports = markov
