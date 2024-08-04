import Match from "./match";

export default class Scoreboard {
  /**
   * Dictionary that stores all the matches, where the key is the match's ID
   */
  private matches: { [key: string]: Match } = {};

  /**
   * Set that stores the names of all the teams that are currently participating in a match.
   */
  private teamsInGame: Set<string> = new Set();

  startMatch(homeTeam: string, awayTeam: string): string {
    if (homeTeam === "" || awayTeam === "") {
      throw new Error("Home team and away team must be valid strings");
    }

    // Check if either team is already participating in a match
    if (this.teamsInGame.has(homeTeam)) {
      throw new Error("homeTeam is already in a match");
    }
    if (this.teamsInGame.has(awayTeam)) {
      throw new Error("awayTeam is already in a match");
    }

    const match = new Match(homeTeam, awayTeam);
    this.matches[match.id] = match;

    // add the teams to the set of teams in a match to prevent them from starting another match
    this.teamsInGame.add(homeTeam);
    this.teamsInGame.add(awayTeam);

    return match.id;
  }


  updateScore(matchId: string, home: number, away: number): boolean {
    if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) {
      throw new Error("Scores must be integers greater than or equal to 0");
    }

    this.getMatchForUpdate(matchId).updateScore(home, away);
    return true;
  }

  finishMatch(matchId: string): Date | undefined {
    const match = this.getMatchForUpdate(matchId);
    const endTime = match.end();

    // remove the teams from the set of teams currently in a match to allow them to start another match
    this.teamsInGame.delete(match.awayTeam);
    this.teamsInGame.delete(match.homeTeam);

    return endTime;
  }

  /**
   * Return a summary of all the ongoing matches
   * sorted first by the total score (descending) and then by the start time (descending).
   */
  getSummary(): Match[] {
    return Object.values(this.matches)
      .filter((match) => !match.endTime)
      .sort((a, b) => {
        const scoreA = a.homeScore + a.awayScore
        const scoreB = b.homeScore + b.awayScore

        // if the total scores are equal, sort by the start time (descending)
        if (scoreA === scoreB) {
          return b.startTime.getTime() - a.startTime.getTime()
        }

        // or sort by the total score (descending)
        return scoreB - scoreA
      })
  }

  getSummaryForMatch(matchId: string): {
    homeScore: number;
    awayScore: number;
    homeTeam: string;
    awayTeam: string;
    startTime: Date;
    endTime: Date | undefined;
    hasEnded: boolean;
  } {
    const match = this.matches[matchId];
    if (!match) {
      throw new Error("Match not found");
    }

    return {
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      startTime: match.startTime,
      endTime: match.endTime,
      hasEnded: !!match.endTime,
    };
  }

  private getMatchForUpdate(matchId: string): Match {
    const match = this.matches[matchId];

    if (!match) {
      throw new Error("Match not found");
    }

    if (match.endTime) {
      throw new Error("Cannot update game already ended");
    }

    return match;
  }
}
