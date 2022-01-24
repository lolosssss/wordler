<script >
import axios from 'axios';

export default {
  data: () => ({
    words: [],
    currentWord: 'atone',
    currentWordLetters: ['a', 't', 'o', 'n', 'e'],
    letterStatus: [3, 3, 3, 3, 3],
    hasError: [false, false, false, false, false],
    hasFailed: false,
    bgClasses: ['bg-correct', 'bg-present', 'bg-absent'],
    textClasses: ['text-correct', 'text-present', 'text-absent'],
    previousWords: [],
    previousStatus: [],
    presentLetters: new Set(),
    presents: [new Set(), new Set(), new Set(), new Set(), new Set()],
    absents: new Set(),
    tryCnt: 0
  }),
  mounted: function () {
    this.getWords();
  },
  methods: {
    getWords: function () {
      axios.get('words.txt')
        .then(response => {
          this.words = response.data.split('\n');
        })
        .catch(error => {
          console.log(error);
        });
    },
    changeState(idx) {
      if (this.hasFailed) return;
      if (this.previousStatus.length > 0 && this.previousStatus[0][idx] === 0) return;
      let currentState = this.letterStatus[idx];
      this.letterStatus[idx] = (currentState + 1) % 3;
      this.hasError[idx] = false;
    },
    next() {
      if (!this.check() || this.hasFailed) {
        return;
      }

      // push the current word to the previous words array head
      this.previousWords.unshift(this.currentWord.split(''));
      this.previousStatus.unshift(this.letterStatus.slice());

      let regStr = ''
      this.currentWordLetters.forEach((letter, idx) => {
        if (this.letterStatus[idx] === 0) {
          regStr += letter;
        } else if (this.letterStatus[idx] === 1) {
          this.presents[idx].add(letter);
          this.presentLetters.add(letter);
          regStr += '[^' + Array.from(this.presents[idx]).join('') + ']';
        } else {
          this.absents.add(letter);
          regStr += '.'
        }
      });
      // console.log(regStr);
      let newWords = this.words.filter(word => {
        // word match regStr and contains present letters
        if (!new RegExp(regStr).test(word)) return false;

        if (!Array.from(this.presentLetters).every(letter => word.includes(letter))) {
          return false;
        }

        if (Array.from(this.absents).some(letter => word.includes(letter))) {
          return false;
        }
        if (this.tryCnt < 2) {
          // check if word contains duplicate letters
          if (new Set(word.split('')).size !== word.length) {
            return false;
          }
        }

        return true;
      });
      console.log(newWords);
      this.currentWord = newWords[Math.floor(Math.random() * newWords.length)];
      // console.log(this.currentWord);
      this.currentWordLetters = this.currentWord.split('');
      // console.log(this.currentWordLetters)

      if (this.previousWords.length >= 5) {
        this.hasFailed = true;
      }

      this.previousStatus.length > 0 & this.previousStatus[0].forEach((status, idx) => {
        if (status === 0) {
          this.letterStatus[idx] = status;
        } else {
          this.letterStatus[idx] = 3;
        }
      });
      this.tryCnt++;
    },
    check() {
      // check if all the letters' status is valid
      if (this.letterStatus.includes(3)) {
        console.log(this.letterStatus);
        this.letterStatus.forEach((status, idx) => {
          if (status === 3) {
            this.hasError[idx] = true;
          }
        });
        return false;
      }
      return true;
    }
  }
}
</script>

<template>
  <div class="font-mono text-zinc-700 flex flex-col items-center">
    <h3
      class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-absent via-present to-correct"
    >Help you solve wordle.</h3>
    <div class="text-3xl font-bold underline">{{ currentWord }}</div>
    <div class="text-xl font-bold text-gray-400">Tap the letter.</div>
    <div class="flex flex-row items-center justify-center">
      <div v-for="(letter, idx) in currentWordLetters" :key="letter + idx" class="uppercase">
        <div
          :class="[{ 'shadow-md shadow-red-600 border-2 border-red-600': hasError[idx], 'text-white': letterStatus[idx] < 3 }, bgClasses[letterStatus[idx]]]"
          class="border-2 border-zinc-700 rounded text-6xl m-2 p-2 cursor-pointer select-none"
          @click="changeState(idx)"
        >
          <div>{{ letter }}</div>
        </div>
      </div>
    </div>
    <div
      :class="{ 'bg-gray-300': hasFailed }"
      class="w-fit px-4 py-2 border-2 rounded-xl bg-cyan-600 shadow-md hover:shadow-none hover:translate-y-px hover:translate-x-px text-white cursor-pointer"
      @click="next"
    >Next!</div>
    <div>
      <div v-for="(word, widx) in previousWords" :key="word" class="flex flex-row text-4xl">
        <div
          v-for="(letter, lidx) in word"
          :key="letter + lidx"
          :class="[textClasses[previousStatus[widx][lidx]]]"
        >{{ letter }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
