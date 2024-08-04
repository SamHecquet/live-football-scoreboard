import Scoreboard from "../src/scoreboard";
import Match from "../src/match";

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

  it("should get a summary of matches in progress ordered by start time if no team score", () => {
    jest.useFakeTimers();

    const currentDate = new Date().getTime();
    scoreboard.startMatch("Mexico", "Canada")

    jest.setSystemTime(currentDate + MILLISECONDS_PER_MINUTE * 1);
    scoreboard.startMatch("Spain", "Brazil")

    jest.setSystemTime(currentDate + MILLISECONDS_PER_MINUTE * 2);
    scoreboard.startMatch("Germany", "France")

    // assert that the summary matches the expected order of matches by start time descending
    expect(scoreboard.getSummary()).toMatchObject([
      {
        homeTeam: "Germany",
        awayTeam: "France",
        homeScore: 0,
        awayScore: 0,
        startTime: new Date(currentDate + MILLISECONDS_PER_MINUTE * 2),
      },
      {
        homeTeam: "Spain",
        awayTeam: "Brazil",
        homeScore: 0,
        awayScore: 0,
        startTime: new Date(currentDate + MILLISECONDS_PER_MINUTE * 1),
      },
      {
        homeTeam: "Mexico",
        awayTeam: "Canada",
        homeScore: 0,
        awayScore: 0,
        startTime: new Date(currentDate),
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

  describe("Edge Cases", () => {
    it("should not start a game with a team already in a match", () => {
      scoreboard.startMatch("Germany", "France");
      expect(() => scoreboard.startMatch("Germany", "Canada")).toThrow("homeTeam is already in a match");
      expect(() => scoreboard.startMatch("Canada", "Germany")).toThrow("awayTeam is already in a match");
    });

    it("should allow a team to start a new game once its previous game ended", () => {
      const matchId = scoreboard.startMatch("Mexico", "Canada");
      scoreboard.finishMatch(matchId)
      expect(() => scoreboard.startMatch("Mexico", "France")).not.toThrow("homeTeam is already in a match");
    });

    it("should not start a game for a team with an empty name", () => {
      expect(() => scoreboard.startMatch("", "Canada")).toThrow("Home team and away team must be valid strings");
      expect(() => scoreboard.startMatch("Canada", "")).toThrow("Home team and away team must be valid strings");
    });

    it("should not update the score of a match that does not exist", () => {
      const nonExistentMatch = new Match("Mexico", "Canada");
      expect(() => scoreboard.updateScore(nonExistentMatch.id, 0, 5)).toThrow("Match not found");
    });

    it("should not update the score of a game already ended", () => {
      const matchId = scoreboard.startMatch("Spain", "Brazil");
      scoreboard.finishMatch(matchId)
      expect(() => scoreboard.updateScore(matchId, 0, 5)).toThrow(
        "Cannot update game already ended",
      );
    });

    it("should not update the score with negative integers or float numbers", () => {
      const matchId = scoreboard.startMatch("Spain", "Brazil");

      expect(() => scoreboard.updateScore(matchId, -1, 1)).toThrow(
        "Scores must be integers greater than or equal to 0",
      );
      expect(() => scoreboard.updateScore(matchId, 1, -1)).toThrow(
        "Scores must be integers greater than or equal to 0",
      );
      expect(() => scoreboard.updateScore(matchId, 1.5, 2)).toThrow(
        "Scores must be integers greater than or equal to 0",
      );
      expect(() => scoreboard.updateScore(matchId, 1, 2.5)).toThrow(
        "Scores must be integers greater than or equal to 0",
      );
    });

    it("should not finish a match that does not exist", () => {
      const nonExistentMatch = new Match("Uruguay", "Italy");
      expect(() => scoreboard.finishMatch(nonExistentMatch.id)).toThrow("Match not found");
    });

    it("should not return the summary of an inexistant game", () => {
      scoreboard.startMatch("France", "Brazil");
      expect(() => scoreboard.getSummaryForMatch("1722770044738-Spain-Brazil")).toThrow(
        "Match not found",
      );
    });
  });
});
