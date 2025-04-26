export const calculateWinLossAndRateByChampion = (participants) => {
  const championStats = {};

  participants.forEach((participant) => {
    const champion = participant.SKIN || participant.skin; // 챔피언 이름
    const isWin = participant.WIN === "Win"; // 승리 여부

    if (!championStats[champion]) {
      championStats[champion] = { wins: 0, losses: 0 };
    }

    if (isWin) {
      championStats[champion].wins += 1;
    } else {
      championStats[champion].losses += 1;
    }
  });

  return Object.entries(championStats).map(([champion, stats]) => ({
    champion,
    wins: stats.wins,
    losses: stats.losses,
    winRate: (stats.wins / (stats.wins + stats.losses)) * 100 + "%", // 승률 계산
  }));
};
