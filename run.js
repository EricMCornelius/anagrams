#!/usr/bin/env node

/*
// creates a trie from a word list
function make_trie(words) {
  var trie = {};

  words.forEach(function(word, idx) {
    if (word.length < 3) return;

    var node = trie;
    word = word.toLowerCase();
    word.split('').forEach(function(char) {
      node[char] = node[char] || {};
      node = node[char];
    });
    node.words = idx;
  });

  return trie;
}
*/

// creates an anagram trie from a word list
function make_trie(words) {
  var trie = {};

  words.forEach(function(word, idx) {
    if (word.length < 3) return;

    var node = trie;
    word = word.toLowerCase().split('').sort();
    word.forEach(function(char) {
      node[char] = node[char] || {};
      node = node[char];
    });
    node.words = (node.words || []).concat(idx);
  });

  return trie;
}

function check_trie(trie, word) {
  var node = trie;
  word = word.toLowerCase().split('');
  for (var idx = 0; idx < word.length; ++idx) {
    node = node[word[idx]];
    if (!node)
      return false;
  };

  return true;
}

// build an anagram trie from the dictionary
var fs = require('fs');
var words = fs.readFileSync('./ospd.txt').toString().split('\n');
var trie = make_trie(words);

// recursion level and character usage array
var count = 0;
var used = [];

// retrieve input, remove spaces, and sort
var input = process.argv[2].split('').filter(function(c) { return c !== ' '; }).sort().join('');
var output = [];

// maximum expected unique words
var num_words = process.argv[3] || 2;

// print the anagrams for the given input
function printAnagrams(input, used, node) {
  // if we're at the root of the trie, and all input characters are used
  if (count === input.length && node === trie) {
    // map the ids to actual words in the dictionary and print them
    // also mark any nodes as seen so they are not repeatedly recursed
    var o = output.map(function(node) { node.seen = true; return node.words.map(function(offset) { return words[offset]; }); });
    if (o.length <= num_words)
      console.log(o);
    return;
  }

  // for every character not used in the input and not repeated already in this recursion,
  // increment the total used counter, move to the next node in the trie, and if it has words,
  // add all the possibilities to the recursive set
  //
  // alternatively continue recursing, since word nodes may hang off the middle of the trie
  var seen = {};
  for (var i = 0; i < input.length; ++i) {
    if (!used[i]) {
      if (seen[input[i]]) continue;
      seen[input[i]] = true;

      used[i] = true;
      ++count;

      var c = input[i];
      var n = node[c];
      if (n) {
        // if this node has any words attached, append them to the current output set
        // and recurse again from the root of the trie - skip this node if it's already
        // been included in an output
        if (n.words && !n.seen) {
          // n.seen = true;
          output.push(n);
          printAnagrams(input, used, trie);
          output.pop();
        }
        printAnagrams(input, used, n);
      }
      
      used[i] = false;
      --count;
    }
  }
}

printAnagrams(input, used, trie);

/*
// permutation printer

var input = process.argv[2];
var output = [];
var count = 0;
var used = [];

function printPerms(input) {
  if (count === input.length) {
    console.log(output.join(''));
    return;
  }

  var started = [];
  for (var i = 0; i < input.length; ++i) {
    if (!used[i]) {
      if (started[input[i]])
        continue;
      started[input[i]] = true;

      output[count++] = input[i];
      used[i] = true;
      printPerms(input);
      used[i] = false;
      --count;
      output.pop();
    }
  }
};

printPerms(input);
*/
