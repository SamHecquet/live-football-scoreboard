# Live Football World Cup Scoreboard

A simple TypeScript library for tracking and managing the ongoing matches and scores of the FIFA World Cup.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Assumptions and Notes](#assumptions-and-notes)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Running Tests](#running-tests)
- [Authors](#Authors)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The Live Football World Cup Scoreboard library is a lightweight and easy-to-use tool for sports data companies, media outlets, and fan-facing applications that shows all the ongoing matches and their scores.

This library provides a straightforward API to start new matches, update scores, finish matches, and retrieve a summary of all the ongoing matches, ordered by their total score and start time.

## Features

- Start a new match with the initial score of 0-0
- Update the scores of an existing match
- Finish a match in progress
- Retrieve a summary of all the ongoing matches, ordered by total score and start time

## Assumptions and Notes

1. I decided to store the ongoing matches in an object (`{ [key: string]: Match }`) instead of an array.

   - This decision was made to provide faster lookup and retrieval of matches by ID, which is a common operation in the library's API.
   - Using an object allows for constant-time (O(1)) lookups by ID, whereas an array would require linear-time (O(n)) searches to find a match by teams.
   - The trade-off is a slightly higher memory usage, as the object stores the team IDs as keys. However, this was considered an acceptable trade-off for the performance benefit.

2. I assumed that team names are unique, and it will throw an error if a team is already participating in a match.
   To enforce the uniqueness of team names, the library uses a dedicated state `teamsInGame` in a `Set` data structure, which provides constant-time lookups.
   This choice was made to prioritize the efficiency of the `startMatch` method over the slightly higher space complexity.

3. I assumed that the team names are not a finite list of countries, and the only validation required was ensuring they are not empty strings. Otherwise, another approach would have been to create a `Country` type with the countries listed in the task description.

## Installation

Requirements: Node.js (version >= 16).
To install the dependencies, you can use your preferred package manager:

```bash
# using npm
npm install

# using Yarn
yarn install
```

## Usage

Here's a basic example of how to use the Live Football World Cup Scoreboard library:

```typescript
const scoreboard = new Scoreboard();

// Start a new match
const matchId1 = scoreboard.startMatch("Germany", "France");
const matchId2 = scoreboard.startMatch("Uruguay", "Italy");

// Update the score of the match
scoreboard.updateScore(matchId1, 2, 2);
scoreboard.updateScore(matchId2, 6, 6);

// Get a summary of all ongoing matches
const summary = scoreboard.getSummary();
console.log(summary);
// {
//   homeTeam: "Uruguay",
//   awayTeam: "Italy",
//   homeScore: 6,
//   awayScore: 6,
//   startTime: 2024-08-04T15:19:48.745Z,
//   id: '1722784788745-Uruguay-Italy'
// },
// {
//   homeTeam: "Germany",
//   awayTeam: "France",
//   homeScore: 2,
//   awayScore: 2,
//   startTime: 2024-08-04T15:18:48.745Z,
//   id: '1722784728745-Germany-France',
// },

// Finish a match
scoreboard.finishMatch(matchId1);
```

## API Reference

The Live Football World Cup Scoreboard library provides the following API:

- `startMatch(homeTeam: string, awayTeam: string): string`
- `updateScore(matchId: string, homeScore: number, awayScore: number): boolean`
- `finishMatch(matchId: string): Date | undefined`
- `getSummary(): Match[]`
- `getSummaryForMatch(matchId: string): MatchSummary`

## Running Tests

To run tests, run the following command

```bash
  npm run test
```

To run tests in Interactive watch mode:

```bash
  npm run test:watch
```

To generate the code coverage:

```bash
  npm run test:cov
```

## Authors

- [@samhecquet](https://www.github.com/samhecquet)

## Contributing

We welcome contributions to the Live Football World Cup Scoreboard library! If you'd like to contribute, please email samhecquet@gmail.com

## License

This project is licensed under the [MIT](https://choosealicense.com/licenses/mit/) License.
