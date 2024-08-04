import Scoreboard from "../src/scoreboard";

describe("Scoreboard", () => {
  let scoreboard: Scoreboard;
  const MILLISECONDS_PER_MINUTE = 60000;

  beforeEach(() => {
    scoreboard = new Scoreboard();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should start a new match with the initial score", () => {
    const matchId = scoreboard.startMatch("Germany", "France");
    const summary = scoreboard.getSummaryForMatch(matchId);
    expect(summary.homeTeam).toBe("Germany");
    expect(summary.awayTeam).toBe("France");
    expect(summary.homeScore).toBe(0);
    expect(summary.awayScore).toBe(0);
    expect(summary.hasEnded).toBe(false);
  });

  it("should update the score of a match", () => {
    const matchId = scoreboard.startMatch("Spain", "Brazil");
    scoreboard.updateScore(matchId, 2, 1);

    const summary = scoreboard.getSummaryForMatch(matchId);
    expect(summary.homeScore).toBe(2);
    expect(summary.awayScore).toBe(1);
    expect(summary.hasEnded).toBe(false);
  });

  it("should finish a match in progress", () => {
    const matchId = scoreboard.startMatch("Mexico", "Canada");
    expect(scoreboard.finishMatch(matchId)).toEqual(new Date());
  });

  it("should get a summary of matches in progress ordered by total score and start time", () => {
    // Mock the system clock using Jest's fake timers to control the start time of each match
    // This ensures that the matches have unique start times, allowing the sorting by start time to work correctly
    jest.useFakeTimers();

    const currentDate = new Date().getTime();
    scoreboard.updateScore(scoreboard.startMatch("Mexico", "Canada"), 0, 5);

    // advance the system time by 1 minute (MILLISECONDS_PER_MINUTE * x) for each new match
    jest.setSystemTime(currentDate + MILLISECONDS_PER_MINUTE * 1);
    scoreboard.updateScore(scoreboard.startMatch("Spain", "Brazil"), 10, 2);

    jest.setSystemTime(currentDate + MILLISECONDS_PER_MINUTE * 2);
    scoreboard.updateScore(scoreboard.startMatch("Germany", "France"), 2, 2);

    jest.setSystemTime(currentDate + MILLISECONDS_PER_MINUTE * 3);
    scoreboard.updateScore(scoreboard.startMatch("Uruguay", "Italy"), 6, 6);

    jest.setSystemTime(currentDate + MILLISECONDS_PER_MINUTE * 4);
    scoreboard.updateScore(scoreboard.startMatch("Argentina", "Australia"), 3, 1);

    const summary = scoreboard.getSummary();

    // assert that the summary matches the expected order of matches
    expect(summary).toMatchObject([
      {
        homeTeam: "Uruguay",
        awayTeam: "Italy",
        homeScore: 6,
        awayScore: 6,
        startTime: new Date(currentDate + MILLISECONDS_PER_MINUTE * 3),
      },
      {
        homeTeam: "Spain",
        awayTeam: "Brazil",
        homeScore: 10,
        awayScore: 2,
        startTime: new Date(currentDate + MILLISECONDS_PER_MINUTE * 1),
      },
      {
        homeTeam: "Mexico",
        awayTeam: "Canada",
        homeScore: 0,
        awayScore: 5,
        startTime: new Date(currentDate),
      },
      {
        homeTeam: "Argentina",
        awayTeam: "Australia",
        homeScore: 3,
        awayScore: 1,
        startTime: new Date(currentDate + MILLISECONDS_PER_MINUTE * 4),
      },
      {
        homeTeam: "Germany",
        awayTeam: "France",
        homeScore: 2,
        awayScore: 2,
        startTime: new Date(currentDate + MILLISECONDS_PER_MINUTE * 2),
      },
    ]);
  });

  it("should not include finished matches in the summary", () => {
    jest.useFakeTimers();

    const currentDate = new Date().getTime();
    const matchId = scoreboard.startMatch("Mexico", "Canada");
    scoreboard.updateScore(matchId, 0, 5);
    scoreboard.finishMatch(matchId);

    jest.setSystemTime(currentDate + MILLISECONDS_PER_MINUTE * 1);
    scoreboard.updateScore(scoreboard.startMatch("Spain", "Brazil"), 10, 2);

    const summary = scoreboard.getSummary();
    // assert that only the last match is included in the summary
    expect(summary).toMatchObject([
      {
        homeTeam: "Spain",
        awayTeam: "Brazil",
        homeScore: 10,
        awayScore: 2,
        startTime: new Date(currentDate + MILLISECONDS_PER_MINUTE * 1),
      },
    ]);
  });
});
