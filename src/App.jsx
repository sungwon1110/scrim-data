import { useState, useEffect } from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import React from "react";
import "./App.css";
import DataTable from "./components/DataTable";
import TeamDataTable from "./components/TeamDataTable";
import RoflDropzone from "./components/RoflDropzone";
import ChampionCompositionAnalysis from "./components/ChampionCompositionAnalysis";
import EnhancedCompositionAnalysis from "./components/EnhancedCompositionAnalysis";
import TeamMatchupAnalysis from "./components/TeamMatchupAnalysis";
import StrategicPatternAnalysis from "./components/StrategicPatternAnalysis";
import TeamGoalsTracker from "./components/TeamGoalsTracker";
import { demoGames } from "./demoData"; // 데모 데이터 가져오기
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { 
  AppBar, Toolbar, Typography, Box, Container, Tabs, Tab, 
  IconButton, Menu, MenuItem, Badge, Drawer, Divider, List, 
  ListItem, ListItemIcon, ListItemText, Button, Paper, Switch, FormControlLabel
} from "@mui/material";
import {
  Menu as MenuIcon,
  DarkMode as DarkModeIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Folder as FolderIcon,
  Upload as UploadIcon,
  Dashboard as DashboardIcon
} from "@mui/icons-material";
import PositionalAnalysis from './components/PositionalAnalysis';

