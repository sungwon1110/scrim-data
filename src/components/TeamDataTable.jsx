import React from "react";
import { calculateTeamStats } from "../utils/calculateTeamStats";

const TeamStatsTable = ({ jsonData, version }) => {
  const teamStats = calculateTeamStats(jsonData);
  console.log(teamStats);
  return (
    <div className="mt-5">
      <h5>팀 지표</h5>
      {teamStats.version === version ? (
        <table className="table">
          <thead>
            <tr>
              <th scope="col">팀</th>
              <th scope="col">바론 킬</th>
              <th scope="col">드래곤 킬</th>
              <th scope="col">전령 킬</th>
              <th scope="col">유충 소환</th>
              <th scope="col">아군 타워 파괴</th>
              <th scope="col">상대 타워 파괴</th>
              <th scope="col">승리</th>
              <th scope="col">총 경기 수</th>
              <th scope="col">승률 (%)</th>
            </tr>
          </thead>
          <tbody>
            {["blue", "red"].map((team) => (
              <tr key={team}>
                <td>{team === "blue" ? "블루팀" : "레드팀"}</td>
                <td>{teamStats[team].baronKills}</td>
                <td>{teamStats[team].dragonKills}</td>
                <td>{teamStats[team].riftHeraldKills}</td>
                <td>{teamStats[team].missionsVoidmitessummoned}</td>
                <td>{teamStats[team].friendlyTurretLost}</td>
                <td>{teamStats[team].turretsKilled}</td>
                <td>{teamStats[team].win}</td>
                <td>{teamStats[team].totalGames}</td>
                <td>{teamStats[team].winRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>해당 버전의 기록이 없습니다</div>
      )}
    </div>
  );
};

export default TeamStatsTable;
