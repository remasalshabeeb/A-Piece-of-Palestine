import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import ExtensionIcon from '@mui/icons-material/Extension';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import API from '../api';
import welcomeImage from '../assets/welcome.png';

const GREEN = '#2D5A27';
const RED = '#C84B31';
const GOLD = '#D4AF37';
const CREAM = '#FDFBF7';
const TEXT = '#2C3E35';
const MUTED = '#8C9A92';

const TOTAL_QUESTIONS = 4;
const TOTAL_PIECES = 4;

// تحويل مسار الصورة إلى رابط يعمل من الخادم.
const getStageImageUrl = (image) => {
  if (!image) return welcomeImage;

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }

  const baseURL = (API.defaults.baseURL || '').replace(/\/api\/?$/, '');
  const imagePath = image.startsWith('/') ? image : `/${image}`;

  return `${baseURL}${imagePath}`;
};

function StageIntro() {
  const { stageId } = useParams();
  const navigate = useNavigate();

  const [stage, setStage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadStage = async () => {
      try {
        setLoading(true);
        setError('');

        const [stagesResponse, questionsResponse, progressResponse] =
          await Promise.all([
            API.get('/stages'),
            API.get(`/stages/${stageId}/questions`),
            API.get(`/progress/stages/${stageId}`),
          ]);

        if (!active) return;

        const stagesData = stagesResponse.data;
        const stages = Array.isArray(stagesData)
          ? stagesData
          : stagesData?.stages || stagesData?.data || [];

        const questionsData = questionsResponse.data;
        const questionsList = Array.isArray(questionsData)
          ? questionsData
          : questionsData?.questions || questionsData?.data || [];

        const currentStage = stages.find(
          (item) => String(item._id) === String(stageId)
        );

        if (!currentStage) {
          setError('لم نتمكن من العثور على هذه المرحلة.');
          return;
        }

        setStage(currentStage);
        setQuestions(questionsList);

        const progressData = progressResponse.data;

        setProgress(
          progressData?.progress ??
            progressData?.data ??
            progressData ??
            null
        );
      } catch (err) {
        if (!active) return;

        console.error('Stage intro loading error:', err);

        setError(
          err.response?.data?.message ||
            'تعذر تحميل معلومات المرحلة. تحققي من اتصال الخادم ثم حاولي مجددًا.'
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    if (!stageId) {
      setError('معرّف المرحلة غير موجود.');
      setLoading(false);
      return undefined;
    }

    loadStage();

    return () => {
      active = false;
    };
  }, [stageId]);

  const getPieceId = (piece) => {
    if (typeof piece === 'string') return piece;

    return piece?.pieceId
      ? String(piece.pieceId)
      : piece?._id
        ? String(piece._id)
        : '';
  };

  const collectedPieces = Array.isArray(progress?.collectedPieces)
    ? progress.collectedPieces
    : [];

  const collectedIds = new Set(
    collectedPieces.map(getPieceId).filter(Boolean)
  );

  const collectedCount = Math.min(
    new Set(collectedPieces.map(getPieceId).filter(Boolean)).size ||
      collectedPieces.length,
    TOTAL_PIECES
  );

  const questionPieceIds = questions
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((question) => getPieceId(question.pieceId))
    .filter(Boolean);

  const isPieceCollected = (index) => {
    const pieceId = questionPieceIds[index];

    if (pieceId && collectedIds.has(pieceId)) {
      return true;
    }

    // بديل عند عدم تطابق معرّفات القطع القادمة من الخادم.
    if (!pieceId || collectedIds.size === 0) {
      return index < collectedCount;
    }

    return false;
  };

  // استخدام صورة المرحلة المرفوعة، أو الصورة الافتراضية عند عدم وجودها.
  const imageUrl = getStageImageUrl(stage?.image);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: CREAM,
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: GREEN }} />

        <Typography sx={{ color: TEXT }}>
          نحضّر لكِ حكاية المرحلة...
        </Typography>
      </Box>
    );
  }

  if (error || !stage) {
    return (
      <Box
        dir="rtl"
        sx={{
          minHeight: '100vh',
          bgcolor: CREAM,
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack spacing={2} sx={{ width: '100%', maxWidth: 500 }}>
          <Alert severity="error">
            {error || 'لم نتمكن من تحميل المرحلة.'}
          </Alert>

          <Button
            variant="contained"
            onClick={() => navigate('/user/dashboard')}
            sx={{
              bgcolor: GREEN,
              '&:hover': { bgcolor: '#21451D' },
            }}
          >
            العودة إلى رحلتي
          </Button>
        </Stack>
      </Box>
    );
  }

  const badgeName =
    stage.badge?.name ||
    stage.badgeName ||
    stage.reward?.badgeName ||
    'وسام إكمال المرحلة';

  return (
    <Box
      dir="rtl"
      sx={{
        minHeight: '100vh',
        bgcolor: CREAM,
        color: TEXT,
        py: { xs: 3, md: 5 },
        px: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1050, mx: 'auto' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/user/dashboard')}
          sx={{
            color: GREEN,
            mb: 3,
            '& .MuiButton-startIcon': { ml: 1, mr: 0 },
          }}
        >
          العودة إلى رحلتي
        </Button>

        {/* بطاقة مقدمة المرحلة وصورتها */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid #E8E4D8',
            overflow: 'hidden',
            mb: 3,
          }}
        >
          <Box
            sx={{
              height: 8,
              bgcolor: GREEN,
            }}
          />

          <Box
            component="img"
            src={imageUrl}
            alt={stage.title}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = welcomeImage;
            }}
            sx={{
              display: 'block',
              width: '100%',
              height: { xs: 220, md: 360 },
              objectFit: 'cover',
              objectPosition: 'center',
              bgcolor: '#E8E6DF',
            }}
          />

          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Chip
              label="حكاية جديدة بانتظارك"
              sx={{
                bgcolor: '#EAF0E5',
                color: GREEN,
                fontWeight: 700,
                mb: 2,
              }}
            />

            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: GREEN,
                mb: 2,
                fontSize: { xs: '1.8rem', md: '2.4rem' },
              }}
            >
              {stage.title}
            </Typography>

            <Typography
              sx={{
                color: TEXT,
                fontSize: '1.05rem',
                lineHeight: 2,
                whiteSpace: 'pre-line',
              }}
            >
              {stage.description ||
                'رحلة جديدة لاكتشاف حكاية من فلسطين. أجيبي عن الأسئلة، واجمعي القطع الأربع لتكملي الصورة.'}
            </Typography>
          </CardContent>
        </Card>

        {/* معلومات المرحلة */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 2,
            mb: 3,
          }}
        >
          <Card
            elevation={0}
            sx={{
              border: '1px solid #E8E4D8',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography sx={{ fontSize: 32 }}>❓</Typography>

              <Typography sx={{ fontWeight: 800, color: GREEN }}>
                {TOTAL_QUESTIONS} أسئلة
              </Typography>

              <Typography variant="body2" sx={{ color: MUTED, mt: 1 }}>
                اختبري معلوماتك
              </Typography>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              border: '1px solid #E8E4D8',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <ExtensionIcon sx={{ fontSize: 32, color: RED }} />

              <Typography sx={{ fontWeight: 800, color: GREEN }}>
                {TOTAL_PIECES} قطع
              </Typography>

              <Typography variant="body2" sx={{ color: MUTED, mt: 1 }}>
                اجمعي القطع لإكمال الصورة
              </Typography>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              border: '1px solid #E8E4D8',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography sx={{ fontSize: 32 }}>🏅</Typography>

              <Typography sx={{ fontWeight: 800, color: GREEN }}>
                وسام الإنجاز
              </Typography>

              <Typography variant="body2" sx={{ color: MUTED, mt: 1 }}>
                {badgeName}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* الأحجية الفلسطينية */}
        <Card
          elevation={0}
          sx={{
            border: '1px solid #E8E4D8',
            borderRadius: 4,
            mb: 3,
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: GREEN,
                mb: 1,
              }}
            >
              أحجيتك الفلسطينية
            </Typography>

            <Typography sx={{ color: MUTED, mb: 3 }}>
              أجيبي عن الأسئلة لفتح قطع الصورة واحدة تلو الأخرى.
            </Typography>

            <Box
              sx={{
                width: '100%',
                maxWidth: 440,
                mx: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 1,
                mb: 3,
              }}
            >
              {[0, 1, 2, 3].map((index) => {
                const unlocked = isPieceCollected(index);

                const positions = [
  'right top',
  'left top',
  'right bottom',
  'left bottom',
];

                return (
                  <Box
                    key={index}
                    sx={{
                      position: 'relative',
                      aspectRatio: '1 / 1',
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: `2px solid ${
                        unlocked ? GOLD : '#D8D8D0'
                      }`,
                      backgroundColor: unlocked
                        ? '#EAF0E5'
                        : '#E8E6DF',
                      backgroundImage: unlocked
                        ? `url("${imageUrl}")`
                        : 'none',
                      backgroundSize: '200% 200%',
                      backgroundPosition: positions[index],
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    {!unlocked && (
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          gap: 1,
                          bgcolor: 'rgba(44, 62, 53, 0.68)',
                          color: '#FFFFFF',
                        }}
                      >
                        <LockIcon sx={{ fontSize: 30 }} />

                        <Typography sx={{ fontWeight: 700 }}>
                          القطعة {index + 1}
                        </Typography>
                      </Box>
                    )}

                    {unlocked && (
                      <Chip
                        label="تم الجمع"
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: 6,
                          right: 6,
                          bgcolor: GREEN,
                          color: '#FFFFFF',
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>

            <Typography
              textAlign="center"
              sx={{
                color: TEXT,
                fontWeight: 700,
              }}
            >
              القطع المجموعة: {collectedCount} من {TOTAL_PIECES}
            </Typography>
          </CardContent>
        </Card>

        {/* بدء المرحلة */}
        <Box sx={{ textAlign: 'center', pb: 3 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrowIcon />}
            onClick={() => navigate(`/user/stages/${stageId}`)}
            sx={{
              px: 5,
              py: 1.5,
              borderRadius: 3,
              bgcolor: GREEN,
              fontWeight: 800,
              fontSize: '1.05rem',
              '&:hover': { bgcolor: '#21451D' },
              '& .MuiButton-startIcon': { ml: 1, mr: 0 },
            }}
          >
            ابدئي المرحلة
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default StageIntro;