// 다크 테마 설정
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#9c27b0", // 보라색
    },
    secondary: {
      main: "#f50057", // 핑크색
    },
    background: {
      default: "#13131A",
      paper: "#1E1E2F",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Noto Sans KR', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  const [jsonData, setJsonData] = useState([]);
  const [version, setVersion] = useState("15.8");
  const [fileData, setFileData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("dashboard");
  const [selectedGame, setSelectedGame] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [useDemo, setUseDemo] = useState(false); // 데모 데이터 사용 여부
  const [useEnhancedAnalysis, setUseEnhancedAnalysis] = useState(true); // 향상된 분석 사용 여부
  const [gameData, setGameData] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 데모 데이터 사용 여부에 따라 다른 데이터 소스 사용
      if (useDemo) {
        setJsonData(demoGames);
      } else {
        const querySnapshot = await getDocs(collection(db, "scrimData"));
        const fetchedData = [];
        querySnapshot.forEach((doc) => {
          fetchedData.push({ id: doc.id, ...doc.data() });
        });
        setJsonData(fetchedData);
      }
    } catch (e) {
      console.error("데이터 가져오기 실패:", e);
      alert("데이터 가져오기 실패");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [useDemo]); // useDemo 상태가 변경될 때마다 fetchData 실행

  const handleFileChange = (e) => {
    const files = e.target.files;
    const positionOrder = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];

    Array.from(files).forEach((file) => {
      if (file.type === "application/json") {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target.result);
            if (parsed.participants && Array.isArray(parsed.participants)) {
              parsed.participants.sort((a, b) => {
                return (
                  positionOrder.indexOf(a.INDIVIDUAL_POSITION || a.individualPosition) - positionOrder.indexOf(b.INDIVIDUAL_POSITION || b.individualPosition)
                );
              });
            }
            setFileData((prevData) => [...prevData, parsed]);
          } catch (err) {
            console.warn("JSON 파싱 실패:", err);
          }
        };
        reader.readAsText(file);
      } else {
        alert("JSON 파일만 업로드해주세요.");
      }
    });
  };

  const handleRoflFilesProcessed = (processedData) => {
    if (processedData && processedData.length > 0) {
      setFileData((prevData) => [...prevData, ...processedData]);
    }
  };

  const handleSaveData = async () => {
    if (!fileData || fileData.length === 0) {
      alert("JSON 파일을 먼저 업로드하세요!");
      return;
    }
    setIsLoading(true);
    try {
      for (const data of fileData) {
        await addDoc(collection(db, "scrimData"), data);
      }
      alert("모든 데이터 저장 완료!");
      await fetchData(); // 저장 후 데이터 다시 가져오기
      setFileData([]); // 저장 후 파일 데이터 초기화
    } catch (e) {
      console.error("저장 실패:", e);
      alert("저장 실패");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDemo = (event) => {
    setUseDemo(event.target.checked);
  };

  const handleToggleEnhancedAnalysis = (event) => {
    setUseEnhancedAnalysis(event.target.checked);
  };

  const handleViewModeChange = (event, newValue) => {
    setViewMode(newValue);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleGameSelect = (game) => {
    setSelectedGame(game);
    setViewMode('gameAnalysis');
  };

  const handleFilesProcessed = (results) => {
    if (results && results.length > 0) {
      setGameData(results[0]);
    }
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component="div">
          SCRIM DATA
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem button onClick={() => setViewMode('dashboard')}>
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="대시보드" />
        </ListItem>
        <ListItem button onClick={() => setViewMode('individual')}>
          <ListItemIcon><PersonIcon /></ListItemIcon>
          <ListItemText primary="개인 통계" />
        </ListItem>
        <ListItem button onClick={() => setViewMode('team')}>
          <ListItemIcon><PeopleIcon /></ListItemIcon>
          <ListItemText primary="팀 통계" />
        </ListItem>
        <ListItem button onClick={() => setViewMode('patterns')}>
          <ListItemIcon><AssessmentIcon /></ListItemIcon>
          <ListItemText primary="전략 패턴" />
        </ListItem>
        <ListItem button onClick={() => setViewMode('goals')}>
          <ListItemIcon><AssessmentIcon /></ListItemIcon>
          <ListItemText primary="팀 목표" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button onClick={() => setViewMode('upload')}>
          <ListItemIcon><UploadIcon /></ListItemIcon>
          <ListItemText primary="파일 업로드" />
        </ListItem>
        <ListItem button>
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText primary="설정" />
        </ListItem>
      </List>
    </Box>
  );

  const renderContent = () => {
    switch (viewMode) {
      case 'dashboard':
        return (
          <>
            <Typography variant="h5" gutterBottom>
              대시보드
            </Typography>
            {jsonData.length > 0 && (
              <>
                {/* 가장 최신 게임에 대한 분석 */}
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
                  최근 경기 분석
                </Typography>
                <TeamMatchupAnalysis gameData={jsonData[jsonData.length - 1]} />
                
                {/* 향상된 분석 또는 기본 분석 선택 */}
                {useEnhancedAnalysis ? (
                  <EnhancedCompositionAnalysis 
                    gameData={jsonData[jsonData.length - 1]} 
                    allGames={jsonData}
                  />
                ) : (
                  <ChampionCompositionAnalysis 
                    gameData={jsonData[jsonData.length - 1]} 
                  />
                )}
                
                {/* 전략 패턴 분석 (최대 10개의 최신 게임) */}
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
                  전략 패턴 분석
                </Typography>
                <StrategicPatternAnalysis games={jsonData.slice(-10)} />
                
                {/* 팀 목표 추적 */}
                <TeamGoalsTracker games={jsonData} />
              </>
            )}
          </>
        );
      case 'individual':
        return (
          <>
            <Typography variant="h5" gutterBottom>
              개인 통계
            </Typography>
            <DataTable jsonData={jsonData} version={version} />
          </>
        );
      case 'team':
        return (
          <>
            <Typography variant="h5" gutterBottom>
              팀 통계
            </Typography>
            <TeamDataTable jsonData={jsonData} version={version} />
          </>
        );
      case 'gameAnalysis':
        return (
          <>
            <Typography variant="h5" gutterBottom>
              게임 상세 분석
            </Typography>
            {selectedGame && (
              <>
                <TeamMatchupAnalysis gameData={selectedGame} />
                {useEnhancedAnalysis ? (
                  <EnhancedCompositionAnalysis gameData={selectedGame} allGames={jsonData} />
                ) : (
                  <ChampionCompositionAnalysis gameData={selectedGame} />
                )}
              </>
            )}
          </>
        );
      case 'patterns':
        return (
          <>
            <Typography variant="h5" gutterBottom>
              전략 패턴 분석
            </Typography>
            <StrategicPatternAnalysis games={jsonData} />
          </>
        );
      case 'goals':
        return (
          <>
            <Typography variant="h5" gutterBottom>
              팀 목표 추적
            </Typography>
            <TeamGoalsTracker games={jsonData} />
          </>
        );
      case 'upload':
        return (
          <>
            <Typography variant="h5" gutterBottom>
              파일 업로드
            </Typography>
            <RoflDropzone onFilesProcessed={handleRoflFilesProcessed} />
            
            {fileData.length > 0 && (
              <Paper sx={{ p: 2, backgroundColor: '#1E1E2F', color: 'white', mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  업로드된 데이터 ({fileData.length}개)
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveData}
                  disabled={isLoading}
                >
                  {isLoading ? "저장 중..." : "Firebase에 저장"}
                </Button>
              </Paper>
            )}
          </>
        );
      default:
        return <Typography>잘못된 뷰 모드입니다.</Typography>;
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {/* 앱바 */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              SCRIM DATA
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={useDemo}
                    onChange={handleToggleDemo}
                    color="secondary"
                  />
                }
                label="데모 데이터"
                sx={{ mr: 2, color: 'white' }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={useEnhancedAnalysis}
                    onChange={handleToggleEnhancedAnalysis}
                    color="secondary"
                  />
                }
                label="고급 분석"
                sx={{ mr: 2, color: 'white' }}
              />
              <Typography variant="body2" sx={{ mr: 2 }}>
                버전: {version}
              </Typography>
              <IconButton color="inherit">
                <DarkModeIcon />
              </IconButton>
              <IconButton
                color="inherit"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuClick}
              >
                <Badge badgeContent={fileData.length} color="secondary">
                  <FolderIcon />
                </Badge>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => { setViewMode('upload'); handleMenuClose(); }}>
                  파일 업로드
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>설정</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
        
        {/* 사이드 드로어 */}
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // 모바일 성능 향상
          }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* 메인 컨텐츠 */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: '100%',
            minHeight: '100vh',
            backgroundColor: '#121212',
          }}
        >
          <Toolbar /> {/* 앱바 높이만큼 여백 */}
          <Container maxWidth="xl">
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Typography>로딩 중...</Typography>
              </Box>
            ) : (
              <>
                {renderContent()}
                {gameData && (
                  <Box>
                    <PositionalAnalysis gameData={gameData} />
                  </Box>
                )}
              </>
            )}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
