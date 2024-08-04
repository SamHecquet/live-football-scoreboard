export default class Match {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  startTime: Date;
  endTime: Date | undefined;
  id: string;

  constructor(homeTeam: string, awayTeam: string) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.homeScore = 0;
    this.awayScore = 0;
    this.startTime = new Date();
    this.id = `${this.startTime.getTime()}-${this.homeTeam}-${this.awayTeam}`;
  }

  updateScore(homeScore: number, awayScore: number): void {
    this.homeScore = homeScore;
    this.awayScore = awayScore;
  }

  end(): Date {
    this.endTime = new Date();
    return this.endTime;
  }
}
