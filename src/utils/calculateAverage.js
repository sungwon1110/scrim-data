export const calculateAverage = (participants, key1, key2) => {
  const total = participants.reduce((sum, participant) => {
    const value = parseFloat(participant[key1] || participant[key2]) || 0; // 두 키 중 하나의 값을 가져옴
    return sum + value;
  }, 0);
  return (total / participants.length).toFixed(2); // 평균 계산, 소수점 2자리
};
