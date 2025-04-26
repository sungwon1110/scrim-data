export const groupBySummonerId = (jsonData) => {
  const grouped = jsonData.reduce((acc, data) => {
    const gameVersion = data.gameVersion; // 게임 버전 추가
    data.participants.forEach((participant) => {
      const summonerId = participant.summonerId || participant.SUMMONER_ID;
      if (!acc[summonerId]) {
        acc[summonerId] = { summonerId, gameVersion, participants: [] };
      }
      acc[summonerId].participants.push(participant);
    });
    return acc;
  }, {});

  // 객체를 배열로 변환
  return Object.values(grouped);
};
