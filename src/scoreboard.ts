import Match from "./match";

export default class Scoreboard {
  /**
   * Dictionary that stores all the matches, where the key is the match's ID
   */
  private matches: { [key: string]: Match } = {};

  startMatch(homeTeam: string, awayTeam: string): string {
    const match = new Match(homeTeam, awayTeam);
    this.matches[match.id] = match;

    return match.id;
  }


  updateScore(matchId: string, home: number, away: number): boolean {
    this.getMatchForUpdate(matchId).updateScore(home, away);
    return true;
  }

  finishMatch(matchId: string): Date | undefined {
    const match = this.getMatchForUpdate(matchId);
    const endTime = match.end();

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
